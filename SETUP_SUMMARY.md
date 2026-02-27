# 🎉 Si-Kancil Development Server Setup - COMPLETE

**Setup Date:** 15 Februari 2026
**Server IP:** 192.168.11.30
**Status:** ✅ READY FOR AGILE TESTING

---

## 📋 Setup Summary

### **What Was Configured**

✅ **Nginx 1.26.3** - Reverse proxy server
✅ **PM2** - Process manager (auto-restart)
✅ **Vite** - Bind to 0.0.0.0 (all interfaces)
✅ **Backend CORS** - Allow IP-based access
✅ **Auto-startup** - Services restart on server reboot

---

## 🌐 Access URLs for BA/QA Team

```
Frontend App:       http://192.168.11.30/
Backend API:        http://192.168.11.30/api/v1
Swagger Docs:       http://192.168.11.30/api/docs
Health Check:       http://192.168.11.30/health
```

**No need to edit /etc/hosts** - Direct IP access works!

---

## 🏗️ Architecture

```
Tim BA/QA Browser
    ↓
http://192.168.11.30:80 (Nginx)
    ↓
    ├─→ /          → localhost:5173 (Frontend Vite)
    ├─→ /api/*     → localhost:3000 (Backend NestJS)
    └─→ /api/docs  → localhost:3000/api/docs (Swagger)

PM2 Processes:
  - sikancil-backend  (Port 3000, auto-restart)
  - sikancil-frontend (Port 5173, auto-restart)
```

---

## 📁 Files Created/Modified

### **New Files:**
```
/opt/sikancil/ecosystem.config.js          # PM2 config
/etc/nginx/sites-available/sikancil-dev    # Nginx config
/etc/nginx/sites-enabled/sikancil-dev      # Symlink
/opt/sikancil/AKSES_TIM_BA_QA.md          # BA/QA Guide
/opt/sikancil/SETUP_SUMMARY.md            # This file
```

### **Modified Files:**
```
/opt/sikancil/frontend/vite.config.ts      # host: '0.0.0.0'
/opt/sikancil/backend/.env                 # CORS_ORIGIN updated
```

---

## 🔧 Developer Commands

### **PM2 Management**
```bash
# Status
pm2 status

# Logs (live tail)
pm2 logs sikancil-backend
pm2 logs sikancil-frontend
pm2 logs                      # All logs

# Restart (after code change)
pm2 restart sikancil-backend
pm2 restart sikancil-frontend
pm2 restart all

# Stop/Start
pm2 stop sikancil-backend
pm2 start sikancil-backend

# Monitor (real-time CPU/Memory)
pm2 monit
```

### **Nginx Management**
```bash
# Test config
nginx -t

# Reload (after config change)
systemctl reload nginx

# Restart
systemctl restart nginx

# Status
systemctl status nginx

# Logs
tail -f /var/log/nginx/sikancil-dev-access.log
tail -f /var/log/nginx/sikancil-dev-error.log
```

### **Check Services**
```bash
# Listening ports
netstat -tlnp | grep -E ":80|:3000|:5173"

# Process status
ps aux | grep -E "nginx|node|pm2"

# Test endpoints
curl http://192.168.11.30/health
curl http://192.168.11.30/api/docs | head
```

---

## 🔄 Auto-Restart Configuration

### **PM2 Auto-Restart:**
✅ Crash recovery: Yes (max 10 restarts)
✅ Boot startup: Yes (systemd enabled)
✅ Log rotation: No (configure if needed)

**Verify auto-startup:**
```bash
systemctl status pm2-root
pm2 startup  # Should show "already enabled"
```

### **Nginx Auto-Start:**
✅ Systemd enabled: Yes
✅ Start on boot: Yes

**Verify:**
```bash
systemctl is-enabled nginx
# Output: enabled
```

---

## 🎯 Features for Agile Development

### **✅ Benefits Achieved**

1. **Single Port Access (80)**
   - Tim BA/QA hanya perlu ingat IP
   - No need to remember :3000 or :5173

2. **No CORS Issues**
   - Same-origin (Nginx proxy)
   - Frontend & Backend via same domain/IP

3. **No /etc/hosts Modification**
   - Direct IP access: http://192.168.11.30
   - Easy untuk tim remote (VPN)

4. **24/7 Availability**
   - PM2 auto-restart on crash
   - Auto-start on server reboot
   - No manual intervention needed

5. **Hot Module Replacement (HMR)**
   - Frontend: Vite HMR via WebSocket (Nginx support)
   - Backend: NestJS auto-reload on code change
   - Developer coding → BA/QA see changes instantly

6. **Production-Like Setup**
   - Mirror production architecture
   - Early detection of production issues
   - Better testing environment

---

## 📅 Agile Sprint Workflow

### **Sprint Cycle (2 Weeks)**

**Monday Week 1:**
- Sprint Planning
- Developer start coding
- BA/QA get access to dev server

**Tuesday - Thursday:**
- Continuous development
- BA/QA test sewaktu-waktu
- Bug reporting via Slack

**Friday Week 2:**
- Sprint Review/Demo
- BA validation
- Sprint Retrospective

### **Testing Access**

✅ **Available:** 24/7 (auto-restart)
✅ **Best time:** Selasa - Kamis (09:00-16:00)
✅ **Auto-update:** Yes (HMR)
✅ **Manual refresh:** Optional (HMR handle it)

