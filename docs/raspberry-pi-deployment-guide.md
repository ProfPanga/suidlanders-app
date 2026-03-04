# Raspberry Pi Deployment Guide - Complete Beginner's Guide

**Target:** Deploy Reception Dashboard + Backend API to Raspberry Pi for Story 1.2 Demo

**Audience:** Junior developers new to Raspberry Pi deployment

## Prerequisites

- Raspberry Pi with Raspberry Pi OS installed
- Pi connected to same network as your development computer
- SSH enabled on Pi (or physical keyboard/monitor connected)

---

## Part 1: Initial Raspberry Pi Setup

### Step 1.1: Find Your Pi's IP Address

**If you have monitor/keyboard connected to Pi:**

```bash
# On the Pi terminal, run:
hostname -I
```

**If you need to find it from your computer:**

```bash
# On your Mac/Linux:
arp -a | grep raspberrypi

# Or use your router's admin panel to see connected devices
```

**Example output:** `192.168.1.100` (your IP will be different)

### Step 1.2: SSH into Your Pi

**From your development computer:**

```bash
# Default credentials:
# Username: pi
# Password: raspberry (or whatever you set during setup)

ssh pi@192.168.1.100
```

**First time SSH?** Type `yes` when asked about fingerprint.

**Security Tip:** Change default password after first login:
```bash
passwd
```

### Step 1.3: Update Pi System

```bash
# Update package lists
sudo apt update

# Upgrade installed packages (this may take 5-10 minutes)
sudo apt upgrade -y
```

---

## Part 2: Install Required Software

### Step 2.1: Install Node.js (Required for Backend)

**Check if Node.js is already installed:**

```bash
node --version
```

**If not installed or version < 18:**

```bash
# Install Node.js 20.x (LTS) using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Step 2.2: Install Git (For Cloning Repository)

```bash
# Check if git is installed
git --version

# If not installed:
sudo apt install -y git
```

### Step 2.3: Create Project Directory Structure

```bash
# Create directory for the project
mkdir -p ~/suidlanders
cd ~/suidlanders

# Create subdirectories
mkdir -p backend
mkdir -p dashboard
mkdir -p logs
```

**Directory structure:**
```
/home/pi/suidlanders/
├── backend/          ← Backend API files
├── dashboard/        ← Frontend build files (www/)
└── logs/            ← Log files for debugging
```

---

## Part 3: Deploy Backend API

### Step 3.1: Transfer Backend Files to Pi

**On your development computer** (NOT on Pi):

```bash
# Navigate to your project directory
cd /Users/corneloots/Development/suidlanders-app

# Transfer backend directory to Pi using scp
scp -r backend/ pi@192.168.1.100:~/suidlanders/
```

**What this does:** Copies entire `backend/` folder to Pi's `~/suidlanders/backend/`

### Step 3.2: Install Backend Dependencies on Pi

**Back on Pi SSH session:**

```bash
# Navigate to backend directory
cd ~/suidlanders/backend

# Install npm dependencies (this may take 5-10 minutes)
npm install

# Verify installation succeeded (no errors)
ls node_modules/  # Should see many folders
```

### Step 3.3: Create Demo Data

```bash
# Still in ~/suidlanders/backend
npm run seed
```

**Expected output:**
```
🔴 Pieter van der Merwe → RED Camp (Family: 5)
🟢 Johan Botha → GREEN Camp (Family: 3)
🟢 Marie du Plessis → GREEN Camp (Family: 4)
🔴 Susan Kruger → RED Camp (Family: 2)
🟢 Hendrik Nel → GREEN Camp (Family: 6)
🟢 Anna Venter → GREEN Camp (Family: 3)
✅ Seed data created successfully!
```

### Step 3.4: Test Backend Manually

```bash
# Start backend (foreground test)
npm start
```

**Expected output:**
```
🚀 Suidlanders Backend API Started
📡 Listening on: http://localhost:3000
📊 Database: SQLite (data/camp.db)
✅ Story 1.1: Triage logic active
✅ Story 1.2: Reception API ready
```

**In a NEW terminal/SSH session** (keep backend running):

```bash
ssh pi@192.168.1.100

# Test API endpoint
curl http://localhost:3000/api/members
```

**Expected:** JSON array with 6 members

**Stop backend for now:** Press `Ctrl+C` in first terminal

---

## Part 4: Deploy Frontend Dashboard

### Step 4.1: Build Production Frontend on Your Computer

**On your development computer:**

```bash
cd /Users/corneloots/Development/suidlanders-app

# Build production version
npm run build

# Output will be in: www/ directory
```

**Verify build succeeded:**
```bash
ls www/
# Should see: index.html, assets/, polyfills.*.js, main.*.js, etc.
```

### Step 4.2: Transfer Frontend Build to Pi

**Still on your development computer:**

```bash
# Transfer www/ directory to Pi
scp -r www/ pi@192.168.1.100:~/suidlanders/dashboard/
```

**What this does:** Copies `www/` folder to Pi's `~/suidlanders/dashboard/www/`

### Step 4.3: Install Web Server on Pi

**Back on Pi SSH session:**

```bash
# Install Python3 (usually pre-installed on Pi OS)
python3 --version

