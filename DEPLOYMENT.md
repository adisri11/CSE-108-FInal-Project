# Deployment Guide: Vercel + Supabase

This guide will help you deploy the maze game frontend to Vercel and the backend to Vercel with Supabase PostgreSQL database.

## Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com
2. **Supabase Account** - Sign up at https://supabase.com
3. **Git Repository** - Push your code to GitHub/GitLab/Bitbucket

## Step 1: Set Up Supabase Database

1. Go to https://supabase.com and create a new project
2. Wait for the project to initialize
3. Go to **Settings > Database** to find your connection string:
   - Look for "Connection pooling" section (recommended for serverless)
   - Copy the connection string
   - Format: `postgresql://[user]:[password]@[host]:6543/postgres`

4. Create a `.env.local` file in the `backend/` folder:
```
DATABASE_URL=postgresql://[user]:[password]@[host]:6543/postgres
SECRET_KEY=generate-a-long-random-string-here
ENVIRONMENT=production
FRONTEND_URL=https://your-app.vercel.app
```

5. Test the connection locally:
```bash
cd backend
python app.py
# Visit http://localhost:5000/api/health
```

## Step 2: Deploy Backend to Vercel

1. Push your code to GitHub:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

2. Create a separate repository for the backend (optional but recommended):
```bash
cd backend
git init
git add .
git commit -m "Initial backend commit"
git remote add origin https://github.com/your-username/maze-game-backend.git
git push origin main
```

3. Go to https://vercel.com/new and import the backend repository
4. Configure environment variables:
   - **DATABASE_URL** - Your Supabase connection string
   - **SECRET_KEY** - Generate a secure random key
   - **ENVIRONMENT** - Set to `production`
   - **FRONTEND_URL** - Your frontend Vercel URL (e.g., https://maze-game.vercel.app)

5. Deploy and note the backend URL (e.g., `https://maze-game-backend.vercel.app`)

## Step 3: Deploy Frontend to Vercel

1. Create/update `maze-game/.env.production` with:
```
VITE_API_URL=https://maze-game-backend.vercel.app
```

2. Go to https://vercel.com/new and import the frontend repository
3. Configure:
   - **Root Directory** - `maze-game`
   - **Build Command** - `npm run build`
   - **Output Directory** - `dist`
   - **Environment Variables** - Add `VITE_API_URL` with your backend URL

4. Deploy!

## Step 4: Test the Deployment

1. Visit your frontend URL
2. Sign up a new account
3. Play a maze and earn tokens
4. Visit the store to buy characters
5. Check that everything works end-to-end

## Troubleshooting

### Issue: "Failed to fetch user" errors
- Check that `VITE_API_URL` is correctly set to your backend URL
- Verify CORS is enabled in backend (should be automatic)
- Check browser console for exact error messages

### Issue: Database connection failed
- Verify `DATABASE_URL` is correct from Supabase
- Make sure connection pooling is enabled
- Check Supabase firewall rules allow your Vercel IP

### Issue: Sessions not persisting
- Ensure `FRONTEND_URL` matches your actual Vercel URL
- Check that cookies are being sent with credentials
- Vercel may require different session handling

## Environment Variables Reference

### Backend (.env)
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `SECRET_KEY` - Flask session secret (generate with: `python -c "import secrets; print(secrets.token_hex(32))"`)
- `ENVIRONMENT` - Set to `production` for Vercel
- `FRONTEND_URL` - Your frontend URL for CORS

### Frontend (.env.production)
- `VITE_API_URL` - Your backend Vercel URL (no trailing slash)

## Security Notes

1. Never commit `.env` files with real credentials
2. Use Vercel's environment variable UI to manage secrets
3. Regenerate `SECRET_KEY` for production
4. Keep dependencies updated for security patches

## Next Steps

- Monitor logs in Vercel dashboard
- Set up error tracking with Sentry or similar
- Implement rate limiting for API endpoints
- Add database backups for Supabase
