# Troubleshooting "Failed to get login URL" Error

## Quick Checks

### 1. Is the Backend Running?
```bash
cd backend
python -m app.app
```

You should see:
```
 * Running on http://0.0.0.0:8000
```

### 2. Check Backend Health
Open in browser or use curl:
```bash
curl http://localhost:8000/health
```

Should return: `{"status": "healthy", "db": "connected"}`

### 3. Check Auth Endpoint Directly
```bash
curl http://localhost:8000/auth/login
```

**If you get an error about Microsoft OAuth not configured:**
- You need to set up Microsoft Azure App Registration
- Add credentials to backend `.env` file

**If you get connection refused:**
- Backend is not running
- Start it with `python -m app.app`

### 4. Check Browser Console
Open browser DevTools (F12) and check:
- Network tab: Is the request to `/auth/login` failing?
- Console tab: What's the exact error message?

## Common Error Messages

### "Backend server not running"
- **Solution**: Start the backend server
```bash
cd backend
python -m app.app
```

### "Microsoft OAuth not configured"
- **Solution**: Set up Microsoft Azure App and add to `.env`:
```env
MICROSOFT_CLIENT_ID=your_client_id_here
MICROSOFT_CLIENT_SECRET=your_client_secret_here
FRONTEND_URL=http://localhost:3000
MICROSOFT_REDIRECT_URI=http://localhost:8000/auth/callback
```

### "CORS error" or "Network Error"
- **Solution**: Check backend CORS configuration in `app.py`
- Make sure `FRONTEND_URL` in backend matches your frontend URL

### "Failed to generate login URL"
- **Solution**: Check backend logs for detailed error
- Usually means MSAL library error or invalid credentials

## Testing Without Microsoft OAuth

If you want to test the app without Microsoft OAuth setup, you can temporarily use a fallback. However, for full functionality, you need Microsoft OAuth configured.

## Next Steps

1. Check browser console for specific error
2. Check backend terminal for error logs
3. Verify backend is running on port 8000
4. Verify Microsoft OAuth credentials are set

