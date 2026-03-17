# Frontend Architecture (Junior Friendly)

This project is organized by responsibility. Start from `src/main.jsx` and follow the flow below.

## Request Flow

1. `src/main.jsx` boots React.
2. `src/app/App.jsx` loads the router.
3. `src/app/AppRoutes.jsx` declares all routes.
4. Route layouts and guards decide what wrapper/page is shown.
5. Feature/page components call APIs through `src/api/httpClient.js`.

## Folder Guide

- `src/app/`: App shell and routing glue.
  - `components/ScrollToTop.jsx`: reset scroll on route change.
  - `layouts/PublicLayout.jsx`: navbar + footer wrapper for public pages.
  - `routes/publicRoutes.jsx`: public page route definitions.
  - `routes/dashboardRoutes.jsx`: dashboard route definitions.
  - `ProtectedRoute.jsx`: role-based access control.
- `src/features/`: Domain features (auth, dashboards).
- `src/pages/`: Public pages (Home, Services, Contact).
- `src/api/`: HTTP setup and request interceptor.
- `src/lib/`: Small shared utilities (`auth.js`).
- `src/config/`: Constants (`routes.js`).

## Rules For New Code

- Add shared constants in `src/config/`.
- Put reusable helpers in `src/lib/`.
- Put domain-specific UI in `src/features/<domain>/`.
- Use `@/...` imports (no deep `../../..` chains).
- Keep route wiring in route files, not in page components.

## Quick Examples

### Add a new public page

1. Create page component in `src/pages/`.
2. Add route path to `src/config/routes.js`.
3. Add `{ path, component }` to `src/app/routes/publicRoutes.jsx`.

### Add a new protected dashboard page

1. Create component under `src/features/dashboard/...`.
2. Add/extend route in `src/app/routes/dashboardRoutes.jsx`.
3. If role-protected, wrap with `ProtectedRoute` in `src/app/AppRoutes.jsx`.

## Why This Is Simpler

- Routing is split into small files with single purpose.
- Layout logic is isolated (no repeated navbar/footer markup).
- Auth/session checks are centralized.
- New developers can locate where to change code quickly.
