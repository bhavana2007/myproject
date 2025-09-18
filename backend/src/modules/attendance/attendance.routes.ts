import { Router } from 'express';
import { prisma } from '../../config/prisma.js';
import { requireAuth, AuthRequest } from '../../middlewares/auth.js';
import { z } from 'zod';

export const attendanceRouter = Router();

// In-memory store for session PINs. Replace with DB field if persistence is required.
const sessionPins = new Map<string, string>();

const sessionSchema = z.object({
  classId: z.string(),
  date: z.string(), // ISO
  periodNo: z.number().int().min(1).max(10),
  startTime: z.string(), // ISO
  endTime: z.string(), // ISO
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().optional(),
});

attendanceRouter.post('/sessions', requireAuth(['FACULTY', 'ADMIN']), async (req, res) => {
  const parsed = sessionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;
  
  const created = await prisma.session.create({
    data: {
      classId: data.classId,
      date: new Date(data.date),
      periodNo: data.periodNo,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      radius: data.radius || 100, // Default 100m radius
    },
  });
  return res.json(created);
});

// Faculty: generate a 4-digit PIN for a session
attendanceRouter.post('/sessions/:id/generate-pin', requireAuth(['FACULTY', 'ADMIN']), async (req, res) => {
  const sessionId = req.params.id;
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.status !== 'OPEN') return res.status(400).json({ error: 'Session is not open' });
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  sessionPins.set(sessionId, pin);
  return res.json({ sessionId, pin });
});

// Faculty: read the current PIN (for display). Do NOT expose to students via public API in production.
attendanceRouter.get('/sessions/:id/pin', requireAuth(['FACULTY', 'ADMIN']), async (req, res) => {
  const sessionId = req.params.id;
  const pin = sessionPins.get(sessionId);
  if (!pin) return res.status(404).json({ error: 'PIN not set for this session' });
  return res.json({ sessionId, pin });
});

const markSchema = z.object({
  sessionId: z.string(),
  // pin removed from required payload
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']).default('PRESENT'),
  method: z.enum(['FACE', 'BIOMETRIC', 'MANUAL']).default('MANUAL'),
  latitude: z.number(),
  longitude: z.number(),
});

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

attendanceRouter.post('/mark', requireAuth(['STUDENT']), async (req: AuthRequest, res) => {
  const parsed = markSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { sessionId, status, method, latitude, longitude } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { student: true } });
  if (!user?.student) return res.status(404).json({ error: 'Student profile not found' });

  // Get session details
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.status !== 'OPEN') return res.status(400).json({ error: 'Session is closed' });

  // PIN check removed

  // Verify location (if session has location data)
  if (session.latitude && session.longitude && session.radius) {
    const distance = calculateDistance(latitude, longitude, session.latitude, session.longitude);
    if (distance > session.radius) {
      return res.status(400).json({ 
        error: `You are ${Math.round(distance)}m away from the class location. Maximum allowed: ${session.radius}m` 
      });
    }
  }

  const record = await prisma.attendanceRecord.upsert({
    where: { sessionId_studentId: { sessionId, studentId: user.student.id } },
    update: { 
      status, 
      method, 
      latitude, 
      longitude 
    },
    create: { 
      sessionId, 
      studentId: user.student.id, 
      status, 
      method, 
      latitude, 
      longitude 
    },
  });
  return res.json(record);
});


