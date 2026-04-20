#!/bin/bash
# Google Cloud Compute Engine Deployment Script for Physical-Event-Experience
# This script installs Docker and starts the architecture on an Ubuntu VM.

set -e # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting Deployment Process..."

# 1. Update the system
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install Docker and Docker Compose
echo "🐳 Installing Docker & Docker Compose..."
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common git
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg --yes
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Ensure user is added to the docker group (mostly for ease of use later if SSHing in)
sudo usermod -aG docker $USER

# Install docker-compose standalone (legacy v1 path, but standard for many scripts)
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Clone Repository
echo "📂 Cloning Repository..."
# The main repo URL (it is public for now, if it becomes private, you will need a PAT token)
REPO_URL="https://github.com/sunand284517/Physical-event-experience.git"
APP_DIR="/var/www/physical-event-experience"

if [ -d "$APP_DIR" ]; then
    echo "Directory exists. Pulling latest code..."
    cd $APP_DIR
    sudo git pull origin main
else
    echo "Cloning completely..."
    sudo git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# 4. Start the Application Stack
echo "🔥 Starting Docker Services..."
sudo docker-compose down
sudo docker-compose up -d --build

echo "✅ Deployment Successful!"
echo "Your API is now running. Make sure you open port 3001 in your Google Cloud Firewall rules if you need to hit the Node.js backend globally."
