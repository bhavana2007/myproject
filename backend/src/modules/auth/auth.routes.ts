import { Router, type Request, type Response } from 'express';
import { prisma } from '../../config/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

export const authRouter = Router();

// Common field schemas
const trim = (s: unknown) => (typeof s === 'string' ? s.trim() : s);
const nameSchema = z.preprocess(
  trim,
  z
    .string()
    .min(1, 'Name is required')
    .regex(/^[A-Za-z .'-]{2,60}$/u, 'Name can contain letters and basic punctuation only'),
);
const phoneSchema = z.preprocess(
  trim,
  z.string().regex(/^\d{10}$/u, 'Phone must be exactly 10 digits'),
);
const regNoSchema = z.preprocess(
  trim,
  z.string().regex(/^[A-Za-z0-9\-\/]{5,20}$/u, 'Invalid registration number format'),
);
const yearSchema = z.preprocess(
  trim,
  z.string().regex(/^[1-4]$/u, 'Year must be 1, 2, 3, or 4'),
);
const branchSchema = z.preprocess(
  trim,
  z.string().regex(/^[A-Za-z&. ]{2,30}$/u, 'Branch should be alphabetic (2-30 chars)'),
);
const sectionSchema = z.preprocess(
  trim,
  z.string().regex(/^[A-Z]$/u, 'Section must be a single uppercase letter (A-Z)'),
);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['STUDENT', 'FACULTY', 'ADMIN']).default('STUDENT'),
  student: z
    .object({
      regNo: regNoSchema,
      name: nameSchema,
      phone: phoneSchema,
      year: yearSchema,
      branch: branchSchema,
      section: sectionSchema,
    })
    .optional(),
  faculty: z
    .object({
      name: nameSchema,
      department: z.preprocess(
        trim,
        z.string().regex(/^[A-Za-z&. ]{2,40}$/u, 'Department should be alphabetic (2-40 chars)'),
      ),
    })
    .optional(),
});

authRouter.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password, role, student, faculty } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { email, passwordHash, role } });
    if (role === 'STUDENT' && student) {
      await tx.student.create({ data: { userId: user.id, ...student } });
    }
    if (role === 'FACULTY' && faculty) {
      await tx.faculty.create({ data: { userId: user.id, ...faculty } });
    }
    return user;
  });

  return res.json({ id: created.id, email: created.email, role: created.role });
});

// Allow login by either email+password or regNo+phone
const loginSchema = z
  .object({
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    regNo: regNoSchema.optional(),
    phone: phoneSchema.optional(),
  })
  .refine((d) => (d.email && d.password) || (d.regNo && d.phone), {
  message: 'Provide email+password or regNo+phone',
});

authRouter.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password, regNo, phone } = parsed.data as any;

  let user = null as any;
  if (email && password) {
    user = await prisma.user.findUnique({ where: { email }, include: { student: true, faculty: true } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  } else if (regNo && phone) {
    const student = await prisma.student.findUnique({ where: { regNo }, include: { user: true } });
    if (!student || student.phone !== phone) return res.status(401).json({ error: 'Invalid credentials' });
    user = await prisma.user.findUnique({ where: { id: student.userId }, include: { student: true } });
  }

  const access = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_ACCESS_SECRET || 'dev', {
    expiresIn: '15m',
  });
  const refresh = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_REFRESH_SECRET || 'dev', {
    expiresIn: '7d',
  });

  return res.json({
    accessToken: access,
    refreshToken: refresh,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      student: user.student,
      faculty: user.faculty,
    },
  });
});

// Simple password reset using regNo + phone
const resetSchema = z.object({ regNo: regNoSchema, phone: phoneSchema, newPassword: z.string().min(6) });

authRouter.post('/reset-password', async (req: Request, res: Response) => {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { regNo, phone, newPassword } = parsed.data;
  const student = await prisma.student.findUnique({ where: { regNo }, include: { user: true } });
  if (!student || student.phone !== phone) return res.status(401).json({ error: 'Verification failed' });
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: student.userId }, data: { passwordHash } });
  return res.json({ ok: true });
});

// PIN verification: validate regNo + 4-digit pin equals last 4 of phone
const pinSchema = z.object({
  regNo: regNoSchema,
  pin: z.preprocess(trim, z.string().regex(/^\d{4}$/u, 'PIN must be 4 digits')),
});

authRouter.post('/verify-pin', async (req: Request, res: Response) => {
  const parsed = pinSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { regNo, pin } = parsed.data as { regNo: string; pin: string };
  const student = await prisma.student.findUnique({ where: { regNo } });
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const expected = student.phone.slice(-4);
  const ok = expected === pin;
  if (!ok) return res.status(401).json({ error: 'Invalid PIN' });
  return res.json({ ok: true });
});

authRouter.post('/refresh', async (req: Request, res: Response) => {
  const token = req.body.refreshToken as string | undefined;
  if (!token) return res.status(400).json({ error: 'Missing refreshToken' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'dev') as { userId: string; role: string };
    const access = jwt.sign({ userId: decoded.userId, role: decoded.role }, process.env.JWT_ACCESS_SECRET || 'dev', {
      expiresIn: '15m',
    });
    return res.json({ accessToken: access });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});


