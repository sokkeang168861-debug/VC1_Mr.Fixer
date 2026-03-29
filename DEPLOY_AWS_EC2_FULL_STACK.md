# Deploy Frontend + Backend + MySQL on AWS EC2

Goal: run this project on one AWS EC2 Ubuntu server with:

- `frontend` served by Nginx
- `backend` managed by PM2
- `MySQL` running on the same EC2 instance

This guide uses the project structure and deployment files already in this repo.

## Architecture

Your EC2 server will run:

- Nginx on port `80`
- Node.js backend on port `5000`
- MySQL on port `3306` locally on the server

Traffic flow:

1. browser opens `http://your-ec2-ip/`
2. Nginx serves the built frontend
3. Nginx forwards `/api` and `/socket.io` to the backend
4. backend connects to MySQL on `localhost`

## 1. Create the EC2 instance

Recommended:

- Ubuntu 22.04 LTS
- at least `t2.small` or `t3.small`
- 20 GB storage or more

In the EC2 Security Group, allow:

- `22` from your IP only
- `80` from anywhere

Do not expose:

- `5000`
- `3306`

## 2. Connect to the server

```bash
ssh -i /path/to/your-key.pem ubuntu@your-ec2-public-ip
```

## 3. Install system packages

```bash
sudo apt update
sudo apt install -y nginx git curl mysql-server
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

Check versions:

```bash
node -v
npm -v
mysql --version
pm2 -v
nginx -v
```

## 4. Configure MySQL

Start and enable MySQL:

```bash
sudo systemctl enable --now mysql
```

Open MySQL:

```bash
sudo mysql
```

Inside MySQL, create the database and app user:

```sql
CREATE DATABASE mr_fixer_db;
CREATE USER 'mrfixer_user'@'localhost' IDENTIFIED BY 'change_this_password';
GRANT ALL PRIVILEGES ON mr_fixer_db.* TO 'mrfixer_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Optional security hardening:

```bash
sudo mysql_secure_installation
```

## 5. Clone the project

```bash
sudo mkdir -p /var/www
sudo chown -R "$USER":"$USER" /var/www
cd /var/www
git clone <YOUR_REPO_URL> mrfixer
cd mrfixer
git checkout Test-Deploy
```

If you want to deploy another branch, replace `Test-Deploy` with that branch name.

## 6. Create backend environment file

```bash
cd /var/www/mrfixer/backend
cp .env.example .env
nano .env
```

Use values like this:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=mrfixer_user
DB_PASSWORD=change_this_password
DB_NAME=mr_fixer_db

JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://your-ec2-public-ip
```

Important:

- `JWT_SECRET` is required
- `FRONTEND_URL` should match the exact URL you open in the browser
- keep `.env` private

Protect the file:

```bash
chmod 600 /var/www/mrfixer/backend/.env
```

## 7. Install dependencies and run migrations

Backend:

```bash
cd /var/www/mrfixer/backend
npm ci
npx knex migrate:latest --env production --knexfile knexfile.js
```

Frontend:

```bash
cd /var/www/mrfixer/frontend
npm ci
npm run build
```

## 8. Start the backend with PM2

From the project root:

```bash
cd /var/www/mrfixer
pm2 startOrReload deploy/pm2/ecosystem.config.cjs --env production --update-env
pm2 save
pm2 startup
```

Run the extra command printed by `pm2 startup` once.

Verify PM2:

```bash
pm2 status
pm2 logs mrfixer-backend --lines 50
```

## 9. Configure Nginx

Copy the repo config:

```bash
sudo cp /var/www/mrfixer/deploy/nginx/mrfixer.conf /etc/nginx/sites-available/mrfixer
sudo ln -sf /etc/nginx/sites-available/mrfixer /etc/nginx/sites-enabled/mrfixer
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

This config already supports:

- frontend static files
- `/api/` proxying to backend
- `/socket.io/` websocket proxying

## 10. Verify the deployment

Check backend from the server:

```bash
curl http://127.0.0.1:5000/api/health
```

Check through Nginx:

```bash
curl http://your-ec2-public-ip/api/health
```

Open in browser:

- `http://your-ec2-public-ip/`
- `http://your-ec2-public-ip/api/health`

Expected health response:

```json
{
  "status": "ok"
}
```

## 11. Use the repo deploy script for updates

After the first deployment, you can update the app with:

```bash
cd /var/www/mrfixer
APP_DIR=/var/www/mrfixer BRANCH=Test-Deploy bash deploy/scripts/deploy-dev.sh
```

If you deploy `dev` instead:

```bash
cd /var/www/mrfixer
APP_DIR=/var/www/mrfixer BRANCH=dev bash deploy/scripts/deploy-dev.sh
```

## 12. Optional GitHub Actions auto-deploy

If you want GitHub to deploy automatically, use:

- `.github/workflows/deploy-dev.yml`

Create these repository secrets:

- `VPS_HOST`
- `VPS_USER`
- `VPS_PORT`
- `VPS_SSH_KEY`
- `DEPLOY_PATH`

Then either:

- push to `dev` with the current workflow, or
- temporarily change the workflow branch to `Test-Deploy` for testing

## Common problems

## Backend does not start

Check:

```bash
pm2 logs mrfixer-backend --lines 100
```

Possible causes:

- missing `JWT_SECRET`
- wrong MySQL username/password
- MySQL service not running
- migrations not applied

## MySQL connection fails

Check:

```bash
sudo systemctl status mysql
mysql -u mrfixer_user -p -D mr_fixer_db
```

## Frontend loads but API fails

Check:

```bash
curl http://127.0.0.1:5000/api/health
sudo nginx -t
sudo systemctl status nginx
```

## Realtime does not work

Make sure:

- Nginx is using the latest `deploy/nginx/mrfixer.conf`
- Nginx was reloaded after the config change
- the browser is opening the same host as `FRONTEND_URL`

## Recommended test checklist

- homepage loads
- login works
- customer APIs respond
- fixer APIs respond
- booking flow works
- websocket/realtime updates work
- profile image upload works
- `/api/health` responds through public IP

## Next step after testing

If this works on `Test-Deploy`, merge into `dev`:

```bash
git checkout dev
git pull --ff-only origin dev
git merge Test-Deploy
git push origin dev
```
