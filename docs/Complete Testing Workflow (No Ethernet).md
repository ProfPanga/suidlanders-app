Complete Testing Workflow (No Ethernet)

Step 1: Switch Pi to Internet Mode

On the Pi (keyboard/monitor or existing SSH if still connected):

~/switch-to-internet.sh

Wait ~10 seconds for Pi to connect to Cudy-F764 WiFi.

---

Step 2: Find Pi's IP on Home Network

From your Pi or from your laptop:

# On Pi (if you have keyboard/monitor)

hostname -I

# Or from laptop (scan network)

arp -a | grep raspberrypi

You should get something like 192.168.1.x (your home network IP).

---

Step 3: SSH from Laptop

From your laptop:

ssh suidlanders@192.168.1.x # Use the IP from step 2

---

Step 4: Start Log Monitoring

In the SSH session:

tail -f ~/suidlanders-app/logs/backend.log

Keep this running.

---

Step 5: Switch Back to AP Mode

Open a second SSH terminal from your laptop:

ssh suidlanders@192.168.1.x
~/switch-to-ap.sh

⚠️ Warning: After this command, your SSH connection will break because the Pi is no longer on home WiFi!

---

Step 6: Test with Phone

1. Phone: Connect to SuidlandersKamp WiFi
2. Phone Browser: Open http://192.168.4.1:8080/reception
3. Click: "Genereer QR Kode"
4. App: Scan QR code

---

Problem: Can't Monitor Logs After Switching to AP 😞

Since you'll lose SSH when Pi switches to AP mode, you can't watch logs in real-time during the test.

---

Solution: Check Logs After Testing

Better workflow:

1. switch-to-ap.sh (on Pi directly, or accept losing SSH)
2. Test QR scan with phone
3. switch-to-internet.sh (on Pi)
4. SSH back in from laptop
5. Check logs: tail -50 ~/suidlanders-app/logs/backend.log
