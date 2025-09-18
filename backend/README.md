Setup

1) Copy `.env.example` to `.env` and edit values
2) `npm install`
3) `npx prisma generate`
4) `npx prisma migrate dev --name init`
5) `npm run dev`

Environment variables (.env)

```
PORT=4000
CORS_ORIGIN=*
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE?schema=public"
JWT_ACCESS_SECRET=replace-with-long-random
JWT_REFRESH_SECRET=replace-with-long-random
```

Health & base

- GET `/` → simple message
- GET `/health` → `{ ok: true }`

Key endpoints

- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/reset-password`
- POST `/auth/refresh`
- GET `/students/me` (Bearer token)
- PUT `/students/me` (Bearer token)
- POST `/attendance/sessions` (faculty/admin)
- POST `/attendance/mark` (student)

Flutter integration (summary)

- After student registration screen, call POST `/auth/register` with role STUDENT and student fields
- Then call POST `/auth/login` to receive tokens
- Save `accessToken`; send in `Authorization: Bearer <token>` for protected calls
- To show profile on dashboard, call GET `/students/me` with token and display returned fields

