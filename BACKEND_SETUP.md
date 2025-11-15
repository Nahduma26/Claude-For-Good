# Backend Setup Instructions

## Quick Start

1. **Create and activate virtual environment:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set up environment variables:**
Create a `.env` file in the `backend` directory:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Microsoft OAuth (required for authentication)
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_REDIRECT_URI=http://localhost:8000/auth/callback
FRONTEND_URL=http://localhost:3000

# JWT
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# AI (optional, for AI features)
GEMINI_API_KEY=your_gemini_api_key
```

4. **Start the server:**
```bash
source .venv/bin/activate  # If not already activated
python -m app.app
```

Or use the provided script:
```bash
./start_server.sh
```

## Troubleshooting

### "No module named 'msal'" or other import errors
- Make sure virtual environment is activated: `source .venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`

### "Backend server not running"
- Check if server is running: `curl http://localhost:8000/health`
- Start server: `python -m app.app` (with venv activated)

### "Microsoft OAuth not configured"
- Set `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET` in `.env` file
- Or the endpoint will return an error message

### Database connection errors
- Make sure PostgreSQL is running
- Check `DATABASE_URL` in `.env` file
- Run migrations: `alembic upgrade head`

