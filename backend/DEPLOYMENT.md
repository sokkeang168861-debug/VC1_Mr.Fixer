# Deploying to Vercel

This guide walks you through deploying Mr. Fixer to Vercel (frontend + backend + database).

---

## Part 1: Set up a cloud database

Vercel is **serverless** — it doesn't run a persistent MySQL server. You need a cloud database.

### Option A: PlanetScale (recommended for MySQL)

[PlanetScale](https://planetscale.com) is MySQL-compatible and has a free tier.

1. **Create a PlanetScale account** — go to planetscale.com, sign up
2. **Create a database** — click "Create database", name it `mr_fixer`
3. **Get credentials** — go to "Overview" → "Connect" → "Node.js"
   - Copy the connection string (looks like `mysql://user:pass@host/db`)
4. **Extract variables** — parse the URL to get:

   ```
   Host:     xxxx.us-east-3.psdb.cloud
   Username: xxxxxx
   Password: pscale_pw_xxxxx
   Database: mr_fixer
   ```

### Option B: AWS RDS

If you prefer AWS:

1. Go to [RDS console](https://console.aws.amazon.com/rds)
2. Create a MySQL database instance
3. Wait for it to be "Available" (10–15 min)
4. Get the endpoint (looks like `mrfixer.xxxxx.us-east-1.rds.amazonaws.com`)
5. Know your username, password, and database name

---

## Part 2: Set up Vercel project

### 1. Push to GitHub

```bash
git add .
git commit -m "prepare for vercel deployment"
git push origin main
```

### 2. Import into Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repo
4. Click "Import"

### 3. Set environment variables

Before clicking "Deploy", add your database credentials:

In the **Environment Variables** section, add:

```
KEY                   VALUE
──────────────────────────────────────────────────────────────
DB_HOST               xxxx.us-east-3.psdb.cloud
DB_PORT               3306
DB_USER               xxxxxx
DB_PASSWORD           pscale_pw_xxxxx
DB_NAME               mr_fixer
JWT_SECRET            (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
FRONTEND_URL          https://your-app.vercel.app
```

Check "Environments" — set all three (Production, Preview, Development):

- [x] Production
- [x] Preview
- [x] Development

### 4. Deploy

Click "Deploy" and wait ~2–3 min.

---

## Part 3: Run database migrations

After deployment, you need to create tables. You can do this two ways:

### Option A: One-time via local machine

```bash
# From your local machine
cd backend

# Create .env.vercel with your cloud database credentials
cat > .env.vercel << 'EOF'
DB_HOST=xxxx.us-east-3.psdb.cloud
DB_PORT=3306
DB_USER=xxxxxx
DB_PASSWORD=pscale_pw_xxxxx
DB_NAME=mr_fixer
EOF

# Run migrations against the cloud database
npx knex migrate:latest --env production
```

Then delete `.env.vercel`:

```bash
rm .env.vercel
```

### Option B: Automatic via GitHub Action

Create `.github/workflows/migrate-on-deploy.yml`:

```yaml
name: Run migrations on deploy

on:
  workflow_dispatch:  # Manual trigger
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: |
          cd backend
          npm install

      - name: Run migrations
        run: |
          cd backend
          npx knex migrate:latest
        env:
          DB_HOST: ${{ secrets.DB_HOST }}
          DB_PORT: ${{ secrets.DB_PORT }}
          DB_USER: ${{ secrets.DB_USER }}
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
          DB_NAME: ${{ secrets.DB_NAME }}
```

Then add secrets to GitHub:

1. Go to your repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each variable:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`

---

## Part 4: Seed data (optional)

Use Knex seed files to insert test data.

### Run seeds manually

```bash
# From your local machine
cd backend

# Create .env.vercel (same as above)

# Run seeds
DB_HOST=xxxx DB_USER=xxx DB_PASSWORD=xxx DB_NAME=mr_fixer npm run seed -- --env production

# Clean up
rm .env.vercel
```

Or use a GitHub Action to seed automatically after migrations (add to the workflow):

```yaml
      - name: Seed database
        run: |
          cd backend
          npm run seed -- --env production
        env:
          DB_HOST: ${{ secrets.DB_HOST }}
          DB_PORT: ${{ secrets.DB_PORT }}
          DB_USER: ${{ secrets.DB_USER }}
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
          DB_NAME: ${{ secrets.DB_NAME }}
```

---

## Part 5: Test the deployment

### Check the API works

```bash
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test","phone":"0812345678"}'
```

Expected response:

```json
{ "message": "User created", "token": "...", "role": "customer", ... }
```

### Check the frontend works

Visit `https://your-app.vercel.app` in your browser. You should see the app.

### Check database has tables

```bash
# Connect to your cloud database
mysql -h xxxx.us-east-3.psdb.cloud -u xxxxxx -p mr_fixer
> SHOW TABLES;
> SELECT * FROM users;
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to database" | Check that `DB_HOST`, `DB_USER`, `DB_PASSWORD` are set in Vercel environment |
| "Table doesn't exist" | Run migrations manually (Option A above) |
| "Port 3307 refused" | Vercel can't use custom ports; use the default port for your database provider |
| "Module not found: mysql2" | Run `npm install` before deploying |
| "Migration already ran" | Knex tracks migrations; safe to run again |

---

## Next: GitHub Actions for continuous deployment

Once your deployment works, you can set up GitHub Actions to:

- Run migrations automatically when you push to main
- Seed test data
- Run lint checks before deployment

This prevents accidental schema mismatches between your local database and production.

---

## Environment variables checklist

**Before you deploy, make sure you have:**

- [ ] Cloud database created (PlanetScale, AWS RDS, etc.)
- [ ] `DB_HOST` value (your database host)
- [ ] `DB_PORT` value (usually 3306)
- [ ] `DB_USER` value (database username)
- [ ] `DB_PASSWORD` value (database password)
- [ ] `DB_NAME` value (database name)
- [ ] `JWT_SECRET` generated (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] `FRONTEND_URL` set to your Vercel domain
- [ ] All 8 variables added to Vercel's environment settings

---

## Example: Complete deployment workflow

```bash
# 1. Create cloud database (PlanetScale, AWS RDS, etc.)

# 2. Commit code
cd /home/khid/dev/mentor/VC1_Mr.Fixer
git add .
git commit -m "ready for vercel"
git push origin main

# 3. Open vercel.com → import → add env vars → deploy

# 4. After deploy succeeds, run migrations from local machine
cd backend
npx knex migrate:latest --env production

# 5. Test the API
curl https://your-app.vercel.app/api/auth/register

# 6. Done! Your app is live
```
