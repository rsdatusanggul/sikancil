# Cloudflare Tunnel Setup - Si-Kancil Dev Server

## Overview

Server development Si-Kancil sekarang dapat diakses secara online melalui Cloudflare Tunnel tanpa perlu:
- Public IP
- Port forwarding
- SSL certificate manual

## Akses

**URL:** https://sikancil-dev.rsdatusanggul.com

## Komponen yang Terinstall

### 1. Cloudflared
- **Versi:** 2026.2.0
- **Lokasi binary:** `/usr/local/bin/cloudflared`
- **Lokasi konfigurasi:** `/etc/cloudflared/config.yml`
- **Credentials:** `/root/.cloudflared/f0a51759-c1e6-4cfd-b3b9-f6edec1f5b97.json`

### 2. Tunnel Details
- **Nama Tunnel:** sikancil-dev
- **Tunnel ID:** f0a51759-c1e6-4cfd-b3b9-f6edec1f5b97
- **Domain:** sikancil-dev.rsdatusanggul.com
- **Target Service:** http://localhost:80 (Nginx)

### 3. Systemd Service
- **Service name:** cloudflared.service
- **Status:** enabled (auto-start on boot)
- **Config:** `/etc/cloudflared/config.yml`

## Perintah Berguna

### Cek Status Tunnel
```bash
systemctl status cloudflared
```

### Restart Tunnel
```bash
systemctl restart cloudflared
```

### Lihat Log Tunnel
```bash
journalctl -u cloudflared -f
```

### Cek Tunnel List
```bash
cloudflared tunnel list
```

## Konfigurasi CORS

Backend sudah dikonfigurasi untuk menerima request dari:
- `http://localhost:5173` (local development)
- `http://192.168.11.30` (LAN access)
- `https://sikancil-dev.rsdatusanggul.com` (Cloudflare Tunnel)

## Keamanan

1. **Credentials file** berada di `/root/.cloudflared/` - jangan share file ini
2. **SSL/TLS** ditangani otomatis oleh Cloudflare (Edge Certificate)
3. **DDoS Protection** aktif secara default dari Cloudflare

## Troubleshooting

### Tunnel tidak bisa diakses
1. Cek status service: `systemctl status cloudflared`
2. Cek log: `journalctl -u cloudflared -n 50`
3. Pastikan Nginx berjalan: `systemctl status nginx`
4. Pastikan backend/frontend PM2 berjalan: `pm2 status`

### Error 502 Bad Gateway
- Backend atau Frontend mungkin tidak berjalan
- Cek dengan: `pm2 status` dan `pm2 logs`

### CORS Error
- Pastikan domain sudah ditambahkan di `backend/.env` pada `CORS_ORIGIN`
- Restart backend setelah mengubah .env: `pm2 restart sikancil-backend`

## Tanggal Setup
- **Setup Date:** 19 Februari 2026
- **Setup By:** Cline AI Assistant