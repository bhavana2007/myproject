import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { authRouter } from './modules/auth/auth.routes';
import { studentsRouter } from './modules/students/students.routes';
import { attendanceRouter } from './modules/attendance/attendance.routes';

dotenv.config();

export const createApp = () => {
  const app = express();
  const origin = process.env.CORS_ORIGIN || '*';

  app.use(helmet());
  app.use(cors({ origin, credentials: true }));
  app.use(express.json());

  app.get('/', (_req, res) => res.send('API is running. Try /health'));
  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/auth', authRouter);
  app.use('/students', studentsRouter);
  app.use('/attendance', attendanceRouter);

  // Error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
  });

  return app;
};


