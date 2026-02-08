# Disaster Alert – Deployment Guide

This guide covers deploying the **frontend** (Next.js PWA) to **Vercel**, the **backend** (Express) to **Render** or **Railway**, and **PostgreSQL** to **Supabase**.

---

## 1. Supabase (PostgreSQL)

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → Database**, copy the **Connection string** (URI). Use the **Transaction** pooler for serverless (e.g. Render/Railway):
   - Format: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
3. (Optional) For direct connection: use port **5432** and the non-pooler host.

### Environment variable (for backend)

| Variable       | Description                          |
|----------------|--------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string (pooler or direct) |

### Migrations

From your machine or CI, run against the production DB:

```bash
cd backend
DATABASE_URL="postgresql://..." npx prisma migrate deploy
# or to sync schema without migrations:
DATABASE_URL="postgresql://..." npx prisma db push
```

---

## 2. Backend (Render or Railway)

### 2.1 Render

1. **New → Web Service**; connect the repo and set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm ci && npx prisma generate`
   - **Start Command:** `npx prisma migrate deploy && node src/server.js`  
     (or `node src/server.js` if you run migrations separately)
   - **Node version:** set in **Environment** as `NODE_VERSION=20` (or 18).

2. **Environment** (Render dashboard):

   | Variable | Value |
   |----------|--------|
   | `NODE_ENV` | `production` |
   | `PORT` | (auto-set by Render) |
   | `DATABASE_URL` | Supabase connection string (from 1) |
   | `JWT_SECRET` | Strong random secret (e.g. `openssl rand -hex 32`) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CORS_ORIGIN` | `https://your-frontend.vercel.app` (comma-separated if multiple) |
   | `RATE_LIMIT_WINDOW_MS` | `900000` (15 min) |
   | `RATE_LIMIT_MAX` | `100` |
   | `BODY_LIMIT` | `256kb` (optional) |
   | `DISASTER_ALERTS_FEED_URL` | (optional) RSS/API URL for alerts |
   | `DISASTER_ALERTS_CRON_SCHEDULE` | `*/15 * * * *` (optional) |

3. Deploy. Note the backend URL (e.g. `https://your-app.onrender.com`).

### 2.2 Railway

1. **New Project → Deploy from GitHub**; select repo and set **Root Directory** to `backend`.
2. **Settings → Build:**
   - Build Command: `npm ci && npx prisma generate`
   - Start Command: `npx prisma migrate deploy; node src/server.js` (or `node src/server.js` only)
3. **Variables** – add the same keys as in the Render table above. Railway sets `PORT` automatically.
4. Deploy and copy the public URL.

### Production build/start (backend)

- **Build:** `npm ci && npx prisma generate`
- **Start:** `node src/server.js`  
  Run migrations once (e.g. in CI or manually): `npx prisma migrate deploy`

---

## 3. Frontend (Vercel)

1. **Import** the repo at [vercel.com](https://vercel.com); set **Root Directory** to `frontend`.
2. **Build & Development:**
   - **Build Command:** `npm run build`
   - **Output Directory:** (default `.next` for Next.js)
   - **Install Command:** `npm ci`

3. **Environment variables:**

   | Variable | Value |
   |----------|--------|
   | `NEXT_PUBLIC_API_URL` | Backend base URL (e.g. `https://your-app.onrender.com`) |

4. Deploy. Vercel will assign a URL (e.g. `https://your-project.vercel.app`).

5. **PWA:** Add `public/icon-192.png` and `public/icon-512.png` for install icons. Optional: set **Start URL** in manifest if you use a custom domain.

### Production build/start (frontend)

- **Build:** `npm run build`
- **Start:** `npm start` (or use Vercel’s default for Next.js)

---

## 4. Environment variable checklist

### Backend (Render/Railway)

- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` (Supabase)
- [ ] `JWT_SECRET` (strong, unique)
- [ ] `JWT_EXPIRES_IN` (e.g. `7d`)
- [ ] `CORS_ORIGIN` (frontend URL; comma-separated for multiple)
- [ ] `RATE_LIMIT_WINDOW_MS` (optional)
- [ ] `RATE_LIMIT_MAX` (optional)
- [ ] `DISASTER_ALERTS_FEED_URL` (optional)
- [ ] `DISASTER_ALERTS_CRON_SCHEDULE` (optional)

### Frontend (Vercel)

- [ ] `NEXT_PUBLIC_API_URL` (backend base URL)

### Supabase

- [ ] Database URL copied into `DATABASE_URL` for backend

---

## 5. Post-deploy

1. Set backend **CORS_ORIGIN** to the exact Vercel (and custom) frontend URL(s).
2. Ensure Supabase allows connections from Render/Railway IPs (usually allowed by default for pooler).
3. Test: `GET https://your-backend-url/api/health` and login from the frontend.

---

## 6. Postman collection

Use the included `postman/DisasterAlert-API.json` for all major APIs. Set collection variables:

- `baseUrl`: backend base URL (e.g. `https://your-app.onrender.com`)
- `token`: JWT from `POST /api/auth/login` (for protected routes)
