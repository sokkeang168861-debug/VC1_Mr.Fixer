# Quick Deployment Checklist

Copy this checklist and follow it before pushing to production.

---

## Pre-deployment

- [ ] **Create cloud database** — PlanetScale, AWS RDS, or similar
  - [ ] Database created
  - [ ] Connection string obtained
  - [ ] Credentials noted (host, user, password, database name)

- [ ] **Code is ready**
  - [ ] `npm run lint` passes (zero errors/warnings)
  - [ ] All migrations in `migrations/` folder
  - [ ] Latest migration created (test locally first)

- [ ] **Git is clean**
  - [ ] `git status` shows no uncommitted changes
  - [ ] All changes committed
  - [ ] Ready to push

---

## Vercel setup (one-time)

- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Click "New Project"
- [ ] Import your GitHub repository
- [ ] **Add environment variables** (before clicking Deploy):

| Variable | Example |
|----------|---------|
| `DB_HOST` | `xxxx.us-east-3.psdb.cloud` |
| `DB_PORT` | `3306` |
| `DB_USER` | `xxxxxx` |
| `DB_PASSWORD` | `pscale_pw_xxxxx` |
| `DB_NAME` | `mr_fixer` |
| `JWT_SECRET` | (generate below) |
| `FRONTEND_URL` | `https://my-app.vercel.app` |

Generate `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- [ ] Set environment variables for **Production**, **Preview**, **Development**
- [ ] Click "Deploy"
- [ ] Wait for deployment (2–3 min)

---

## Post-deployment (one-time)

After Vercel deployment finishes:

- [ ] **Run migrations** (from your local machine):

```bash
cd backend

# Create temporary .env with cloud database credentials
cat > .env.production << 'EOF'
DB_HOST=xxxx.us-east-3.psdb.cloud
DB_PORT=3306
DB_USER=xxxxxx
DB_PASSWORD=pscale_pw_xxxxx
DB_NAME=mr_fixer
EOF

# Run migrations
npx knex migrate:latest --env production

# Clean up
rm .env.production
```

- [ ] **Test the API**:

```bash
curl -X POST https://my-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","full_name":"Test","phone":"0812345678"}'
```

Should return a token.

- [ ] **Check the frontend** — visit `https://my-app.vercel.app` in browser

- [ ] **Optional: Seed a test user**

```bash
DB_HOST=xxxx.us-east-3.psdb.cloud \
DB_PORT=3306 \
DB_USER=xxxxxx \
DB_PASSWORD=pscale_pw_xxxxx \
DB_NAME=mr_fixer \
npm run seed -- --env production
```

---

## Future deployments (automatic)

After the first deployment, Vercel will automatically redeploy whenever you push to `main`:

```bash
# Make your changes
git add .
git commit -m "fix: something"
git push origin main

# Vercel auto-deploys (2-3 min)
# Check status at vercel.com
```

**If you add a new migration:**

```bash
git add .
git commit -m "db: add bio column to users"
git push origin main

# After Vercel finishes deploying (wait 2-3 min):
npx knex migrate:latest --env production
```

---

## Common issues

| Problem | Solution |
|---------|----------|
| "Cannot connect to DB" | Check `DB_HOST`, `DB_USER`, `DB_PASSWORD` in Vercel settings |
| "Table not found" | Run migrations (see above) |
| "Port 3307 refused" | Change `DB_PORT` to `3306` (Vercel default) |
| "SQL syntax error" | Check migration files in `migrations/` folder |
| "Need to roll back" | Run `npx knex migrate:rollback --env production` (careful!) |

---

## Full guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed explanations.

---

## Typical timeline

| Step | Time |
|------|------|
| Create cloud database | 5 min |
| Set up Vercel project | 10 min |
| Initial deployment | 3 min |
| Run migrations | 2 min |
| Test API | 3 min |
| **Total** | **~25 min** |

---

**Questions?** See [DEPLOYMENT.md](./DEPLOYMENT.md) or ask your mentor.
