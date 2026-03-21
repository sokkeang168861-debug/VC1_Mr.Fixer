# Mr. Fixer

A service marketplace connecting customers with skilled fixers.
Built with React + Vite (frontend) and Node.js + Express + MySQL (backend).

---

## Project structure

```text
/
├── frontend/       React + Vite client app
└── backend/        Express REST API + MySQL
```

See `backend/README.md` for full backend setup, API routes, and development guide.

## VPS deployment (Nginx + PM2 + auto deploy)

If you want to host frontend and backend on the same server with Nginx and PM2,
and auto-deploy from the `dev` branch, follow:

- `DEPLOY_NGINX_PM2_DEV.md`

---

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env   # fill in your DB credentials and JWT secret
npm install
npm run mig            # run database migrations
npm run dev            # starts on http://localhost:5001
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_DEV_BACKEND_URL=http://localhost:5001
npm install
npm run dev            # starts on http://localhost:5173
```
