# Nginx Configuration Fix for Cloudflare Tunnel

## Problem
Cloudflare Tunnel was connecting to `http://localhost:80` but requests were being served by the default nginx server block instead of the sikancil-dev server block, resulting in the default nginx welcome page being displayed instead of the Si-Kancil application.

## Root Cause
The sikancil-dev server block did not have `localhost` in its `server_name` directive, causing nginx to route requests from `localhost` (which Cloudflare Tunnel uses) to the `default` server block instead.

## Solution

### Changes Made:

1. **Updated `/etc/nginx/sites-available/sikancil-dev`:**
   - Added `localhost` to the `server_name` directive
   - Added `default_server` flag to make it the default server for port 80
   - Added IPv6 listener with `default_server` flag

2. **Removed conflicting server block:**
   - Removed `/etc/nginx/sites-enabled/default` symlink to eliminate duplicate `default_server` declaration

3. **Updated `/opt/sikancil/frontend/vite.config.ts`:**
   - Added `allowedHosts` configuration to permit requests from Cloudflare tunnel domain
   - Included `localhost`, `192.168.11.30`, and `sikancil-dev.rsdatusanggul.com` in allowed hosts

### Final Configuration:

**Nginx Server Block:**
```nginx
# HTTP Server - Default server for all requests
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name 192.168.11.30 sikancil-dev.rsdatusanggul.com localhost;
    ...
}
```

**Vite Configuration:**
```typescript
// frontend/vite.config.ts
server: {
  host: '0.0.0.0',
  port: 5173,
  strictPort: true,
  allowedHosts: [
    'localhost',
    '192.168.11.30',
    'sikancil-dev.rsdatusanggul.com'
  ],
}
```

## Verification

### Nginx Status:
```
✓ Configuration test passed
✓ Nginx reloaded successfully
✓ Health check endpoint returns 200 OK
```

### Cloudflare Tunnel Status:
```
✓ cloudflared service is running
✓ 4 active tunnel connections established
✓ Tunnel connecting via QUIC protocol
```

## Testing

The following access methods should now work correctly:

1. **Cloudflare Tunnel:** https://sikancil-dev.rsdatusanggul.com
2. **LAN Access:** http://192.168.11.30
3. **Local Access:** http://localhost

### Health Check:
```bash
curl http://localhost/health
# Expected: "OK - Si-Kancil Development Server"
```

### Test Frontend:
```bash
curl http://localhost/
# Should return the React frontend HTML
```

### Test Backend API:
```bash
curl http://localhost/api/health
# Should return backend health status
```

## Services Status

All services should be running:

```bash
# Check nginx
sudo systemctl status nginx

# Check cloudflared
sudo systemctl status cloudflared

# Check PM2 apps
pm2 status
```

## Date Fixed
- **Date:** 19 February 2026
- **Time:** 07:47 WITA
- **Fixed By:** Cline AI Assistant

## Notes

- The sikancil-dev server block now handles ALL requests to port 80, including those from localhost
- Cloudflare tunnel will now correctly route traffic to the Si-Kancil application
- No changes were needed to the cloudflared configuration
- The tunnel continues to use http://localhost:80 as its service target