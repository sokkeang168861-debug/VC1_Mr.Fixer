# Mr. Fixer Frontend (React + Vite)

This project is the frontend for the Mr. Fixer platform, built with React and Vite.

For project structure and onboarding, see `ARCHITECTURE.md`.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in the project root:

```bash
VITE_API_BASE_URL=/api
VITE_DEV_BACKEND_URL=http://localhost:5000
VITE_DEV_HOST=0.0.0.0
VITE_DEV_PORT=5173
VITE_PREVIEW_HOST=0.0.0.0
VITE_PREVIEW_PORT=4173
VITE_BUILD_SOURCEMAP=false
```

3. Create mode files:

`.env.development`

```bash
VITE_BASE_PATH=/
```

`.env.production`

```bash
VITE_BASE_PATH=/
```

4. Start development server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

6. Preview production build:

```bash
npm run preview
```

## Ground-Up Vite Setup (From Scratch)

If you want to recreate this project foundation from zero:

1. Create app with Vite:

```bash
npm create vite@latest frontend -- --template react
cd frontend
```

2. Install runtime dependencies:

```bash
npm install react-router-dom axios lucide-react react-icons motion chart.js react-chartjs-2
```

3. Install dev dependencies:

```bash
npm install -D eslint @eslint/js globals eslint-plugin-react-hooks eslint-plugin-react-refresh @vitejs/plugin-react tailwindcss @tailwindcss/postcss
```

4. Enable path alias `@`:

- `vite.config.js`: map `@` to `./src`
- `jsconfig.json`: map `@/*` to `src/*`

5. Add environment variable:

- `VITE_API_BASE_URL` for app API base path (default `/api`)
- `VITE_DEV_BACKEND_URL` for local dev proxy target
- `VITE_BASE_PATH` for production deploy base path

## Refactored Architecture

```text
src/
	api/
		httpClient.js          # Axios instance + auth header interceptor
	app/
		App.jsx                # App entry component
		AppRoutes.jsx          # Router and page layouts
		ProtectedRoute.jsx     # Auth + role guarding
	config/
		routes.js              # Centralized route constants
	lib/
		auth.js                # Token/session helpers and role redirects
	features/
		auth/
		dashboard/
	pages/
		components/
```

## Key Refactor Principles Used

- Centralized route paths in `src/config/routes.js`.
- Centralized token/session logic in `src/lib/auth.js`.
- Replaced repeated localStorage logic in pages with shared helpers.
- Added Vite alias support (`@`) to reduce fragile relative imports.
- Kept dashboard role gating via `ProtectedRoute`.

## NPM Scripts

- `npm run dev`: Start Vite dev server
- `npm run build`: Create production build in `dist/`
- `npm run preview`: Preview built app locally
- `npm run lint`: Run ESLint

## Production Deployment Notes

### Deploy at domain root

- Use `.env.production` with `VITE_BASE_PATH=/`.
- Run `npm run build`.

### Deploy at subpath (example `/mrfixer/`)

- Set `VITE_BASE_PATH=/mrfixer/` in `.env.production`.
- Run `npm run build`.

### Static-only local serving (Live Server)

- Use relative base only for this case:

```bash
VITE_BASE_PATH=./ npm run build
```

- This solves asset loading from `dist/index.html` under local static servers.
- For SPA routing behavior, use `npm run preview` or a host with rewrite rules.
