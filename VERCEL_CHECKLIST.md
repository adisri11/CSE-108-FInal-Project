# Vercel + Supabase Deployment Checklist

## Before Deployment

### 1. Backend Setup
- [ ] Create Supabase account at https://supabase.com
- [ ] Create a new project in Supabase
- [ ] Go to Settings > Database > Connection pooling
- [ ] Copy the connection string (PostgreSQL format)
- [ ] Create `backend/.env.production` with:
  ```
  DATABASE_URL=postgresql://[postgres.user]:[password]@[db.supabase.co]:6543/postgres
  SECRET_KEY=generate-a-secure-random-string
  ENVIRONMENT=production
  FRONTEND_URL=https://your-frontend-url.vercel.app
  ```
- [ ] Test backend locally: `python app.py`
- [ ] Visit `http://localhost:5000/api/health` to verify it works

### 2. Push Code to GitHub
```bash
git add .
git commit -m "Configure for Vercel + Supabase deployment"
git push origin main
```

### 3. Deploy Backend to Vercel
- [ ] Go to https://vercel.com/new
- [ ] Select "Other" (not Next.js)
- [ ] Import your GitHub repository
- [ ] Select the `backend` folder as root
- [ ] Add Environment Variables:
  - `DATABASE_URL` = Your Supabase connection string
  - `SECRET_KEY` = Your secure secret key
  - `ENVIRONMENT` = `production`
  - `FRONTEND_URL` = (leave blank for now, update after frontend deployment)
- [ ] Deploy
- [ ] Wait for deployment to complete
- [ ] **Note your backend URL** (e.g., `https://maze-game-backend.vercel.app`)

### 4. Deploy Frontend to Vercel
- [ ] Go to https://vercel.com/new
- [ ] Import your GitHub repository
- [ ] Select the `maze-game` folder as root
- [ ] Set Build Settings:
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`
- [ ] Add Environment Variable:
  - `VITE_API_URL` = Your backend Vercel URL (from step 3)
- [ ] Deploy
- [ ] Wait for deployment to complete
- [ ] **Note your frontend URL** (e.g., `https://maze-game.vercel.app`)

### 5. Update Backend FRONTEND_URL
- [ ] Go back to backend Vercel deployment settings
- [ ] Update `FRONTEND_URL` environment variable with your frontend URL
- [ ] Trigger a redeploy

## Testing Production

1. Visit your frontend URL
2. Sign up a new account
3. Test gameplay:
   - Play the fall or winter maze
   - Complete and earn tokens
   - Verify tokens appear in store
4. Test store:
   - Buy a character
   - Select a different character
   - Play maze with new character
   - Verify character changes work

## Troubleshooting

### "Failed to fetch user"
- Check that `VITE_API_URL` is set correctly in frontend
- Verify backend `FRONTEND_URL` matches your frontend URL
- Check browser console for exact error

### Database connection failed
- Verify `DATABASE_URL` is correct from Supabase
- Test connection in Supabase dashboard
- Make sure connection pooling is enabled

### CORS errors
- Check that `FRONTEND_URL` environment variable on backend matches your actual frontend URL
- No trailing slashes on URLs

### Sessions not working
- Verify cookies are being sent with `credentials: "include"`
- Check that `SESSION_COOKIE_SECURE` is working correctly
- May need to adjust `SameSite` cookie settings

## Environment Variables Quick Reference

### Backend (.env.production)
```
DATABASE_URL=postgresql://user:password@db.supabase.co:6543/postgres
SECRET_KEY=your-secret-key-here
ENVIRONMENT=production
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (.env or Vercel UI)
```
VITE_API_URL=https://your-backend.vercel.app
```

## Important Notes

- ✅ All `localhost` references removed
- ✅ Using environment variables for all URLs
- ✅ Database uses Supabase PostgreSQL
- ✅ CORS configured for your specific frontend URL
- ✅ Secure session cookies for HTTPS
- ✅ Ready for Vercel serverless deployment

## Need Help?

1. Check Vercel logs: Dashboard > Project > Deployments > View Logs
2. Check backend console: `vercel logs`
3. Check Supabase connection: Settings > Database
4. Test API manually: Visit `https://your-backend.vercel.app/api/health`
