# Fullstack Deployment Guide For `Test-Deploy` on AWS EC2

This guide shows how to deploy this project on one AWS EC2 server with:

- frontend
- backend
- MySQL database
- Nginx
- PM2

It is written specifically for testing the `Test-Deploy` branch before merging into `dev`.

## What you will deploy

This project will run like this on EC2:

- Nginx serves the frontend on port `80`
- backend runs on port `5000`
- MySQL runs locally on port `3306`
- Nginx proxies `/api` and `/socket.io` to the backend

Users will only access:

- `http://your-ec2-public-ip/`

They should not access:

- `http://your-ec2-public-ip:5000`
- `http://your-ec2-public-ip:3306`

## Before you start

You need:

- an AWS account
- an EC2 Ubuntu server
- your `.pem` SSH key
- your Git repo URL
- this branch pushed to GitHub as `Test-Deploy`

## Recommended EC2 setup

When creating the EC2 instance:

- AMI: Ubuntu 22.04 LTS
- Instance type: `t3.small` or better
- Storage: 20 GB or more

## Security group rules

Allow:

- `22` from your IP only
- `80` from anywhere

Do not allow:

- `5000`
- `3306`

Those two should stay private on the server.

## Step 1: Connect to EC2

From your local machine:

```bash
ssh -i /path/to/your-key.pem ubuntu@your-ec2-public-ip
```

If your EC2 username is not `ubuntu`, replace it with the correct one.

## Step 2: Update the server and install packages

Run:

```bash
sudo apt update
sudo apt install -y nginx git curl mysql-server
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

Check installed versions:

```bash
node -v
npm -v
mysql --version
pm2 -v
nginx -v
```

## Step 3: Start and secure MySQL

Enable MySQL:

```bash
sudo systemctl enable --now mysql
```

Check status:

```bash
sudo systemctl status mysql
```

Optional but recommended:

```bash
sudo mysql_secure_installation
```

If prompted, you can:

- set a root password if you want
- remove anonymous users
- disallow remote root login
- remove test database

## Step 4: Create the database and database user

Open MySQL:

```bash
sudo mysql
```

Run these SQL commands:

```sql
CREATE DATABASE mr_fixer_db;
CREATE USER 'mrfixer_user'@'localhost' IDENTIFIED BY 'change_this_to_a_strong_password';
GRANT ALL PRIVILEGES ON mr_fixer_db.* TO 'mrfixer_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

What this does:

- creates the app database
- creates a dedicated MySQL user for this project
- gives that user access only from the EC2 server itself

## Step 5: Test MySQL login

Run:

```bash
mysql -u mrfixer_user -p
```

Enter the password you created.

Then test:

```sql
SHOW DATABASES;
USE mr_fixer_db;
EXIT;
```

If this works, your DB setup is ready.

## Step 6: Clone the project

Create the app directory and clone the repo:

```bash
sudo mkdir -p /var/www
sudo chown -R "$USER":"$USER" /var/www
cd /var/www
git clone <YOUR_REPO_URL> mrfixer
cd mrfixer
git fetch origin
git checkout Test-Deploy
git pull --ff-only origin Test-Deploy
```

If the branch is not available locally yet:

```bash
git fetch origin Test-Deploy
git checkout -b Test-Deploy origin/Test-Deploy
```

## Step 7: Create the backend environment file

Move into the backend folder:

```bash
cd /var/www/mrfixer/backend
cp .env.example .env
nano .env
```

Use this template:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=mrfixer_user
DB_PASSWORD=change_this_to_a_strong_password
DB_NAME=mr_fixer_db

