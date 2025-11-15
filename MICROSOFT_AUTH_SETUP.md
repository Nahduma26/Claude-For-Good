# Microsoft OAuth Authentication Setup

## ✅ Integration Complete

The frontend now uses real Microsoft OAuth authentication instead of simulated login.

### Changes Made

1. **Frontend Auth Service** (`frontend/src/services/authService.ts`)
   - Updated `getLoginUrl()` to call backend `/auth/login` endpoint
   - Updated `handleCallback()` to exchange code for JWT token
   - Removed simulated login methods

2. **Login Page** (`frontend/src/pages/LoginPage.tsx`)
   - Now redirects to Microsoft OAuth when "Sign in with Microsoft" is clicked
   - Gets OAuth URL from backend and redirects user

3. **Auth Callback Page** (`frontend/src/pages/AuthCallback.tsx`)
   - New page to handle OAuth callback
   - Processes token from backend redirect
   - Stores JWT and user info in localStorage
   - Redirects to dashboard on success

4. **Backend Auth Module** (`backend/app/modules/auth.py`)
   - Updated redirect URI to point to frontend: `http://localhost:3000/auth/callback`
   - Backend callback now redirects to frontend with JWT token in URL
   - Properly URL-encodes user data

5. **App Routing** (`frontend/src/App.tsx`)
   - Added handling for `/auth/callback` route
   - Updates authentication state after callback

### OAuth Flow

1. User clicks "Sign in with Microsoft" on login page
2. Frontend calls `/auth/login` to get Microsoft OAuth URL
3. User is redirected to Microsoft login page
4. User authenticates with Microsoft
5. Microsoft redirects to `http://localhost:3000/auth/callback?code=...`
6. Backend `/auth/callback` processes the code
7. Backend creates/updates user, generates JWT
8. Backend redirects to frontend with token: `http://localhost:3000/auth/callback?token=...&user_id=...&email=...&name=...`
9. Frontend callback page stores token and user info
10. User is redirected to dashboard

### Environment Variables Required

**Backend** (`.env` file):
```env
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_TENANT_ID=common  # or your tenant ID
FRONTEND_URL=http://localhost:3000
MICROSOFT_REDIRECT_URI=http://localhost:3000/auth/callback
```

### Microsoft Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure Active Directory > App registrations
3. Create a new registration or use existing
4. Set redirect URI to: `http://localhost:3000/auth/callback`
5. Add API permissions:
   - `User.Read` (Microsoft Graph)
   - `Mail.Read` (Microsoft Graph)
   - `Mail.Send` (Microsoft Graph)
6. Create a client secret
7. Copy Client ID and Client Secret to `.env` file

### Testing

1. Make sure backend has Microsoft OAuth credentials configured
2. Start backend: `cd backend && python -m app.app`
3. Start frontend: `cd frontend && npm start`
4. Click "Sign in with Microsoft"
5. Complete Microsoft authentication
6. Should redirect back to dashboard with user logged in

### Security Notes

- Currently, JWT token is passed in URL during redirect (for SPA compatibility)
- In production, consider using:
  - HTTP-only cookies for token storage
  - PostMessage API for token exchange
  - Or a more secure token exchange mechanism

### Troubleshooting

- **"Failed to get login URL"**: Check backend is running and `MICROSOFT_CLIENT_ID` is set
- **"Authentication failed"**: Check `MICROSOFT_CLIENT_SECRET` and redirect URI matches Azure app registration
- **CORS errors**: Ensure `FRONTEND_URL` in backend matches frontend URL
- **Redirect URI mismatch**: Make sure redirect URI in Azure matches `MICROSOFT_REDIRECT_URI` in backend

