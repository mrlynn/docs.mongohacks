---
sidebar_position: 1
---

# Installation

Install and configure MongoHacks for local development or production deployment.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 20+** and npm installed
- **MongoDB Atlas** account (free tier works for development)
- **OpenAI API key** (for AI features)
- **Git** for version control

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mongodb/mongohacks-platform
cd mongohacks-platform
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Next.js 15
- React 19
- Material UI 7
- MongoDB drivers
- OpenAI SDK
- And 50+ other dependencies

**Expected time:** 2-3 minutes

### 3. Configure Environment Variables

Create `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mongohacks?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here-generate-with-openssl-rand-base64-32

# OpenAI (required for AI features)
OPENAI_API_KEY=sk-...

# GitHub OAuth (optional for GitHub login)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

#### How to Get Credentials

**MongoDB URI:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free M0 cluster (or use existing)
3. Click "Connect" → "Drivers"
4. Copy the connection string
5. Replace `<username>` and `<password>` with your database user credentials

**NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**OpenAI API Key:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Copy and save it (you won't see it again!)

**GitHub OAuth (Optional):**
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set callback URL to `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and generate Client Secret

### 4. Initialize the Database

Run the seed script to create initial data:

```bash
npm run db:seed
```

This creates:
- Admin user (email: `admin@mongohacks.com`, password: `admin123`)
- Sample event
- Sample teams and projects
- Test users

**Important:** Change the admin password after first login!

### 5. Start the Development Server

```bash
npm run dev
```

The platform will be available at:
- **App:** http://localhost:3000
- **Admin:** http://localhost:3000/admin

**Login with:**
- Email: `admin@mongohacks.com`
- Password: `admin123`

## Verify Installation

### Check Core Features

1. **Landing Page:** Visit http://localhost:3000
2. **Admin Dashboard:** http://localhost:3000/admin
3. **Create Event:** Admin → Events → Create New Event
4. **Event Hub:** Navigate to your event's hub

### Check AI Features

1. Submit a test project
2. Verify AI summary appears within 30 seconds
3. Score the project as a judge
4. Generate AI feedback

If AI features don't work:
- Verify `OPENAI_API_KEY` is set correctly
- Check OpenAI API usage dashboard
- See [AI Troubleshooting](/docs/ai/overview#troubleshooting)

## Production Deployment

See [Deployment Guide](/docs/development/deployment) for:
- Vercel deployment
- MongoDB Atlas production setup
- Environment variable configuration
- Performance optimization

## Next Steps

- [Configure your first event](/docs/getting-started/first-event)
- [Set up Atlas Vector Search indexes](/docs/ai/vector-search)
- [Configure email notifications](/docs/admin/configuration)

## Troubleshooting

### MongoDB Connection Errors

**Error:** `MongoServerError: Authentication failed`

**Solution:** Check your MongoDB username and password in the connection string.

---

**Error:** `MongoNetworkError: connect ECONNREFUSED`

**Solution:** Verify your IP is whitelisted in Atlas Network Access settings.

### Build Errors

**Error:** `Module not found: Can't resolve '@mui/material'`

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### OpenAI API Errors

**Error:** `401 Unauthorized`

**Solution:** Verify your API key starts with `sk-` and has correct permissions.

---

**Error:** `429 Rate limit exceeded`

**Solution:** Wait 60 seconds or upgrade your OpenAI plan.

## Support

Still having issues?

- Check [GitHub Issues](https://github.com/mongodb/mongohacks-platform/issues)
- Join [Discord community](https://discord.gg/mongodb)
- Email support: mongohacks@mongodb.com
