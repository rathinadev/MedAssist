#!/bin/bash

# 🏥 MedAssist: Master One-Command Setup Script 🚀
# This script automates Environment Setup, Database Seeding, and Background Service Launch.

set -e # Exit immediately if a command exits with a non-zero status

echo "--- 🛠️ Starting MedAssist Master Setup ---"

# 1. Project Navigation
if [ -d "backend" ]; then
    cd backend
else
    echo "❌ Error: Could not find 'backend/' directory. Run this from the root of the MedAssist repo."
    exit 1
fi

# 2. Virtual Environment Setup
echo "🌐 Setting up Python Virtual Environment..."
if ! python3 -m venv venv 2>/dev/null; then
    echo "❌ Error: 'python3-venv' is missing on your system."
    echo "👉 Please run: sudo apt update && sudo apt install python3-venv -y"
    exit 1
fi
source venv/bin/activate

# 3. Dependency Installation
echo "📩 Installing Dependencies..."
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

# 4. Environment Configuration
if [ ! -f ".env" ]; then
    echo "🔑 Configuring environment variables (copying .env.example)..."
    cp .env.example .env
fi

# 5. Database Synchronization
echo "🏗️ Running Migrations..."
python3 manage.py migrate --noinput

# 6. Demo Data Seeding (Critical for Demonstration)
echo "💊 Seeding Demo Data (Frank, Alice, etc.) & Training ML Models..."
python3 manage.py seed_demo_data

# 7. Background Service Management (Using Linux Screens)
echo "🧹 Cleaning up old sessions..."
screen -S api -X quit > /dev/null 2>&1
screen -S monitor -X quit > /dev/null 2>&1
screen -wipe > /dev/null 2>&1

echo "🚀 Spinning up Background Services..."

# Start API Server (Port 8000)
screen -dmS api bash -c "source venv/bin/activate && python3 manage.py runserver 0.0.0.0:8000"
echo "  ✅ API Server: Started on Port 8000"

# Start Voice Reminder Monitor
screen -dmS monitor bash -c "source venv/bin/activate && python3 manage.py check_reminders --loop"
echo "  ✅ Voice Monitor: Started in background"

echo "--------------------------------------------------------"
echo "--- ✅ SETUP COMPLETE! MedAssist is now LIVE ---"
echo "--------------------------------------------------------"
echo "Current Sessions:"
screen -ls
echo ""
echo "Demo Login: p6@medassist.com / MedAssist2026!"
echo "--------------------------------------------------------"
echo "🦅🛡️🔥 Happy Health-Tech Excellence! 🏆"
