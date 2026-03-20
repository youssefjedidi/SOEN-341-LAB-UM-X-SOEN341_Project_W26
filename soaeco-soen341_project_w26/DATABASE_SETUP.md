# Database Setup - Fully Automated! 🚀

## Quick Start

Just run:

```bash
npm run setup-db
```

That's it! The script will automatically create your database tables.

---

## First Time Setup (If Script Fails)

If you see an error about `execute_sql` function not existing, you need to run this SQL **once** in Supabase:

### Step 1: Go to Supabase SQL Editor

1. Open https://supabase.com
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

### Step 2: Run This SQL

```sql
CREATE OR REPLACE FUNCTION execute_sql(sql_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_text;
  RETURN 'SQL executed successfully';
EXCEPTION WHEN OTHERS THEN
  RETURN 'Error: ' || SQLERRM;
END;
$$;
```

### Step 3: Run the Script Again

```bash
npm run setup-db
```

**Done!** ✅

---

## How It Works

The script:
1. Creates a PostgreSQL function that can execute SQL
2. Uses that function to run your migration files
3. Creates the application tables and policies, including `user_profiles`, `recipes`, and `weekly_planner`

## Future Updates

When the database schema changes:
1. Pull the latest code
2. Run `npm run setup-db`
3. Your database updates automatically!

No manual SQL needed after the initial setup.

## Weekly Planner Schema

The current migration set also provisions the weekly planner backend:

- `weekly_planner` stores planner entries by `user_id`, `day_of_week`, `meal_type`, and `recipe_id`
- one unique planner row is allowed per user/day/meal slot
- planner rows are protected with row-level security policies
- recipe assignments can be safely added, replaced, or cleared by rerunning `npm run setup-db`

---

## Troubleshooting

**Error: "Missing environment variables"**
- Make sure you have `SUPABASE_SECRET_KEY` in `.env.local`
- Get it from: Supabase Dashboard → Settings → API → secret key

**Error: "execute_sql function does not exist"**
- Run the SQL from "First Time Setup" above
- Then run `npm run setup-db` again

**Table already exists**
- ✅ That's fine! The script is safe to run multiple times