---

## 🐛 Troubleshooting Guide

### **Problem: Service Down / 502 Bad Gateway**

**Diagnose:**
```bash
# Check PM2 processes
pm2 list

# Check logs
pm2 logs sikancil-backend --lines 50
pm2 logs sikancil-frontend --lines 50
```

**Common causes:**
1. Backend/Frontend crashed (check logs)
2. Port already in use
3. Database connection failed

**Fix:**
```bash
# Restart services
pm2 restart all

# If still down, check ports
netstat -tlnp | grep -E ":3000|:5173"

# Kill process using port (if needed)
kill -9 <PID>

# Restart
pm2 start ecosystem.config.js
```

---

### **Problem: Nginx Not Working**

**Diagnose:**
```bash
# Check Nginx status
systemctl status nginx

# Test config
nginx -t

# Check error log
tail -50 /var/log/nginx/sikancil-dev-error.log
```

**Fix:**
```bash
# Restart Nginx
systemctl restart nginx

# If config error
nginx -t  # See exact error
vim /etc/nginx/sites-available/sikancil-dev  # Fix config
nginx -t  # Test again
systemctl reload nginx
```

---

### **Problem: CORS Error in Browser**

**Symptom:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Check backend .env:**
```bash
cat /opt/sikancil/backend/.env | grep CORS
# Should include: CORS_ORIGIN=http://localhost:5173,http://192.168.11.30
```

**Fix:**
```bash
# Edit .env
vim /opt/sikancil/backend/.env

# Ensure:
CORS_ORIGIN=http://localhost:5173,http://192.168.11.30

# Restart backend
pm2 restart sikancil-backend
```

---

### **Problem: HMR (Hot Reload) Not Working**

**Symptom:**
Code change tidak auto-reload di browser.

**Check:**
1. Vite config correct?
   ```bash
   cat /opt/sikancil/frontend/vite.config.ts
   # Should have: host: '0.0.0.0'
   ```

2. Nginx config support WebSocket?
   ```bash
   grep -A5 "proxy_set_header Upgrade" /etc/nginx/sites-available/sikancil-dev
   # Should have WebSocket headers
   ```

**Fix:**
```bash
# Restart frontend
pm2 restart sikancil-frontend

# Reload Nginx
systemctl reload nginx

# Hard refresh browser
Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
```

---

## 📊 Performance Expectations

### **Response Time (Target)**

- ✅ Page load: < 3 seconds
- ✅ API response: < 500ms (average)
- ✅ Dashboard refresh: < 2 seconds
- ✅ SIMRS sync: < 1 second (when implemented)

### **Concurrent Users**

- ✅ Development: 5-10 concurrent users (BA/QA team)
- ✅ Production target: 20 concurrent users

### **Uptime**

- ✅ Development: Best effort (auto-restart)
- ✅ Production target: 99.9% uptime

---

## 🔐 Security Notes

### **Current Setup (Development)**

⚠️ **NOT production-ready security:**
- HTTP (not HTTPS) - OK for internal dev network
- No firewall rules - Accessible from local network
- Default passwords - Change in production
- Debug mode enabled - More verbose errors

### **Production TODO (Later):**

- [ ] Enable HTTPS (SSL/TLS certificate)
- [ ] Firewall rules (allow specific IPs)
- [ ] Strong passwords + password policy
- [ ] Production mode (no debug output)
- [ ] Rate limiting (DDoS protection)
- [ ] WAF (Web Application Firewall)
- [ ] Intrusion detection
- [ ] Security headers (CSP, HSTS, etc.)

---

## 📞 Support

### **Developer Team**
- **Slack:** #sikancil-project
- **Email:** project-sikancil@example.com

### **Escalation**
- **PM:** [TBD]
- **Senior BA:** [TBD]
- **Tech Lead:** [TBD]

---

## ✅ Verification Checklist

```bash
# 1. Nginx running
systemctl status nginx | grep "active (running)"

# 2. PM2 processes running
pm2 list | grep -E "sikancil-backend|sikancil-frontend" | grep "online"

# 3. Ports listening
netstat -tlnp | grep ":80.*nginx"
netstat -tlnp | grep ":3000.*node"
netstat -tlnp | grep ":5173.*node"

# 4. Frontend accessible
curl -I http://192.168.11.30/ | grep "200 OK"

# 5. Backend API accessible
curl -I http://192.168.11.30/api/docs | grep "200 OK"

# 6. Health check
curl http://192.168.11.30/health
# Expected: "OK - Si-Kancil Development Server"
```

**All checks passed?** ✅ **Server ready for BA/QA testing!**

---

## 📚 Related Documentation

- **BA/QA Access Guide:** [AKSES_TIM_BA_QA.md](AKSES_TIM_BA_QA.md)
- **Master Plan v3.0:** [docs/Sikancil_Masterplan_v3.md](docs/Sikancil_Masterplan_v3.md)
- **Features Detail:** [docs/Sikancil_Features_v3.md](docs/Sikancil_Features_v3.md)
- **API Documentation:** http://192.168.11.30/api/docs

---

**Setup Completed By:** AI Assistant (Claude)
**Verified By:** [TBD - Developer]
**Approved By:** [TBD - PM]

**Status:** ✅ PRODUCTION-READY FOR DEVELOPMENT TESTING

---

🎉 **Happy Coding & Testing!**
