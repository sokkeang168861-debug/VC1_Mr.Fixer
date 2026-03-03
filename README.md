# VC1_Mr.Fixer

## Project Structure

- `frontend/`: React + Vite client app
  - `src/app/`: App shell and route composition
  - `src/features/`: Feature-first UI modules
    - `auth/pages/`: Authentication pages
    - `frontpage/components/`: Shared frontpage UI blocks
    - `frontpage/pages/`: Public frontpage route screens
  - `src/shared/api/`: Reusable API client setup

- `backend/`: Express API server
  - `src/server.js`: Process entrypoint
  - `src/app.js`: Express app setup and middleware
  - `src/config/`: Infrastructure config (DB connection)
  - `src/controllers/`: Route handlers
  - `src/routes/`: Route definitions

## Run Apps

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```
