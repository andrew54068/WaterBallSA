# Quick Start Guide - Fixed Authentication

## The Problem You Had

```json
{
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

This was happening because Spring Boot wasn't loading the `.env` file automatically.

## The Fix

I created a startup script that loads environment variables before starting the backend.

## How to Run Everything

### Terminal 1: Start Backend

```bash
cd backend
./start.sh
```

You should see:
```
Loading environment variables from .env file...
Starting WaterBallSA Backend...
Google OAuth Client ID: 557556497694-0e4u756...
JWT Secret: asSfa-@de3...
```

Wait for:
```
Started WaterballsaBackendApplication in X.XXX seconds
```

### Terminal 2: Start Frontend

```bash
cd frontend
yarn dev
```

Wait for:
```
✓ Ready in X.Xs
○ Local: http://localhost:3000
```

### Test Login

1. Open browser: `http://localhost:3000/test-auth`
2. Check console (F12) - you should see:
   ```
   [GoogleLoginButton] Initializing...
   [GoogleLoginButton] Client ID: Set
   [GoogleLoginButton] Google SDK loaded!
   [GoogleLoginButton] Initialization complete
   ```
3. Click the Google Sign-In button
4. Select your Google account
5. Watch the console logs:
   ```
   [GoogleLoginButton] Received Google response
   [AuthContext] Starting login flow...
   [AuthContext] Exchanging Google token for backend JWT...
   [AuthContext] User profile received: { name: "...", hasProfilePicture: true }
   [AuthContext] Login complete!
   ```

### Check Backend Logs

In Terminal 1, you should see:
```
Google authentication request received
Successfully verified Google token for user: yourname@gmail.com
User authenticated successfully: yourname@gmail.com
```

### Verify Success

After login, the header should show:
- ✅ Your Google profile picture (circular)
- ✅ Your name
- ✅ Logout button

## If It Still Doesn't Work

### 1. Stop Everything

```bash
# Terminal 1 - Stop backend (Ctrl+C)
# Terminal 2 - Stop frontend (Ctrl+C)
```

### 2. Verify .env Files

**Backend (.env):**
```bash
cd backend
cat .env | grep GOOGLE_OAUTH_CLIENT_ID
# Should show: GOOGLE_OAUTH_CLIENT_ID=557556497694-...
```

**Frontend (.env):**
```bash
cd frontend
cat .env | grep NEXT_PUBLIC_GOOGLE_CLIENT_ID
# Should show: NEXT_PUBLIC_GOOGLE_CLIENT_ID=557556497694-...
```

Both should have the **SAME** Google Client ID!

### 3. Restart Backend with Script

```bash
cd backend
./start.sh
```

### 4. Check Backend Startup Logs

Look for:
```
✅ Loading environment variables from .env file...
✅ Google OAuth Client ID: 557556497694-...
✅ Started WaterballsaBackendApplication
```

If you don't see "Loading environment variables...", the script isn't running.

### 5. Test Manually

```bash
# Test backend is running
curl http://localhost:8080/actuator/health
# Should return: {"status":"UP"}

# Test Google OAuth endpoint (will fail without valid token, but shouldn't be 500)
curl -X POST http://localhost:8080/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"test"}'
# Should return 401 Unauthorized, NOT 500!
```

## Documentation Reference

- **BACKEND_SETUP_FIXED.md** - Detailed backend setup explanation
- **TESTING_AUTH.md** - Complete testing guide with troubleshooting
- **LOGIN_FLOW_GUIDE.md** - Visual guide of what you should see
- **AUTH_MIGRATION_COMPLETE.md** - Architecture overview

## Common Issues

### "No such file or directory: ./start.sh"

```bash
cd backend
chmod +x start.sh
./start.sh
```

### Still getting 500 error

1. Check if backend is actually using the new startup method
2. Restart backend with `./start.sh` (not `./mvnw spring-boot:run`)
3. Check logs show "Loading environment variables..."

### Google button doesn't appear

1. Check frontend is running on port 3000
2. Open browser console and look for errors
3. Navigate to `/test-auth` page to see debug info

### Login works but profile picture doesn't show

Check browser console:
```
[AuthContext] User profile received: {
  hasProfilePicture: true,
  profilePictureUrl: "https://..."
}
```

If `hasProfilePicture: false`, your Google account doesn't have a profile picture.

## What Changed

### Before (Broken)
```
Backend starts → Tries to read GOOGLE_OAUTH_CLIENT_ID → Not found → 500 Error
```

### After (Fixed)
```
./start.sh → Loads .env → Sets environment variables → Backend starts → Works!
```

## Next Steps

1. ✅ Start backend with `./start.sh`
2. ✅ Start frontend with `yarn dev`
3. ✅ Test login at `/test-auth`
4. ✅ Verify profile picture shows in header
5. ⬜ Test protected API endpoints
6. ⬜ Test logout functionality
7. ⬜ Test session persistence (refresh page)

---

**Summary:** Always use `./start.sh` to run the backend from now on! 🚀
