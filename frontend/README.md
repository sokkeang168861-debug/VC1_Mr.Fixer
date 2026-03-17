# Mr. Fixer Frontend (React + Vite)

This project is the frontend for the Mr. Fixer platform, built with React and Vite.

For project structure and onboarding, see `ARCHITECTURE.md`.

## Quick Start

1. Install dependencies:

```bash
npm install
```

1. Create `.env` in the project root:

```bash
VITE_API_BASE_URL=/api
VITE_DEV_BACKEND_URL=http://localhost:5000
VITE_DEV_HOST=0.0.0.0
VITE_DEV_PORT=5173
VITE_PREVIEW_HOST=0.0.0.0
VITE_PREVIEW_PORT=4173
VITE_BUILD_SOURCEMAP=false
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
VITE_UPLOADS_BASE_URL=/uploads
```

Notes:

- `VITE_API_BASE_URL=/api` works with the Vite dev proxy.
- `VITE_DEV_BACKEND_URL` should point to the backend in local development.
- `VITE_DEV_HOST`, `VITE_DEV_PORT`, `VITE_PREVIEW_HOST`, and `VITE_PREVIEW_PORT` control the Vite dev/preview server binding.
- `VITE_BUILD_SOURCEMAP=false` keeps production builds smaller unless you explicitly need sourcemaps.
- `VITE_GOOGLE_MAPS_API_KEY` is required for the fixer job map view.
- `VITE_UPLOADS_BASE_URL=/uploads` keeps uploaded images working behind the same backend.
- `VITE_BASE_PATH` is optional. Only set it if you deploy under a subpath such as `/mrfixer/`.

1. Start development server:

```bash
npm run dev
```

1. Build for production:

```bash
npm run build
```

1. Preview production build:

```bash
npm run preview
```

## NPM Scripts

- `npm run dev`: Start Vite dev server
- `npm run build`: Create production build in `dist/`
- `npm run preview`: Preview built app locally
- `npm run lint`: Run ESLint

## Production Deployment Notes

### Deploy at domain root

- No extra config is needed.
- Run `npm run build`.

### Deploy at subpath

- Build with `VITE_BASE_PATH=/mrfixer/ npm run build`.

### Static-only local serving (Live Server)

- Use a relative base only for this case:

```bash
VITE_BASE_PATH=./ npm run build
```

- This solves asset loading from `dist/index.html` under local static servers.
- For SPA routing behavior, use `npm run preview` or a host with rewrite rules.
