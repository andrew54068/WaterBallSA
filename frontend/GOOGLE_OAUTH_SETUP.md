# Google OAuth Setup Guide

This guide will help you configure Google OAuth for the WaterBallSA frontend.

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen first

## Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type (or Internal if using Google Workspace)
3. Fill in the required information:
   - **App name**: WaterBallSA
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **SAVE AND CONTINUE**
5. Skip adding scopes (default scopes are sufficient)
6. Click **SAVE AND CONTINUE**
7. Add test users if in testing mode (add your Gmail address)
8. Click **SAVE AND CONTINUE**

## Step 3: Create OAuth Client ID

1. Go back to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Select **Web application** as the application type
4. Configure the following:

### Application Name
```
WaterBallSA Frontend
```

### Authorized JavaScript origins
For development:
```
http://localhost:3000
```

For production (when deployed):
```
https://waterballsa.com
https://www.waterballsa.com
```

### Authorized redirect URIs
**CRITICAL**: This must match exactly what NextAuth expects.

For development:
```
http://localhost:3000/api/auth/callback/google
```

For production (when deployed):
```
https://waterballsa.com/api/auth/callback/google
https://www.waterballsa.com/api/auth/callback/google
```

5. Click **CREATE**
6. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Environment Variables

1. Open or create `frontend/.env` file
2. Add your credentials:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-secret-min-32-chars

# API
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Generate NEXTAUTH_SECRET

You can generate a secure secret using:

```bash
openssl rand -base64 32
```

Or in Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 5: Verify Configuration

1. Make sure your backend is running on `http://localhost:8080`
2. Start the frontend dev server:
   ```bash
   cd frontend
   yarn dev
   ```
3. Navigate to `http://localhost:3000`
4. Click the "Login with Google" button
5. You should be redirected to Google's login page

## Troubleshooting

### Error: redirect_uri_mismatch

This means the redirect URI in your Google Console doesn't match what NextAuth is using.

**Solution**:
- Verify the redirect URI in Google Console is exactly: `http://localhost:3000/api/auth/callback/google`
- Make sure NEXTAUTH_URL in .env is: `http://localhost:3000`

### Error: OAuthCallback

This usually means there's an issue with the OAuth flow.

**Solutions**:
- Clear browser cookies and cache
- Try in an incognito window
- Check that your Google Client ID and Secret are correct
- Verify you've added your email as a test user if the app is in testing mode

### Error: Configuration

This means NextAuth is misconfigured.

**Solutions**:
- Verify NEXTAUTH_SECRET is set in .env
- Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Restart the dev server after changing .env

### Error: Access Denied

You clicked "Cancel" or "Deny" on the Google consent screen.

**Solution**: Try logging in again and click "Allow"

## Production Deployment Notes

When deploying to production:

1. Update Google OAuth authorized redirect URIs with your production domain
2. Change NEXTAUTH_URL to your production URL
3. Generate a new, secure NEXTAUTH_SECRET for production
4. Never commit .env files with real credentials to git

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
