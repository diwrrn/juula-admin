# 🚀 cPanel Node.js Deployment Guide (Git Version)

## 📋 Pre-Deployment Checklist

### 1. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

### 2. Set up Remote Repository
```bash
# Add your cPanel hosting as a remote
git remote add production username@yourdomain.com:/home/username/public_html
# OR use GitHub/GitLab and set up webhooks
```

### 3. Environment Variables Setup
Create a `.env` file in your cPanel hosting with:
```env
NODE_ENV=production
PORT=5000
# Add your Firebase configuration here
```

## 🔧 Git Deployment Setup

### Option 1: Direct Git Push to cPanel

#### Step 1: On Your Local Machine
```bash
# Build the project
npm run build

# Commit changes
git add .
git commit -m "Deploy to production"
git push production main
```

#### Step 2: On cPanel Hosting
```bash
# Navigate to your hosting directory
cd /home/username/public_html

# Pull latest changes
git pull origin main

# Run deployment
chmod +x deploy.sh
./deploy.sh
```

### Option 2: GitHub/GitLab with Webhooks

#### Step 1: Push to GitHub/GitLab
```bash
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

#### Step 2: Set up Webhook on cPanel
1. Create a webhook endpoint on your cPanel hosting
2. Configure GitHub/GitLab to call this webhook on push
3. Webhook triggers automatic deployment

### Option 3: Git Hooks (Automatic)

#### Step 1: Set up Git Hook
```bash
# On your cPanel hosting
cd /home/username/public_html/.git/hooks
chmod +x post-receive
```

#### Step 2: Update hook configuration
Edit `hooks/post-receive` and update:
- `DEPLOY_PATH`: Your actual hosting path
- `BRANCH`: Your default branch name

## 📁 Files Structure for Git Deployment

```
your-project/
├── .git/
├── .gitignore
├── package.json
├── package-lock.json
├── ecosystem.config.js
├── deploy.sh
├── hooks/
│   └── post-receive
├── server/
├── client/
├── shared/
└── DEPLOYMENT.md
```

## 🚀 Deployment Commands

### Manual Deployment
```bash
# On cPanel hosting
git pull origin main
./deploy.sh
```

### Automatic Deployment (with hooks)
```bash
# Just push from local
git push production main
# Hook automatically deploys
```

## ⚠️ Important Notes

- **Git Hooks**: Make sure hooks have execute permissions
- **Environment Variables**: Keep `.env` out of Git, create it manually on hosting
- **Build Process**: The `deploy.sh` script handles building and starting
- **Port Configuration**: Update port in `.env` if your hosting uses different ports
- **Firebase**: Ensure production Firebase credentials are in `.env`

## 🔍 Troubleshooting

- **Hook not working**: Check permissions with `ls -la hooks/`
- **Build fails**: Check Node.js version and dependencies
- **Port issues**: Verify port is open and accessible
- **Environment issues**: Check `.env` file exists and has correct values

## 📝 Quick Start Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Deploy to production
git add .
git commit -m "Update production"
git push production main

# On hosting (if manual deployment)
git pull origin main
./deploy.sh
```
