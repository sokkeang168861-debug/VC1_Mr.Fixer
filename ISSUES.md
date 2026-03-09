# Mr. Fixer — Production Readiness Issues

This document lists all problems found in the codebase that must be fixed before the project is production-ready. Issues are grouped by severity.

---

## 🔴 Critical — Will Break in Production

### 1. Missing `.env` file and `.env.example`

**File:** (root of the project — does not exist yet)

**Problem:**  
The API base URL depends on an environment variable `VITE_API_BASE_URL`. There is no `.env` file and no `.env.example` to document what variables are needed. Without the variable set, the app silently falls back to `http://localhost:5000` — which is your local machine and will **not work** once deployed.

**Fix:**

1. Create a `.env` file in the project root:

   ```
   VITE_API_BASE_URL=http://localhost:5000
   ```

2. Create a `.env.example` file (safe to commit, no real secrets):

   ```
   VITE_API_BASE_URL=https://your-backend-domain.com
   ```

3. Add `.env` to `.gitignore` so real secrets are never committed.

---

### 2. Broken Custom Font Class — `font-display` is Undefined

**File:** `src/index.css`

**Problem:**  
The class `font-display` is used in many components (LoginPage, SignupPage, Navbar, Home, etc.), but the CSS variable `--font-display` is **never defined** inside `@theme`. Tailwind v4 only generates utility classes for variables you define. This means every heading that uses `font-display` is rendering in the browser default font instead of your intended design font.

Compare: `--font-sans` is defined, so `font-sans` works. `--font-display` is missing.

**Fix:**  
In `src/index.css`, inside the `@theme` block, add a definition for `--font-display`:

```css
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Inter", ui-sans-serif, system-ui, sans-serif; /* add this line */
  --color-primary: #8B5CF6;
  --color-primary-dark: #7C3AED;
  --color-primary-light: #F5F3FF;
}
```

(Adjust the font family to whatever display font you want to use.)

---

### 3. Broken Hover Color — `primary-hover` is Undefined

**File:** `src/pages/components/Navbar.jsx` (Sign Up button, line ~49)

**Problem:**  
The Sign Up button uses `hover:bg-primary-hover`, but `--color-primary-hover` is **never defined** in `@theme`. Tailwind v4 cannot generate this utility class, so the hover effect on the button does nothing.

The existing theme defines `--color-primary-dark`, which is likely what was intended.

**Fix:**  
In `src/pages/components/Navbar.jsx`, change:

```jsx
hover:bg-primary-hover
```

to:

```jsx
hover:bg-primary-dark
```

Or alternatively, add `--color-primary-hover` to `@theme` in `src/index.css`.

---

### 4. Page Title is a Placeholder

**File:** `index.html` (line 7)

**Problem:**  
The browser tab and search engine results show **"frontend"** — this is the default Vite scaffold title and was never updated.

**Fix:**  
In `index.html`, change:

```html
<title>frontend</title>
```

to:

```html
<title>Mr. Fixer — Home Services On Demand</title>
```

---

## 🟠 Functional Bugs — Features That Don't Work

### 5. Sign Up Button Missing `type="submit"`

**File:** `src/features/auth/SignupPage.jsx` (the final submit button)

**Problem:**  
The Sign Up button doesn't have `type="submit"`. While modern browsers often default to submit, this is unreliable. This can cause the form to **not submit** in certain environments and is a common source of "my form doesn't work" bugs.

**Fix:**  
Find the Sign Up submit button and add the type attribute:

```jsx
<button type="submit" className="w-full bg-primary ...">
  Sign Up
</button>
```

---

### 6. Contact Form Does Nothing on Submit

**File:** `src/pages/Contact.jsx`

**Problem:**  
The contact form (`<form className="space-y-8">`) has **no `onSubmit` handler**. Clicking "Send Message" either reloads the page or does nothing — the form data is never sent anywhere.

**Fix:**  

1. Add a `handleSubmit` function to the component.
2. Attach it: `<form onSubmit={handleSubmit} className="space-y-8">`.
3. Add `e.preventDefault()` inside the handler.
4. Call the API or at minimum show a success/error message to the user.

---

### 7. Dashboard Navigation Links Point to Undefined Routes

**Files:**

- `src/features/dashboard/admin/AdminNavbar.jsx` → links to `/dashboard/admin/users`
- `src/features/dashboard/customer/CustomerNavbar.jsx` → links to `/dashboard/customer/orders`
- `src/features/dashboard/fixer/FixerNavbar.jsx` → links to `/dashboard/fixer/jobs`

**Problem:**  
These links appear in the dashboard navbars but the corresponding routes are **never registered** in `src/app/AppRoutes.jsx`. Clicking them renders a blank page.

**Fix — Option A (recommended):** Add the missing routes in `AppRoutes.jsx`:

```jsx
<Route path="/dashboard/admin/users" element={
  <ProtectedRoute requiredRole="admin"><AdminUsersPage /></ProtectedRoute>
} />
```

