# Mr. Fixer

A service marketplace connecting customers with skilled fixers.
Built with React + Vite (frontend) and Node.js + Express + MySQL (backend).

---

## Project structure

```
/
├── frontend/       React + Vite client app
├── backend/        Express REST API + MySQL
└── vercel.json     Deployment config (Vercel)
```

See `backend/README.md` for full backend setup, API routes, and development guide.

---

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env   # fill in your DB credentials and JWT secret
npm install
npm run mig            # run database migrations
npm run dev            # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_API_URL=http://localhost:5000
npm install
npm run dev            # starts on http://localhost:5173
```