# If not installed:
sudo apt install -y python3
```

**Why Python?** We'll use Python's built-in HTTP server (simplest option for demo)

### Step 4.4: Test Frontend Manually

```bash
# Navigate to dashboard directory
cd ~/suidlanders/dashboard/www

# Start web server (foreground test)
python3 -m http.server 8080
```

**Expected output:**
```
Serving HTTP on 0.0.0.0 port 8080 (http://0.0.0.0:8080/) ...
```

**On your development computer's browser:**
- Open: `http://192.168.1.100:8080/reception` (use your Pi's IP)

**Expected:**
- Dashboard loads
- Shows "Kon nie lede laai nie" error (backend not running yet)

**Stop web server:** Press `Ctrl+C`

---

## Part 5: Create Auto-Start Scripts

### Step 5.1: Create Backend Service

**On Pi:**

```bash
# Create systemd service file
sudo nano /etc/systemd/system/suidlanders-backend.service
```

**Paste this content:**

```ini
[Unit]
Description=Suidlanders Backend API
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/suidlanders/backend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=append:/home/pi/suidlanders/logs/backend.log
StandardError=append:/home/pi/suidlanders/logs/backend.log

[Install]
WantedBy=multi-user.target
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

### Step 5.2: Create Frontend Service

```bash
# Create systemd service file
sudo nano /etc/systemd/system/suidlanders-dashboard.service
```

**Paste this content:**

```ini
[Unit]
Description=Suidlanders Reception Dashboard
After=network.target suidlanders-backend.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/suidlanders/dashboard/www
ExecStart=/usr/bin/python3 -m http.server 8080
Restart=always
RestartSec=10
StandardOutput=append:/home/pi/suidlanders/logs/dashboard.log
StandardError=append:/home/pi/suidlanders/logs/dashboard.log

[Install]
WantedBy=multi-user.target
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

### Step 5.3: Enable and Start Services

```bash
# Reload systemd to recognize new services
sudo systemctl daemon-reload

# Enable services (start on boot)
sudo systemctl enable suidlanders-backend
sudo systemctl enable suidlanders-dashboard

# Start services now
sudo systemctl start suidlanders-backend
sudo systemctl start suidlanders-dashboard

# Check status
sudo systemctl status suidlanders-backend
sudo systemctl status suidlanders-dashboard
```

**Expected for both:** `Active: active (running)` in green

---

## Part 6: Configure Chromium Auto-Launch (Kiosk Mode)

### Step 6.1: Install Chromium Browser

```bash
# Check if chromium is installed
chromium-browser --version

# If not installed:
sudo apt install -y chromium-browser
```

### Step 6.2: Create Auto-Start Desktop Entry

```bash
# Create autostart directory
mkdir -p ~/.config/autostart

# Create desktop entry file
nano ~/.config/autostart/suidlanders-dashboard.desktop
```

**Paste this content:**

```ini
[Desktop Entry]
Type=Application
Name=Suidlanders Dashboard
Exec=chromium-browser --kiosk --disable-infobars --noerrdialogs http://localhost:8080/reception
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

**What this does:**
- Launches Chromium on desktop startup
- Opens in kiosk mode (fullscreen, no toolbar)
- Loads dashboard automatically

---

## Part 7: Testing Your Deployment

### Test 7.1: Backend API Test

```bash
# Check backend is running
sudo systemctl status suidlanders-backend

# Test API endpoint
curl http://localhost:3000/api/members | jq .
```

**Expected:** JSON array with 6 members

**If it fails:**
```bash
# Check logs
tail -f ~/suidlanders/logs/backend.log
```

### Test 7.2: Dashboard Web Server Test

```bash
# Check dashboard is running
sudo systemctl status suidlanders-dashboard

# Test from Pi
curl http://localhost:8080
```

**Expected:** HTML content (dashboard index.html)

### Test 7.3: Full Dashboard Test in Browser

**On your development computer:**
- Open: `http://192.168.1.100:8080/reception`

**Expected:**
- Dashboard loads
- Shows 6 members
- Pieter van der Merwe has RED badge + [MEDIESE] indicator
- Other members have GREEN badges
- Search works
- Refresh button works

### Test 7.4: Auto-Start Test

```bash
# Reboot Pi to test auto-start
sudo reboot
```

**After reboot (if monitor connected to Pi):**
- Chromium should launch automatically
- Dashboard should display in fullscreen
- Members should load

**If no monitor connected:**
- Wait 2 minutes after reboot
- Open `http://192.168.1.100:8080/reception` from your computer
- Should work immediately

---

## Part 8: Useful Commands for Managing Services

### Check Service Status

```bash
# Backend status
sudo systemctl status suidlanders-backend

# Dashboard status
sudo systemctl status suidlanders-dashboard
```

### View Live Logs

```bash
# Backend logs
tail -f ~/suidlanders/logs/backend.log

# Dashboard logs
tail -f ~/suidlanders/logs/dashboard.log

# Both at once
tail -f ~/suidlanders/logs/*.log
```

### Restart Services

```bash
# Restart backend (after code changes)
sudo systemctl restart suidlanders-backend

# Restart dashboard (after frontend rebuild)
sudo systemctl restart suidlanders-dashboard

# Restart both
sudo systemctl restart suidlanders-backend suidlanders-dashboard
```

### Stop Services

```bash
# Stop backend
sudo systemctl stop suidlanders-backend

# Stop dashboard
sudo systemctl stop suidlanders-dashboard
```

---

## Part 9: Updating Your Code After Changes

### Update Backend

**On your development computer:**

```bash
# Transfer updated backend
cd /Users/corneloots/Development/suidlanders-app
scp -r backend/ pi@192.168.1.100:~/suidlanders/
```

**On Pi:**

```bash
cd ~/suidlanders/backend
npm install  # If package.json changed
sudo systemctl restart suidlanders-backend
```

### Update Frontend

**On your development computer:**

```bash
# Rebuild
cd /Users/corneloots/Development/suidlanders-app
npm run build

# Transfer
scp -r www/ pi@192.168.1.100:~/suidlanders/dashboard/
```

**On Pi:**

```bash
# Just restart (no npm install needed for frontend)
sudo systemctl restart suidlanders-dashboard
```

---

## Part 10: Troubleshooting

### Problem: Backend won't start

```bash
# Check logs
tail -50 ~/suidlanders/logs/backend.log

# Common issues:
# 1. Port 3000 already in use
sudo lsof -i :3000
sudo kill -9 <PID>

# 2. Database permissions
ls -la ~/suidlanders/backend/data/
chmod 644 ~/suidlanders/backend/data/camp.db
```

### Problem: Dashboard shows 404

```bash
# Check if www/ directory exists
ls ~/suidlanders/dashboard/www/

# If empty, rebuild and transfer from dev computer
```

### Problem: "Kon nie lede laai nie" error persists

```bash
# Check backend is running
curl http://localhost:3000/api/members

# If backend responds, check CORS/network
# If backend doesn't respond, check backend service
```

### Problem: Chromium doesn't auto-start

```bash
# Check desktop entry exists
cat ~/.config/autostart/suidlanders-dashboard.desktop

# Test manually
chromium-browser --kiosk http://localhost:8080/reception
```

### Problem: Can't SSH into Pi

```bash
# On Pi (with keyboard/monitor):
# Enable SSH
sudo raspi-config
# → Interface Options → SSH → Enable

# Check Pi's IP address
hostname -I
```

---

## Part 11: Demo Day Checklist

**Day Before Demo:**

- [ ] Pi is powered on and connected to network
- [ ] Backend service is running (`sudo systemctl status suidlanders-backend`)
- [ ] Dashboard service is running (`sudo systemctl status suidlanders-dashboard`)
- [ ] Demo data is seeded (6 members with Pieter in Red Camp)
- [ ] Dashboard loads in browser: `http://<PI-IP>:8080/reception`
- [ ] Chromium auto-start is configured
- [ ] Monitor is connected to Pi and working
- [ ] Test full reboot: `sudo reboot` → Dashboard should auto-open

**Day of Demo:**

- [ ] Turn on Pi 5 minutes before demo
- [ ] Verify dashboard loads on monitor automatically
- [ ] Verify 6 members display
- [ ] Verify Pieter shows Red Camp badge
- [ ] Test search functionality
- [ ] Test refresh button
- [ ] Have backup plan: Screenshots if live demo fails

**Backup Recovery Commands:**

```bash
# Quick restart everything
sudo systemctl restart suidlanders-backend suidlanders-dashboard

# Force-kill and restart Chromium
pkill chromium-browser
chromium-browser --kiosk http://localhost:8080/reception &
```

---

## Additional Resources

**Raspberry Pi Documentation:**
- https://www.raspberrypi.com/documentation/

**systemd Service Management:**
- https://www.raspberrypi.com/documentation/computers/using_linux.html#systemd

**SSH Guide:**
- https://www.raspberrypi.com/documentation/computers/remote-access.html#ssh

---

## Summary of What You've Deployed

**Backend API (Port 3000):**
- NestJS + SQLite
- Serves: GET /api/members
- Auto-starts on boot
- Logs: `~/suidlanders/logs/backend.log`

**Frontend Dashboard (Port 8080):**
- Ionic/Angular web build
- Static files served by Python HTTP server
- Auto-starts on boot
- Logs: `~/suidlanders/logs/dashboard.log`

**Chromium Kiosk Mode:**
- Auto-launches on desktop startup
- Fullscreen dashboard at: http://localhost:8080/reception
- No toolbars, no distractions

**Ready for March 6th demo!** 🎉
