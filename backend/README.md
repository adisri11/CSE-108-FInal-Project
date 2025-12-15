# Maze Game Backend

Backend API for the Maze Game application using Flask and Supabase.

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```
FLASK_ENV=development
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key-here
```

For Supabase, your DATABASE_URL will look like:
```
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

### 3. Run the Server

```bash
python app.py
```

The backend will run on `http://localhost:5000`

## Supabase Integration

To use Supabase instead of SQLite:

1. Create a Supabase project at https://supabase.com
2. Get your database connection string from the project settings
3. Update `DATABASE_URL` in your `.env` file
4. Change `app.config["SQLALCHEMY_DATABASE_URI"]` in `app.py` to use the environment variable

## API Endpoints

- `POST /signup` - Create a new account
- `POST /login` - Login to account
- `GET /api/user` - Get current user data
- `POST /api/complete-maze` - Record maze completion
- `GET /api/store/items` - Get store items
- `POST /api/store/buy` - Purchase item from store
- `GET /logout` - Logout user

## Deployment with Vercel

When deploying with Vercel:

1. Add environment variables to Vercel project settings
2. Create a `vercel.json` configuration file (example included)
3. Update the frontend to point to your Vercel backend URL
