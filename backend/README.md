# Disaster Alert Backend

Production-ready Express API with Prisma (PostgreSQL), JWT auth, and clean architecture.

## Setup

1. Copy `.env.example` to `.env` and set:
   - `DATABASE_URL` – PostgreSQL connection string
   - `JWT_SECRET` – strong secret for signing tokens
   - `JWT_EXPIRES_IN` – e.g. `7d` (optional)

2. Install and generate Prisma client:
   ```bash
   npm install
   npx prisma generate
   ```

3. Push schema to the database:
   ```bash
   npx prisma db push
   ```
   Or use migrations: `npm run db:migrate`

4. Start the server:
   ```bash
   npm run dev
   ```
   Or production: `npm start`

## API

### Health
- **GET** `/api/health` – Health check (DB status, uptime).

### Auth
- **POST** `/api/auth/register` – Body: `{ name, email, password [, role, agencyId ] }`. Returns `{ token, user }`.
- **POST** `/api/auth/login` – Body: `{ email, password }`. Returns `{ token, user }`.

Use the token in the `Authorization` header: `Bearer <token>`.

### User profile (all require `Authorization: Bearer <token>`)
- **GET** `/api/users/me` – Current user.
- **PUT** `/api/users/me` – Body: `{ name }`.
- **PUT** `/api/users/password` – Body: `{ currentPassword, newPassword }`.
- **PUT** `/api/users/deactivate` – Deactivate account.

### Training system

**Trainings** (query: `?disasterType=&difficulty=&agencyId=`)
- **GET** `/api/trainings` – List (filtered). **GET** `/api/trainings/:id` – Detail (assessment choices without `isCorrect`).
- **POST** `/api/trainings` – Create (ADMIN/AGENCY). **PUT** `/api/trainings/:id` – Update. **DELETE** `/api/trainings/:id` – Delete.
- **GET** `/api/trainings/:id/admin` – Full detail including correct answers (ADMIN/AGENCY).

**Lessons** (ordered per training)
- **GET** `/api/trainings/:trainingId/lessons` – List. **GET** `/api/trainings/lessons/:id` – One.
- **POST** `/api/trainings/:trainingId/lessons` – Create (ADMIN/AGENCY). **PUT** / **DELETE** `/api/trainings/lessons/:id` – Update/delete.

**User progress** (JWT required)
- **GET** `/api/user-progress` – My progress. **GET** `/api/user-progress/:trainingId` – One.
- **PUT** `/api/user-progress/:trainingId` – Body: `{ completedLessons }`. Auto sets `progressPercent` and marks status **COMPLETED** when all lessons done.

**Assessments & results**
- **GET** `/api/assessments/training/:trainingId` – Get assessment for a training (for taking).
- **POST** `/api/assessments/:assessmentId/submit` – Body: `{ answers: [{ questionId, choiceId }, ...] }` (JWT). Auto-scores and creates **Result** (`score`, `passed`, `takenAt`).
- **GET** `/api/assessments/my/results` – My results. **GET** `/api/assessments/results/:id` – One result (own or ADMIN).
- **GET** `/api/assessments/:assessmentId/results` – List results for assessment (ADMIN/AGENCY).
- Assessment CRUD: **POST** `/api/assessments`, **GET** / **PUT** / **DELETE** `/api/assessments/:id` (ADMIN/AGENCY).
- Questions: **GET** / **POST** `/api/assessments/:assessmentId/questions`, **GET** / **PUT** / **DELETE** `/api/assessments/questions/:id` (ADMIN/AGENCY).
- Choices: **POST** `/api/assessments/choices`, **GET** / **PUT** / **DELETE** `/api/assessments/choices/:id` (ADMIN/AGENCY).

**Certificates** (JWT)
- **GET** `/api/certificates` – My certificates. **GET** `/api/certificates/:trainingId` – One.
- **POST** `/api/certificates/:trainingId/issue` – Body: `{ certificateUrl? }`. Allowed only when training is **COMPLETED** and latest assessment **passed**; unique per user+training.

**Announcements** (read: all; write: ADMIN)
- **GET** `/api/announcements`, **GET** `/api/announcements/:id` – List / one.
- **POST** / **PUT** / **DELETE** `/api/announcements`, `/api/announcements/:id` – Create/update/delete (ADMIN).

**FAQ** (read: all; write: ADMIN)
- **GET** `/api/faqs`, **GET** `/api/faqs/:id` – List / one.
- **POST** / **PUT** / **DELETE** `/api/faqs`, `/api/faqs/:id` – Create/update/delete (ADMIN).

**Contact messages** (submit: anyone; read: ADMIN)
- **POST** `/api/contact-messages` – Body: `{ name, email, message }` (optional JWT to attach user).
- **GET** `/api/contact-messages`, **GET** `/api/contact-messages/:id` – List / one (ADMIN).
- **PATCH** `/api/contact-messages/:id/read` – Mark read (ADMIN).

**Risk layers** (read: all; write: ADMIN)
- **GET** `/api/risk-layers` – List. **GET** `/api/risk-layers?type=FLOOD|LANDSLIDE|EVAC_ROUTE` – Filter by type. **GET** `/api/risk-layers/:id` – One.
- **POST** / **PUT** / **DELETE** `/api/risk-layers`, `/api/risk-layers/:id` – Create/update/delete (ADMIN). Body: `{ type, name?, geojson }`.

## Using `requireRole`

For admin/agency-only routes, use after `verifyToken`:

```js
const { verifyToken } = require('./middleware/verifyToken');
const { requireRole } = require('./middleware/requireRole');

router.get('/admin-only', verifyToken, requireRole('ADMIN'), adminController.get);
router.get('/agency-only', verifyToken, requireRole('ADMIN', 'AGENCY'), agencyController.get);
```

## Structure

- `src/app.js` – Express app, middleware, routes.
- `src/server.js` – HTTP server entry.
- `src/routes/` – Route definitions.
- `src/controllers/` – Request/response handling.
- `src/services/` – Business logic.
- `src/middleware/` – Error handler, 404, verifyToken, requireRole.
- `src/lib/prisma.js` – Prisma client singleton.
- `src/utils/` – AppError, toSafeUser.