Create the corresponding page components.

**Fix — Option B (temporary):** Remove the broken links from the navbars until the pages are built.

---

### 8. No 404 Page — Unknown URLs Show a Blank Screen

**File:** `src/app/AppRoutes.jsx`

**Problem:**  
There is no catch-all route. If a user navigates to any URL that isn't defined (e.g. `/dashboard/admin/users` from issue #7, or a mistyped URL), they see a **completely blank page** with no navigation.

**Fix:**  
Add a wildcard route at the bottom of the `<Routes>` block in `AppRoutes.jsx`:

```jsx
<Route path="*" element={<NotFoundPage />} />
```

Create a simple `NotFoundPage` component that shows a "Page Not Found" message with a link back to home.

---

### 9. "Continue with Google" Button Does Nothing

**File:** `src/features/auth/LoginPage.jsx`

**Problem:**  
The Google OAuth button has no `onClick` handler attached. Clicking it does nothing. Either implement OAuth or remove the button to avoid confusing users.

**Fix — Option A:** Remove the button if OAuth is not part of the project scope.  
**Fix — Option B:** Implement Google OAuth using a library and attach the handler.

---

### 10. "Forgot Password?" is a Dead Link

**File:** `src/features/auth/LoginPage.jsx`

**Problem:**  
`<a href="#">Forgot Password?</a>` — `href="#"` scrolls to the top of the page. There is no forgot-password flow.

**Fix — Option A:** Remove the link if the feature is not planned.  
**Fix — Option B:** Create a `/forgot-password` route and page, then change the link to `<Link to="/forgot-password">`.

---

## 🟡 Build & Configuration Issues

### 11. `vite.config.js` Has No API Proxy for Development

**File:** `vite.config.js`

**Problem:**  
There is no `server.proxy` configured. This means in development, all API calls go to whatever `VITE_API_BASE_URL` is set to. If the env variable is missing or wrong, calls silently hit `localhost:5000` — and CORS errors may appear if the backend URL differs.

**Fix:**  
Add a dev proxy to `vite.config.js` so `/api` calls are forwarded to the backend without needing a full URL in every request:

```js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

Then update `VITE_API_BASE_URL` to `/api` in your `.env`.

---

### 12. Google Fonts Loaded via `@import` (Render-Blocking)

**File:** `src/index.css` (line 1)

**Problem:**  

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
```

CSS `@import` for external fonts is **render-blocking** — the browser cannot render the page until this network request completes. It also fails in offline or restricted network environments.

**Fix:**  
Move the Google Fonts link into `index.html` using `<link rel="preconnect">` and `<link rel="stylesheet">`, and remove the `@import` from `index.css`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

---

## 🔵 Security Awareness (Understand, Don't Necessarily Change)

### 13. JWT is Decoded Client-Side Without Signature Verification

**File:** `src/app/ProtectedRoute.jsx`

**What the code does:**

```js
const payload = JSON.parse(atob(token.split(".")[1]));
if (requiredRole && payload.role !== requiredRole) { ... }
```

The token payload is decoded using `atob()` (Base64) to read the `role`. **This is normal and acceptable in React** — you cannot verify the JWT signature in a browser without the secret key (which must never be exposed to the client).

**What you MUST ensure:** The backend **always** verifies the JWT signature on every protected API endpoint. The client-side role check is only for UX (redirecting the user). Security is enforced by the server.

**Action:** Review your backend to confirm every `/dashboard` API route validates the token before returning data.

---

## Summary Checklist

| # | File | Issue | Priority |
|---|------|-------|----------|
| 1 | `.env` / `.env.example` | Missing — API URL defaults to localhost | 🔴 Critical |
| 2 | `src/index.css` | `--font-display` not defined | 🔴 Critical |
| 3 | `src/pages/components/Navbar.jsx` | `primary-hover` color not defined | 🔴 Critical |
| 4 | `index.html` | Title is "frontend" | 🔴 Critical |
| 5 | `src/features/auth/SignupPage.jsx` | Submit button missing `type="submit"` | 🟠 Functional |
| 6 | `src/pages/Contact.jsx` | Form has no submit handler | 🟠 Functional |
| 7 | `**/dashboard/**Navbar.jsx` | Nav links point to undefined routes | 🟠 Functional |
| 8 | `src/app/AppRoutes.jsx` | No 404 catch-all route | 🟠 Functional |
| 9 | `src/features/auth/LoginPage.jsx` | Google button has no handler | 🟠 Functional |
| 10 | `src/features/auth/LoginPage.jsx` | Forgot Password is a dead link | 🟠 Functional |
| 11 | `vite.config.js` | No dev server proxy configured | 🟡 Build |
| 12 | `src/index.css` | Google Fonts loaded via blocking `@import` | 🟡 Build |
| 13 | `src/app/ProtectedRoute.jsx` | JWT decoded client-side (understand the risk) | 🔵 Security |
