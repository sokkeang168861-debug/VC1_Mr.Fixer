# Mr. Fixer Frontend (React + Vite)

This project is the frontend for the Mr. Fixer platform, built with React and Vite.

For a quick code map, see `ARCHITECTURE.md`.

## Quick Start

1. Install dependencies:

```bash
npm install
```

1. Create your local env file:

```bash
cp .env.example .env
```

1. Update `.env` if needed:

- `VITE_DEV_BACKEND_URL` should point to your backend.
- `VITE_GOOGLE_MAPS_API_KEY` is required for the fixer job map.
- `VITE_BASE_PATH` is optional and only needed for subpath deploys.

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

## Deployment

- Domain root: run `npm run build`.
- Subpath: run `VITE_BASE_PATH=/mrfixer/ npm run build`.
- Static local serving only: run `VITE_BASE_PATH=./ npm run build`.

- Use `npm run preview` for checking the production build locally.
