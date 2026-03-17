# Contributing to Mr. Fixer Backend

Before you commit code, follow these steps to ensure quality and consistency.

---

## Pre-commit checklist

- [ ] **Code is written** — complete the feature, fix, or refactor
- [ ] **Lint passes** — run `npm run lint`
- [ ] **Auto-fix applied** — run `npm run lint:fix` to fix formatting issues automatically
- [ ] **Migrations created** — if schema changed, run `npx knex migrate:make <name>` and write up/down functions
- [ ] **Tests pass** — (coming soon)
- [ ] **Commit message clear** — write what changed, not how

---

## Development workflow

### 1. Start the server

```bash
npm run dev
```

This watches for file changes and auto-restarts.

---

### 2. Make your changes

Follow the **Model → Service → Controller → Route** pattern:

```
1. src/models/              ← Database queries (SQL only)
2. src/services/            ← Business logic (validation, combining queries)
3. src/controllers/         ← Handle HTTP (read req, call service, write res)
4. src/routes/              ← Register the URL endpoint
```

Every file has a clear job. Don't mix database queries into controllers—put them in models.

---

### 3. Check for lint errors

```bash
npm run lint
```

If ESLint complains:

| Error | Fix |
|-------|-----|
| `Unexpected console` | Keep `console.log` for debugging; remove before commit |
| `Unexpected var` | Use `const`/`let` instead |
| `=== not ==` | Always use `===` for comparison |
| `unused-vars` | Delete the variable or find where to use it |
| `no-undef` | Check spelling and imports |

**Auto-fix common issues:**

```bash
npm run lint:fix
```

This handles formatting, semicolons, and quotes automatically.

---

### 4. Add a database migration (if needed)

If you're adding a table or column:

```bash
npx knex migrate:make add_bio_to_users
```

Edit the new file in `migrations/`:

```javascript
exports.up = (knex) =>
  knex.schema.alterTable("users", (table) => {
    table.text("bio").nullable();
  });

exports.down = (knex) =>
  knex.schema.alterTable("users", (table) => {
    table.dropColumn("bio");
  });
```

Run it:

```bash
npm run migrate
```

---

### 5. Test your endpoint locally

Use **Postman**, **Thunder Client**, or `curl` to test:

```bash
# Example: POST /api/auth/register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret123","full_name":"Test User","phone":"0812345678"}'
```

Check the response status and body. If something breaks, check:

- [ ] `.env` file has all variables set
- [ ] Database is running and migrated (`npm run migrate`)
- [ ] Server is running (`npm run dev`)
- [ ] Check terminal logs for errors

---

### 6. Seed a test user (optional)

```bash
node scripts/seedUser.js admin@mrfixer.com secret123 "Admin User" 0812345678 admin
```

Get a user you can test with immediately.

---

## Code style rules

- **Variable names:** `camelCase` for variables, `UPPER_CASE` for constants
- **Function names:** `camelCase` for functions, `PascalCase` for classes
- **File names:** `lowercase.js` for files in `src/`, `index` only at root
- **Indentation:** 2 spaces (ESLint enforces this)
- **Comments:** Explain *why*, not *what* (code shows what; comments show intent)

**Good comment:**

```js
// We only return 50 requests to avoid slow queries on large datasets
const requests = await BookingModel.getAllrequest(db, provider_id, { limit: 50 });
```

**Bad comment:**

```js
// Get all requests
const requests = await BookingModel.getAllrequest(db, provider_id);
```

---

## Debugging tips

### See detailed logs

Add logs near the problem:

```js
console.log("Auth middleware: token =", token);
console.log("Auth middleware: decoded =", decoded);
```

Then check the terminal where `npm run dev` is running.

### Check what the database has

Connect to MySQL:

```bash
mysql -u root -p mr_fixer_db
SELECT * FROM users;
```

### Check your environment variables

```bash
cat .env | grep DB_
```

Make sure `.env` has all the variables from `.env.example`.

---

## Common mistakes to avoid

| Mistake | Why bad | How to fix |
|---------|---------|-----------|
| Query logic in controller | Controllers get bloated; hard to reuse | Move SQL to models |
| Ignoring error in catch block | Errors go silent; hard to debug | Always log or re-throw |
| Mixing `var`, `let`, `const` | Confusing scope rules | Always use `const` by default |
| Comparing with `==` instead of `===` | Can cause type coercion bugs | Always use `===` |
| Unused variables | Clutters code; confuses juniors | Delete or use them |
| No comment on why - only what | Code is self-documenting | Add a comment explaining intent |

---

## Questions?

Check the `README.md` in this folder for:

- Route reference
- Project structure diagram
- Setup instructions
- How to deploy to Vercel

---

## Before you push

```bash
# 1. Lint
npm run lint

# 2. Auto-fix any issues
npm run lint:fix

# 3. Test the endpoint
# (use Postman or curl)

# 4. Commit with a clear message
git add .
git commit -m "feat: add user bio field"

# 5. Push to your branch
git push origin your-branch-name
```

Then open a pull request on GitHub.

---

Happy coding! 🎉
