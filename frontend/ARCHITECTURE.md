# Frontend Architecture

Start here:

1. `src/main.jsx` mounts React.
2. `src/app/App.jsx` loads the app router.
3. `src/app/AppRoutes.jsx` maps URLs to pages.
4. Pages call the backend through `src/api/httpClient.js`.

## Main Folders

- `src/app/`: app-level files like routing, 404 page, and route protection.
- `src/pages/`: actual screens grouped by area: `frontpage`, `auth`, `customer`, `fixer`, `admin`.
- `src/api/`: axios client setup.
- `src/config/`: shared constants such as route paths.
- `src/lib/`: shared helpers such as auth, session, and asset URL helpers.
- `src/assets/`: static files used by the app.

## Important Files

- `src/app/AppRoutes.jsx`: all routes live here.
- `src/app/ProtectedRoute.jsx`: blocks pages by role.
- `src/config/routes.js`: central route names and helpers.
- `src/api/httpClient.js`: shared API client.
- `src/lib/auth.js`: token helpers.
- `src/lib/session.js`: logout/session cleanup.

## Rules For New Code

- Add routes in `src/config/routes.js` first.
- Reuse `httpClient` instead of creating new fetch logic.
- Put shared helpers in `src/lib/`.
- Use `@/...` imports when the path is shared across folders.
- Keep page-specific UI inside its page area under `src/pages/`.

## Common Tasks

### Add a new page

1. Create the page under the correct folder in `src/pages/`.
2. Add the path to `src/config/routes.js` if it needs a named route.
3. Register the page in `src/app/AppRoutes.jsx`.

### Add a new protected page

1. Create the page.
2. Add the route.
3. Wrap it with `ProtectedRoute` in `src/app/AppRoutes.jsx`.

## Mental Model

- `app` decides where users can go.
- `pages` decide what users see.
- `api` and `lib` handle shared logic.
