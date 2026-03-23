# Simple Deploy Guide (Junior Friendly)

Goal: host frontend + backend on one EC2 instance using Nginx and PM2, then auto deploy when `dev` is updated.

## 1. Install packages on EC2

```bash
sudo apt update
sudo apt install -y nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## 2. Clone your repo

```bash
sudo mkdir -p /var/www
sudo chown -R "$USER":"$USER" /var/www
cd /var/www
git clone <YOUR_REPO_URL> mrfixer
cd mrfixer
git checkout dev
```

## 3. Set backend env

```bash
cd /var/www/mrfixer/backend
cp .env.example .env
```

Edit `.env` and set at least:

- `PORT=5000`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `FRONTEND_URL=http://your-ec2-public-ip`

## 4. First deploy (manual)

```bash
cd /var/www/mrfixer
bash deploy/scripts/deploy-dev.sh
pm2 status
```

## 5. Enable Nginx

```bash
sudo cp /var/www/mrfixer/deploy/nginx/mrfixer.conf /etc/nginx/sites-available/mrfixer
sudo ln -sf /etc/nginx/sites-available/mrfixer /etc/nginx/sites-enabled/mrfixer
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Open in browser:

- `http://your-ec2-public-ip/`
- `http://your-ec2-public-ip/api/...`

## 6. Enable PM2 auto start

```bash
pm2 startup
pm2 save
```

Run the extra command shown by `pm2 startup` once.

## 7. Enable auto deploy from GitHub (`dev`)

Workflow file already exists: `.github/workflows/deploy-dev.yml`

Add these GitHub Actions secrets:

- `VPS_HOST` = your EC2 public IP
- `VPS_USER` = SSH username (for example `ubuntu`)
- `VPS_PORT` = `22`
- `VPS_SSH_KEY` = private SSH key content
- `DEPLOY_PATH` = `/var/www/mrfixer`

After that, every push to `dev` will auto deploy.

## Basic security (keep it simple)

1. In EC2 Security Group:
   - allow `22` only from your IP
   - allow `80` from anywhere
   - do not allow `5000` publicly
2. Protect env file:

```bash
chmod 600 /var/www/mrfixer/backend/.env
```

1. Optional but good:

```bash
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
```

## Quick checks

```bash
pm2 logs mrfixer-backend --lines 50
curl -I http://your-ec2-public-ip/
curl -I http://your-ec2-public-ip/api/auth/login
```

## Note about HTTPS

If you only use EC2 public IP (no domain), you usually stay on HTTP.
For trusted HTTPS, you need a domain name.
