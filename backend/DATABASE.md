# Database Setup - Travel Baseball Platform

## PostgreSQL Configuration

The application now uses PostgreSQL for persistent data storage, solving the serverless function data isolation issue.

### Quick Setup Options

#### Option 1: Supabase (Recommended - Free tier available)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string (looks like: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`)
5. In Vercel, add environment variable: `DATABASE_URL=your-connection-string`

#### Option 2: Railway (Free tier available)
1. Go to [railway.app](https://railway.app) and create account
2. Create new project and add PostgreSQL
3. Copy the DATABASE_URL from the Variables tab
4. In Vercel, add environment variable: `DATABASE_URL=your-connection-string`

#### Option 3: Heroku Postgres (Free tier available)
1. Create Heroku app
2. Add Heroku Postgres addon
3. Get DATABASE_URL from app settings
4. In Vercel, add environment variable: `DATABASE_URL=your-connection-string`

### Environment Variables

Add this to your Vercel environment variables:

```
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
```

### Database Schema

The application automatically creates these tables:

#### Teams Table
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `location` (TEXT)
- `state` (TEXT)
- `age_groups` (TEXT) - JSON string of age groups
- `description` (TEXT)
- `status` (TEXT DEFAULT 'pending') - 'pending' or 'approved'
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `user_id` (TEXT)
- `user_name` (TEXT)
- `user_email` (TEXT)
- `review_count` (INTEGER DEFAULT 0)

#### Tournaments Table
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `location` (TEXT)
- `start_date` (TIMESTAMP)
- `end_date` (TIMESTAMP)
- `age_groups` (TEXT) - JSON string
- `description` (TEXT)
- `entry_fee` (INTEGER)
- `max_teams` (INTEGER)
- `status` (TEXT DEFAULT 'active')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `user_id` (TEXT)
- `user_name` (TEXT)
- `user_email` (TEXT)
- `review_count` (INTEGER DEFAULT 0)

### Default Data

The system automatically inserts sample data:
- 3 teams (2 approved, 1 pending)
- 2 tournaments

### API Functionality

With PostgreSQL, the following now works correctly:

✅ **Team Suggestions**: Submit team → appears in admin dashboard
✅ **Admin Approval**: Approve/reject teams from admin panel
✅ **Data Persistence**: All data persists across function invocations
✅ **CRUD Operations**: Full create, read, update, delete functionality
✅ **Statistics**: Real-time stats (total teams, pending, approved)

### Testing the Setup

1. Deploy with DATABASE_URL environment variable
2. Test team suggestion: `POST /api/teams`
3. Check admin pending teams: `GET /api/admin/pending-teams`
4. Test approval: `PUT /api/admin/teams/{id}/approve`

The team should now appear in the admin dashboard and approval should work correctly!