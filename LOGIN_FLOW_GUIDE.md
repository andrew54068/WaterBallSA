# Google Login Flow - Visual Guide

## What You Should See After Login

### Before Login (Header)
```
┌─────────────────────────────────────────────────────────────┐
│ WaterBallSA        Courses  About      [Login with Google]  │
└─────────────────────────────────────────────────────────────┘
```

### After Login (Header)
```
┌──────────────────────────────────────────────────────────────────┐
│ WaterBallSA    Courses  About    [●] John Doe    [Logout]       │
│                                    ↑                             │
│                            Profile Picture                       │
└──────────────────────────────────────────────────────────────────┘
```

The `[●]` represents your circular Google profile picture.

## Step-by-Step Login Process

### 1. Initial State
- Header shows: **"Login with Google"** button
- Console shows:
  ```
  [AuthContext] Initializing auth...
  [AuthContext] No stored token found
  [AuthContext] Initialization complete
  [Header] Render - isLoading: false user: null
  ```

### 2. Click Login Button
- Google Sign-In button appears (rendered by Google SDK)
- Console shows:
  ```
  [GoogleLoginButton] Initializing...
  [GoogleLoginButton] Client ID: Set
  [GoogleLoginButton] Google SDK loaded!
  [GoogleLoginButton] Initializing Google Sign-In...
  [GoogleLoginButton] Rendering button...
  [GoogleLoginButton] Initialization complete
  ```

### 3. Google Authentication Dialog
- A popup or one-tap dialog appears
- Shows your Google accounts
- You select an account

### 4. After Google Authentication
Console shows the complete login flow:
```
[GoogleLoginButton] Received Google response
[AuthContext] Starting login flow...
[AuthContext] Exchanging Google token for backend JWT...
[AuthContext] Received JWT tokens from backend
[AuthContext] Tokens stored in localStorage
[AuthContext] Fetching user profile...
[AuthContext] User profile received: {
  name: "John Doe",
  email: "john@example.com",
  hasProfilePicture: true,
  profilePictureUrl: "https://lh3.googleusercontent.com/..."
}
[AuthContext] Login complete!
[GoogleLoginButton] Login successful
```

### 5. Header Updates Automatically
Console shows:
```
[Header] Render - isLoading: false user: {
  name: "John Doe",
  hasProfilePicture: true,
  profilePictureUrl: "https://lh3.googleusercontent.com/..."
}
```

**Visual change in header:**
- Login button disappears
- Your profile picture appears (circular, 32px)
- Your name appears next to picture
- Logout button appears

### 6. Refresh Page (Session Persistence)
Console shows:
```
[AuthContext] Initializing auth...
[AuthContext] Found stored access token
[AuthContext] Restored user session: {
  name: "John Doe",
  hasProfilePicture: true
}
[AuthContext] Initialization complete
```

**Result:** You stay logged in! Profile picture and name remain visible.

## Console Logs Reference

### Successful Login Flow
1. `[GoogleLoginButton] Received Google response` ← Google auth succeeded
2. `[AuthContext] Starting login flow...` ← Beginning backend exchange
3. `[AuthContext] Received JWT tokens from backend` ← Backend accepted Google token
4. `[AuthContext] Tokens stored in localStorage` ← JWT saved
5. `[AuthContext] User profile received:` ← Got your user data
6. `[AuthContext] Login complete!` ← Success!
7. `[Header] Render` with user object ← Header updates to show profile

### What the Profile Picture Shows
The `profilePicture` field contains your Google profile photo URL, like:
```
https://lh3.googleusercontent.com/a/ACg8ocJ...
```

This is automatically fetched from your Google account and stored in the backend when you first log in.

## Troubleshooting

### Profile Picture Doesn't Show
**Check console logs after login:**

1. Look for: `[AuthContext] User profile received:`
2. Check if `hasProfilePicture: true`
3. Check if `profilePictureUrl` is a valid URL

**If `hasProfilePicture: false`:**
- Your Google account might not have a profile picture set
- Check your Google account at https://myaccount.google.com/

**If `hasProfilePicture: true` but image doesn't display:**
- Check browser console for image loading errors
- Verify the URL in `profilePictureUrl` is accessible
- Check browser's Network tab for failed image requests

### Name Doesn't Show
**Check console logs:**
1. Look for: `[AuthContext] User profile received:`
2. Verify `name: "Your Name"` is populated

**If name is missing:**
- Check backend logs for `/auth/me` endpoint
- Verify backend is returning the user object with `name` field

### Still Shows "Login with Google" After Login
**Check console logs:**
1. Look for: `[Header] Render - isLoading: X user: X`
2. If `user: null` after login, the auth flow failed

**Possible causes:**
- Backend `/auth/google` endpoint failed (check backend logs)
- Backend `/auth/me` endpoint failed (check backend logs)
- Network error (check Network tab in DevTools)

## Testing Checklist

After logging in, verify:

- [ ] Header shows your profile picture (circular image)
- [ ] Header shows your name
- [ ] Header shows "Logout" button
- [ ] Console shows: `[AuthContext] Login complete!`
- [ ] Console shows: `hasProfilePicture: true` and `profilePictureUrl: "https://..."`
- [ ] `localStorage` has `accessToken` (check Application tab in DevTools)
- [ ] `localStorage` has `refreshToken`
- [ ] Refreshing page keeps you logged in

## Example Console Output (Complete Flow)

```javascript
// Page Load
[AuthContext] Initializing auth...
[AuthContext] No stored token found
[AuthContext] Initialization complete
[Header] Render - isLoading: false user: null
[GoogleLoginButton] Initializing...
[GoogleLoginButton] Client ID: Set
[GoogleLoginButton] Google SDK loaded!
[GoogleLoginButton] Initializing Google Sign-In...
[GoogleLoginButton] Rendering button...
[GoogleLoginButton] Initialization complete

// Click Google Sign-In Button → Select Account

// After Google Auth
[GoogleLoginButton] Received Google response
[AuthContext] Starting login flow...
[AuthContext] Exchanging Google token for backend JWT...
[AuthContext] Received JWT tokens from backend
[AuthContext] Tokens stored in localStorage
[AuthContext] Fetching user profile...
[AuthContext] User profile received: {
  name: "John Doe",
  email: "john@example.com",
  hasProfilePicture: true,
  profilePictureUrl: "https://lh3.googleusercontent.com/a/ACg8ocJ..."
}
[AuthContext] Login complete!
[GoogleLoginButton] Login successful
[Header] Render - isLoading: false user: {
  name: "John Doe",
  hasProfilePicture: true,
  profilePictureUrl: "https://lh3.googleusercontent.com/a/ACg8ocJ..."
}
```

## Visual Examples

### Logged Out State
```
Header:
┌────────────────────────────────────────────────────┐
│ 🌊 WaterBallSA  |  Courses  About  | [Google Btn]  │
└────────────────────────────────────────────────────┘
```

### Logged In State
```
Header:
┌────────────────────────────────────────────────────────────┐
│ 🌊 WaterBallSA | Courses  About | 😊 John Doe  [Logout]    │
│                                   ↑                         │
│                          32x32 circular profile image       │
└────────────────────────────────────────────────────────────┘
```

Where `😊` represents your actual Google profile picture.

## Next Steps

1. Test the login flow
2. Check all console logs match the examples above
3. Verify profile picture and name appear in header
4. Test logout functionality
5. Test session persistence (refresh page, should stay logged in)
