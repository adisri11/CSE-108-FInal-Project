# Maze Game - Vercel + Supabase Deployment

Your application is now configured to deploy on **Vercel** with a **Supabase PostgreSQL** backend.

## Quick Start

### 1. Supabase Setup
- Create a project at https://supabase.com
- Go to Settings > Database to get your connection string
- Copy the connection pooling string (for serverless)

### 2. Backend Deployment
- Go to https://vercel.com/new
- Import your backend folder
- Add environment variables:
  - `DATABASE_URL` (Supabase connection string)
  - `SECRET_KEY` (generate a secure key)
  - `ENVIRONMENT=production`
  - `FRONTEND_URL` (your frontend Vercel URL)
- Deploy and note the backend URL

### 3. Frontend Deployment
- Create `.env.production` in `maze-game/`:
  ```
  VITE_API_URL=https://your-backend.vercel.app
  ```
- Import `maze-game` folder to Vercel
- Set `VITE_API_URL` environment variable
- Deploy!

## Key Changes Made

### Backend (Flask)
- ✅ Configured Supabase PostgreSQL support
- ✅ Added Vercel serverless entry point (`api/index.py`)
- ✅ CORS configured for your frontend URL
- ✅ Environment-aware database selection
- ✅ Health check endpoint

### Frontend (React)
- ✅ Dynamic API URL from environment variables
- ✅ Works with both localhost and Vercel deployments

### Configuration Files
- `backend/.env.production` - Production environment template
- `backend/vercel.json` - Vercel deployment config
- `backend/api/index.py` - Serverless entry point
- `maze-game/.env.example` - Frontend environment template
- `DEPLOYMENT.md` - Full deployment guide

## Environment Variables

### Backend Production
```env
DATABASE_URL=postgresql://user:pass@db.supabase.co:6543/postgres
SECRET_KEY=long-random-secure-string
ENVIRONMENT=production
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend Production
```env
VITE_API_URL=https://your-backend.vercel.app
```

## Development Locally

### Backend
```bash
cd backend
cp .env.production .env  # Copy and edit with local values
python app.py
```

### Frontend
```bash
cd maze-game
npm install
npm run dev
```

## Testing
1. Sign up a new user
2. Play a maze
3. Check tokens are saved
4. Buy a character from store
5. Play with new character

See `DEPLOYMENT.md` for detailed troubleshooting.
