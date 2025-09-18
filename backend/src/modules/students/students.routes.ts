import { Router, type Response, type Request } from 'express';
import { prisma } from '../../config/prisma.js';
import { requireAuth, AuthRequest } from '../../middlewares/auth.js';
import { z } from 'zod';

export const studentsRouter = Router();

studentsRouter.get('/me', requireAuth(['STUDENT']), async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { student: true } });
  if (!user?.student) return res.status(404).json({ error: 'Student profile not found' });
  return res.json({
    id: user.student.id,
    regNo: user.student.regNo,
    name: user.student.name,
    year: user.student.year,
    branch: user.student.branch,
    section: user.student.section,
    email: user.email,
  });
});

const trim = (s: unknown) => (typeof s === 'string' ? s.trim() : s);
const nameSchema = z.preprocess(
  trim,
  z
    .string()
    .min(1, 'Name is required')
    .regex(/^[A-Za-z .'-]{2,60}$/u, 'Name can contain letters and basic punctuation only')
);
const yearSchema = z
  .preprocess(trim, z.string())
  .regex(/^[1-4]$/u, 'Year must be 1, 2, 3, or 4');
const branchSchema = z
  .preprocess(trim, z.string())
  .regex(/^[A-Za-z&. ]{2,30}$/u, 'Branch should be alphabetic (2-30 chars)');
const sectionSchema = z
  .preprocess(trim, z.string())
  .regex(/^[A-Z]$/u, 'Section must be a single uppercase letter (A-Z)');

const updateSchema = z.object({
  name: nameSchema.optional(),
  year: yearSchema.optional(),
  branch: branchSchema.optional(),
  section: sectionSchema.optional(),
});

studentsRouter.put('/me', requireAuth(['STUDENT']), async (req: AuthRequest & Request, res: Response) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const userId = req.user!.userId;
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { student: true } });
  if (!user?.student) return res.status(404).json({ error: 'Student profile not found' });
  const updated = await prisma.student.update({ where: { id: user.student.id }, data: parsed.data });
  return res.json(updated);
});


