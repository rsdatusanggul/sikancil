# Session Timeout & CAPTCHA Implementation

## Overview
This document describes the implementation of session timeout (15 minutes) and CAPTCHA verification for enhanced security in the Sikancil application.

## Features Implemented

### 1. Session Timeout (15 Minutes)

#### Backend Changes
- **JWT Expiration**: Updated `backend/src/config/jwt.config.ts` to set JWT expiration to 15 minutes
- **Token Expiration**: All access tokens now expire after 15 minutes of inactivity

#### Frontend Changes
- **Activity Tracking**: Created `frontend/src/hooks/useActivityTracker.ts` to track user activity
- **Session State**: Added `lastActivity` timestamp to auth store
- **Auto Logout**: Implemented automatic logout when session expires
- **Activities Tracked**:
  - Mouse movements
  - Keyboard input
  - Scroll events
  - Touch events
  - Clicks

**Files Modified:**
- `backend/src/config/jwt.config.ts`
- `frontend/src/stores/auth.store.ts`
- `frontend/src/hooks/useActivityTracker.ts`
- `frontend/src/components/layout/MainLayout.tsx`

### 2. CAPTCHA Verification

#### Backend Implementation
- **CAPTCHA Service**: Created `backend/src/modules/auth/captcha.service.ts`
- **SVG CAPTCHA**: Uses `svg-captcha` library for generating secure CAPTCHAs
- **CAPTCHA Endpoint**: Added `GET /auth/captcha` to generate new CAPTCHA
- **Login Verification**: Modified login endpoint to require CAPTCHA verification

**CAPTCHA Features:**
- 4-character alphanumeric codes
- Excludes confusing characters (0, o, 1, I, l)
- 5-minute expiration for each CAPTCHA
- Case-insensitive verification
- One-time use (CAPTCHA is deleted after verification attempt)

#### Frontend Implementation
- **CAPTCHA Display**: Shows SVG CAPTCHA image in login form
- **Refresh Button**: Users can refresh CAPTCHA
- **Auto-refresh**: CAPTCHA refreshes automatically on login error
- **Validation**: Client-side validation before submission

**Files Modified:**
- `backend/package.json` (added svg-captcha)
- `backend/src/types/svg-captcha.d.ts` (TypeScript definitions)
- `backend/src/modules/auth/captcha.service.ts` (new)
- `backend/src/modules/auth/auth.module.ts` (added CaptchaService)
- `backend/src/modules/auth/auth.controller.ts` (added CAPTCHA endpoint and verification)
- `backend/src/modules/auth/dto/login.dto.ts` (added captcha fields)
- `frontend/src/features/auth/schemas.ts` (added captcha validation)
- `frontend/src/features/auth/components/LoginForm.tsx` (added CAPTCHA UI)

## How It Works

### Session Timeout Flow

1. **Login**: User logs in, `lastActivity` timestamp is set to current time
2. **Activity Tracking**: User activities (mouse, keyboard, etc.) update `lastActivity`
3. **Session Check**: Every minute, the system checks if `lastActivity` is older than 15 minutes
4. **Auto Logout**: If session expired, user is automatically logged out and redirected to login

### CAPTCHA Flow

1. **Page Load**: Login form automatically fetches a new CAPTCHA from `/auth/captcha`
2. **CAPTCHA Display**: SVG image is shown with refresh button
3. **User Input**: User enters username, password, and CAPTCHA code
4. **Verification**: Backend verifies CAPTCHA before processing login
5. **Error Handling**: On CAPTCHA error, new CAPTCHA is automatically generated

## Security Benefits

### Session Timeout
- Prevents unauthorized access if user leaves device unattended
- Reduces risk of session hijacking
- Forces re-authentication after inactivity
- Complies with security best practices

### CAPTCHA Verification
- Prevents automated brute-force attacks
- Protects against credential stuffing
- Reduces risk of account takeover
- Adds layer of security during authentication

## Configuration

### Session Timeout Duration
To change session timeout duration, modify `frontend/src/stores/auth.store.ts`:
```typescript
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
```

### CAPTCHA Settings
To modify CAPTCHA settings, edit `backend/src/modules/auth/captcha.service.ts`:
```typescript
const captcha = svgCaptcha.create({
  size: 4, // number of characters
  ignoreChars: '0o1iIl', // confusing characters
  noise: 2, // number of noise lines
  color: true,
  background: '#f8fafc',
  width: 120,
  height: 40,
  fontSize: 30,
});
```

### CAPTCHA Expiration
To change CAPTCHA expiration time, modify in `captcha.service.ts`:
```typescript
const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
```

## User Experience

### Session Timeout
- **Notification**: Users receive alert when session expires
- **Graceful Logout**: Clean logout with proper cleanup
- **Redirect**: Automatically redirected to login page
- **Activity Awareness**: Session remains active as long as user interacts with application

### CAPTCHA
- **Easy to Read**: Clear, readable CAPTCHA images
- **Refresh Option**: Users can refresh if CAPTCHA is unclear
- **Case Insensitive**: Easier for users to input correctly
- **Auto-refresh**: New CAPTCHA on failed login attempt

## Testing

### Test Session Timeout
1. Login to the application
2. Wait for 15 minutes without any activity
3. You should see alert: "Sesi Anda telah berakhir karena tidak ada aktivitas selama 15 menit. Silakan login kembali."
4. You should be redirected to login page

### Test CAPTCHA
1. Open login page
2. Verify CAPTCHA image is displayed
3. Enter correct username, password, and CAPTCHA
4. Login should succeed
5. Try with incorrect CAPTCHA
6. Login should fail with error and new CAPTCHA should appear

### Test CAPTCHA Refresh
1. Click on CAPTCHA image
2. CAPTCHA should refresh with new code
3. Click refresh button
4. CAPTCHA should refresh again

## Troubleshooting

### Session Timeout Not Working
- Check if `useActivityTracker` is properly initialized
- Verify `initializeSessionTimeout` is called
- Check browser console for errors
- Ensure user activities are updating `lastActivity`

### CAPTCHA Not Loading
- Check if `/auth/captcha` endpoint is accessible
- Verify svg-captcha library is installed
- Check browser console for errors
- Verify CaptchaService is registered in AuthModule

### CAPTCHA Verification Fails
- Ensure CAPTCHA is case-insensitive on backend
- Check if CAPTCHA ID is being sent correctly
- Verify CAPTCHA hasn't expired (5 minutes)
- Check if CAPTCHA was already used

## Future Enhancements

1. **Warning Before Timeout**: Show warning 1-2 minutes before session expires
2. **Keep Me Logged In**: Option for extended sessions (not recommended for security)
3. CAPTCHA Alternatives: reCAPTCHA or hCaptcha integration
4. **Audit Logging**: Log all CAPTCHA verification attempts
5. **Rate Limiting**: Add rate limiting to login attempts

## Compliance

This implementation follows security best practices and helps comply with:
- OWASP Top 10 recommendations
- NIST Digital Identity Guidelines
- ISO 27001 security requirements
- Industry-standard authentication practices

## Summary

The session timeout and CAPTCHA verification features significantly enhance the security posture of the Sikancil application by:
- Preventing unauthorized access through inactive sessions
- Blocking automated attacks during authentication
- Providing clear user feedback
- Maintaining good user experience while improving security