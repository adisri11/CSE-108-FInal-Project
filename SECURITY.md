# ⚠️ SECURITY GUIDE - Never Commit Credentials

## Critical: Set Environment Variables in Vercel UI, NOT in Files

### Your Credentials (KEEP PRIVATE)
- **DATABASE_URL**: `postgresql://postgres:QBaWvXPIb7ftLOsX@db.echpoiaidsqcaynlygdk.supabase.co:5432/postgres`
- **SECRET_KEY**: `073bb069e67008f68e33e565d92812db4ee2c02fc9ac2630c39ed30e4cd3e6fa`
- **Connection Pooler** (optional, for high traffic): `postgresql://postgres.echpoiaidsqcaynlygdk:QBaWvXPIb7ftLOsX@aws-1-us-west-1.pooler.supabase.com:6543/postgres`

### ✅ Correct Way: Use Vercel Dashboard

1. Go to your backend project on **https://vercel.com/dashboard**
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your actual connection string
   - **Environments**: Check `Production`, `Preview`, `Development`
4. Repeat for `SECRET_KEY` and `FRONTEND_URL`

### ❌ Never Do This
- ❌ Put real credentials in `.env.production`
- ❌ Commit `.env` files to Git
- ❌ Share credentials in code comments
- ❌ Put secrets in Git history

### ✅ What to Commit
- Template files: `.env.example`, `.env.production` (without real values)
- These show what variables are needed
- Use placeholders like `[your-secret-key-here]`

## Why This Matters

If someone finds your credentials:
1. They can access your Supabase database
2. They can modify all user data
3. They can add themselves tokens and characters
4. They can deploy malicious code using your SECRET_KEY

## If Credentials Are Compromised

1. **Immediately regenerate** in Supabase:
   - Settings → Database → Change password
   - Generate new connection string

2. **Rotate SECRET_KEY**:
   - Generate new one: `python -c "import secrets; print(secrets.token_hex(32))"`
   - Update in Vercel

3. **Check Git history**:
   - If accidentally committed, use: `git filter-branch` or `git filter-repo`
   - Or create new repository

## Local Development Setup

1. Create `.env.production` with your real credentials (for local testing only)
2. Add to `.gitignore` (already done)
3. Never push this file to Git
4. For team: Share credentials via secure method (1Password, LastPass, Vercel UI)

## Best Practices

✅ Use environment-specific variables
✅ Rotate secrets regularly
✅ Use strong random keys
✅ Limit database user permissions
✅ Monitor Supabase logs
✅ Use connection pooling for production
✅ Keep `.gitignore` updated

## Current Setup Status

- ✅ `.gitignore` created with `.env.production` ignored
- ✅ `.env.production` is now a template only
- ✅ Ready for production secrets in Vercel UI
- ✅ Safe to commit to Git