JWT_SECRET=replace_this_with_a_long_random_secret
FRONTEND_URL=http://your-ec2-public-ip
```

Important notes:

- `PORT=5000` is fine on EC2
- `DB_HOST=localhost` means the backend connects to MySQL on the same server
- `JWT_SECRET` must be set or the backend will fail to start
- `FRONTEND_URL` should match the exact public URL you use in the browser

Protect the file:

```bash
chmod 600 /var/www/mrfixer/backend/.env
```

## Step 8: Install backend dependencies

Run:

```bash
cd /var/www/mrfixer/backend
npm ci
```

If this fails, fix it before continuing.

## Step 9: Run database migrations

Run:

```bash
cd /var/www/mrfixer/backend
npx knex migrate:latest --env production --knexfile knexfile.js
```

This creates the project tables in MySQL.

If you want to confirm tables were created:

```bash
mysql -u mrfixer_user -p mr_fixer_db
```

Then inside MySQL:

```sql
SHOW TABLES;
EXIT;
```

## Step 10: Install and build the frontend

Run:

```bash
cd /var/www/mrfixer/frontend
npm ci
npm run build
```

This creates the production build in:

- `frontend/dist`

## Step 11: Start the backend with PM2

Move back to the project root:

```bash
cd /var/www/mrfixer
```

Start the backend:

```bash
pm2 startOrReload deploy/pm2/ecosystem.config.cjs --env production --update-env
pm2 save
pm2 startup
```

`pm2 startup` will print one extra command.
Run that extra command once.

Then verify:

```bash
pm2 status
pm2 logs mrfixer-backend --lines 50
```

## Step 12: Test backend health directly

Before setting up Nginx, test the backend:

```bash
curl http://127.0.0.1:5000/api/health
```

You should get JSON like:

```json
{
  "status": "ok"
}
```

The actual response also includes `environment` and `timestamp`.

If this fails, fix the backend before continuing.

## Step 13: Configure Nginx

Copy the repo config:

```bash
sudo cp /var/www/mrfixer/deploy/nginx/mrfixer.conf /etc/nginx/sites-available/mrfixer
sudo ln -sf /etc/nginx/sites-available/mrfixer /etc/nginx/sites-enabled/mrfixer
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

This config already handles:

- frontend static files
- `/api/`
- `/socket.io/`

## Step 14: Test through the public EC2 IP

Run on the server:

```bash
curl http://your-ec2-public-ip/api/health
```

Then open in your browser:

- `http://your-ec2-public-ip/`
- `http://your-ec2-public-ip/api/health`

If the app homepage loads and `/api/health` returns JSON, your basic deployment is working.

## Step 15: Use the deploy script for future updates

Once the first deployment is working, future updates for this branch are easier.

Run:

```bash
cd /var/www/mrfixer
APP_DIR=/var/www/mrfixer BRANCH=Test-Deploy bash deploy/scripts/deploy-dev.sh
```

This script will:

- fetch the latest code
- checkout `Test-Deploy`
- pull the branch
- run backend install
- run DB migrations
- run frontend build
- restart PM2
- check `http://127.0.0.1:5000/api/health`

## Step 16: What to test after deployment

After deployment, test these carefully:

- homepage loads
- login works
- signup works if used in your flow
- customer dashboard pages load
- fixer pages load
- admin pages load if applicable
- booking creation works
- booking confirmation and rejection work
- realtime notifications work
- profile image updates work
- map and location features work

## Useful commands

Check PM2:

```bash
pm2 status
pm2 logs mrfixer-backend --lines 100
```

Restart backend manually:

```bash
cd /var/www/mrfixer
pm2 restart mrfixer-backend
```

Check Nginx:

```bash
sudo nginx -t
sudo systemctl status nginx
```

Check MySQL:

```bash
sudo systemctl status mysql
mysql -u mrfixer_user -p mr_fixer_db
```

Check open listener ports:

```bash
sudo ss -tulpn
```

Check backend health:

```bash
curl http://127.0.0.1:5000/api/health
curl http://your-ec2-public-ip/api/health
```

## Troubleshooting

## Problem: backend does not start

Check:

```bash
pm2 logs mrfixer-backend --lines 100
```

Common causes:

- missing `JWT_SECRET`
- wrong database password
- MySQL not running
- migrations not run

## Problem: MySQL connection failed

Check:

```bash
sudo systemctl status mysql
mysql -u mrfixer_user -p
```

Also confirm `.env` values are correct:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

## Problem: frontend opens but API fails

Check:

```bash
curl http://127.0.0.1:5000/api/health
sudo nginx -t
sudo systemctl status nginx
```

## Problem: websocket or realtime does not work

Check:

- Nginx has the latest repo config
- Nginx was reloaded after config changes
- backend is healthy
- you are using the correct public URL in the browser

## Problem: 502 Bad Gateway

Usually this means Nginx cannot reach the backend.

Check:

```bash
pm2 status
curl http://127.0.0.1:5000/api/health
```

## Optional: GitHub Actions auto-deploy later

For testing this branch first, manual deploy is simpler.

If later you want auto-deploy, you can adjust:

- `.github/workflows/deploy-dev.yml`

But for first testing on `Test-Deploy`, manual deploy is safer.

## After testing is successful

When you are happy with `Test-Deploy`, merge it into `dev`:

```bash
git checkout dev
git pull --ff-only origin dev
git merge Test-Deploy
git push origin dev
```

After that, your normal `dev` deployment flow can be used.
