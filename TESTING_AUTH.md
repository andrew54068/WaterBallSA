# Testing Google Authentication

## Quick Start

### 1. Start the Backend
```bash
cd backend
./mvnw spring-boot:run
```

Wait until you see "Started WaterballsaBackendApplication" in the logs.

### 2. Start the Frontend (in a new terminal)
```bash
cd frontend
yarn dev
```

Wait until you see:
```
✓ Ready in X.Xs
○ Local:   http://localhost:3000
```

### 3. Test Authentication

Open your browser and navigate to:
```
http://localhost:3000/test-auth
```

This test page will show you:
- ✅ Whether the Google SDK loaded successfully
- ✅ Whether your Client ID is configured
- ✅ The actual Google Sign-In button
- ✅ Debug information and troubleshooting tips

### 4. Check Browser Console

Open Developer Tools (F12) → Console tab

You should see logs like:
```
[GoogleLoginButton] Initializing...
[GoogleLoginButton] Client ID: Set
[GoogleLoginButton] Google SDK loaded!
[GoogleLoginButton] Initializing Google Sign-In...
[GoogleLoginButton] Rendering button...
[GoogleLoginButton] Initialization complete
```

### 5. Click the Google Sign-In Button

When you click the button, you should see:
1. Google's authentication dialog (popup or one-tap)
2. List of your Google accounts
3. After selecting an account, you'll be redirected back to the app
4. You should see your profile in the header

## Troubleshooting

### "Google SDK not loaded"

**Symptoms**: The test page shows "Google SDK Loaded: ✗ No"

**Solutions**:
1. Check your internet connection
2. Look in browser console for errors loading the script
3. Try refreshing the page
4. Check if any ad blocker is blocking the SDK

### "Client ID: NOT SET"

**Symptoms**: The test page shows "Client ID: NOT SET"

**Solutions**:
1. Verify `frontend/.env` has this line:
   ```bash
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=557556497694-0e4u756duicjna0u9ni3g75dn4l3kjeg.apps.googleusercontent.com
   ```
2. Restart the dev server (Ctrl+C, then `yarn dev` again)
3. Hard refresh the browser (Cmd+Shift+R or Ctrl+Shift+R)

### Button doesn't appear

**Symptoms**: Nothing shows in the "Login Test" box

**Check console logs**:
1. Open DevTools → Console
2. Look for `[GoogleLoginButton]` logs
3. Find the error message

**Common issues**:
- SDK not loaded → See "Google SDK not loaded" above
- Client ID not set → See "Client ID: NOT SET" above
- JavaScript error → Check console for red errors

### Button appears but nothing happens when clicked

**Symptoms**: Button renders but clicking it does nothing

**Solutions**:
1. Check browser console for errors
2. Verify you're using a supported browser (Chrome, Firefox, Safari, Edge)
3. Check if popup blockers are enabled
4. Try opening in an incognito/private window

### "Login failed" error

**Symptoms**: Google dialog appears, but after selecting account you get an error

**Check**:
1. Is backend running? (`http://localhost:8080`)
2. Open Network tab in DevTools
3. Look for a request to `/api/auth/google`
4. Check the response for errors

**Common backend errors**:
- "Invalid ID token" → Google Client ID mismatch between frontend and backend
- "Connection refused" → Backend not running
- CORS error → Backend CORS not configured for localhost:3000

### CORS Error

**Symptoms**: Console shows CORS policy error

**Fix**: Verify backend `SecurityConfig.java` has:
```java
.cors(cors -> cors.configurationSource(request -> {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:3000"));
    // ...
}))
```

## Debug Checklist

Before asking for help, verify:

- [ ] Backend is running on `http://localhost:8080`
- [ ] Frontend is running on `http://localhost:3000`
- [ ] `.env` file has `NEXT_PUBLIC_GOOGLE_CLIENT_ID=...`
- [ ] Dev server was restarted after changing `.env`
- [ ] Test page shows "Google SDK Loaded: ✓ Yes"
- [ ] Test page shows "Client ID: 557556497694-..."
- [ ] Browser console shows `[GoogleLoginButton] Initialization complete`
- [ ] No red errors in browser console
- [ ] No popup blocker is active

## Expected Console Output

### Successful initialization:
```
[GoogleLoginButton] Initializing...
[GoogleLoginButton] Client ID: Set
[GoogleLoginButton] Waiting for Google SDK to load...
[GoogleLoginButton] Google SDK loaded!
[GoogleLoginButton] Initializing Google Sign-In...
[GoogleLoginButton] Rendering button...
[GoogleLoginButton] Initialization complete
```

### Successful login:
```
[GoogleLoginButton] Received Google response
[GoogleLoginButton] Login successful
```

## Test URLs

- **Test Page**: http://localhost:3000/test-auth
- **Home Page**: http://localhost:3000
- **Backend Health**: http://localhost:8080/actuator/health (if actuator enabled)
- **Backend Swagger**: http://localhost:8080/swagger-ui.html

## Next Steps After Successful Test

Once you confirm the button appears and Google dialog shows:

1. Complete the login process
2. Verify you see your profile in the header on home page
3. Check that localStorage has `accessToken` and `refreshToken`
4. Try making an API call to a protected endpoint
5. Test logout functionality

## Need Help?

If you're still having issues:

1. Copy all console logs (especially `[GoogleLoginButton]` logs)
2. Note which step fails in the checklist above
3. Check backend logs for errors
4. Include screenshots of the test page
