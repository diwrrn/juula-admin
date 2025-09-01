#!/bin/bash

# 🚀 Git Deployment Script for cPanel
# This script should be run on your cPanel hosting after pulling from Git

echo "🚀 Starting deployment..."

# Set production environment
export NODE_ENV=production
export PORT=${PORT:-5000}

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Build the application
echo "🔨 Building application..."
npm run build

# Start the application
echo "🚀 Starting application..."
if command -v pm2 &> /dev/null; then
    echo "📊 Using PM2 to start application..."
    pm2 start ecosystem.config.js --env production
    pm2 save
else
    echo "📱 Starting with Node directly..."
    nohup node dist/index.js > app.log 2>&1 &
    echo $! > app.pid
fi

echo "✅ Deployment completed!"
echo "🌐 Your app should be running on port $PORT"
echo "📝 Check logs with: pm2 logs (if using PM2) or tail -f app.log"
