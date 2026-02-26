---
sidebar_position: 4
---

# Deployment

Production deployment guide for MongoHacks platform.

## Overview

MongoHacks is a Next.js 15 application best deployed on Vercel with MongoDB Atlas.

**Recommended stack:**
- **Hosting:** Vercel (optimized for Next.js)
- **Database:** MongoDB Atlas (M10+ for Vector Search)
- **AI:** OpenAI API
- **Domain:** Custom domain via Vercel

---

## Prerequisites

### Required Accounts

1. **Vercel Account** - [vercel.com/signup](https://vercel.com/signup)
2. **MongoDB Atlas** - [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register)
3. **OpenAI Account** - [platform.openai.com](https://platform.openai.com/) (for AI features)
4. **GitHub Account** - For repository hosting

---

## MongoDB Atlas Setup

### 1. Create Cluster

**Atlas Dashboard → Create Cluster:**
- **Tier:** M10 or higher (required for Vector Search)
- **Region:** Choose closest to your users
- **Name:** `mongohacks-prod`

**Cost:** ~$60/month for M10

---

### 2. Database User

**Security → Database Access → Add New Database User:**
```
Username: mongohacks-app
Password: [generate strong password]
Roles: Read and write to any database
```

**Save credentials** for `MONGODB_URI`

---

### 3. Network Access

**Security → Network Access → Add IP Address:**
```
0.0.0.0/0  (allow from anywhere)
```

**Why:** Vercel uses dynamic IPs, can't whitelist specific addresses

**Security:** Use strong password, restrict with Atlas App Services if needed

---

### 4. Connection String

**Deployment → Connect → Connect your application:**
```
mongodb+srv://mongohacks-app:<password>@mongohacks-prod.xxxxx.mongodb.net/mongohacks?retryWrites=true&w=majority
```

**Replace:**
- `<password>` with your database password
- Database name: `mongohacks`

---

### 5. Vector Search Indexes

**Atlas Search → Create Search Index:**

**Participant skills index:**
```json
{
  "name": "participant_skills_vector",
  "type": "vectorSearch",
  "fields": [{
    "type": "vector",
    "path": "skillsEmbedding",
    "numDimensions": 1536,
    "similarity": "cosine"
  }]
}
```

**Team skills index:**
```json
{
  "name": "team_skills_vector",
  "type": "vectorSearch",
  "fields": [{
    "type": "vector",
    "path": "desiredSkillsEmbedding",
    "numDimensions": 1536,
    "similarity": "cosine"
  }]
}
```

**Wait for indexes to build** (~5-10 minutes)

---

## OpenAI Setup

### Get API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Name: `mongohacks-production`
4. Copy key (only shown once!)

**Save for `OPENAI_API_KEY` env variable**

---

### Set Usage Limits

**Settings → Limits:**
- **Hard limit:** $100/month (prevent runaway costs)
- **Email alerts:** 75% and 90% thresholds

**Expected usage:** $30-50/month for typical 100-person events

---

## Vercel Deployment

### 1. Push to GitHub

```bash
cd /path/to/mongohacks/hackathon-platform

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/mongohacks-platform.git
git push -u origin main
```

---

### 2. Import to Vercel

**Vercel Dashboard → Add New Project → Import Git Repository:**
1. Authorize GitHub
2. Select `mongohacks-platform` repository
3. Click **Import**

---

### 3. Configure Project

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (if monorepo, specify subdirectory)

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**Node.js Version:** 20.x

---

### 4. Environment Variables

**Vercel Project Settings → Environment Variables:**

```env
# Database
MONGODB_URI=mongodb+srv://mongohacks-app:<password>@mongohacks-prod.xxxxx.mongodb.net/mongohacks?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_SECRET=[generate with: openssl rand -base64 32]
NEXTAUTH_URL=https://your-domain.com

# OpenAI
OPENAI_API_KEY=sk-...

# App Config
NEXT_PUBLIC_URL=https://your-domain.com
```

**Generate `NEXTAUTH_SECRET`:**
```bash
openssl rand -base64 32
```

**Apply to:** Production, Preview, Development

---

### 5. Deploy

Click **Deploy** button

**Build process:**
1. Installs dependencies
2. Runs `npm run build`
3. Optimizes for production
4. Deploys to Vercel Edge Network

**First deployment:** ~3-5 minutes

**Check deployment:** Visit auto-generated URL (e.g., `mongohacks-platform.vercel.app`)

---

## Custom Domain

### 1. Add Domain to Vercel

**Project Settings → Domains → Add:**
```
mongohacks.com
www.mongohacks.com
```

---

### 2. Configure DNS

**Your domain registrar (Namecheap, GoDaddy, etc.):**

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Propagation:** 5 minutes - 48 hours (usually &lt;1 hour)

---

### 3. SSL Certificate

**Automatic:** Vercel provisions SSL via Let's Encrypt

**Check:** Green padlock in browser (https://mongohacks.com)

---

## Post-Deployment Setup

### 1. Seed Database

**Run seed script remotely:**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Run command
vercel env pull .env.production
npx tsx scripts/seed.ts
```

**Or manually via MongoDB Atlas:**
- Use Compass or Atlas UI
- Import seed data JSON
- Create initial admin user

---

### 2. Create Admin User

**Via Atlas Data Explorer:**
```javascript
db.users.insertOne({
  name: "Super Admin",
  email: "admin@mongohacks.com",
  password: "$2a$10$...",  // bcrypt hash of your password
  role: "super_admin",
  active: true,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

**Generate password hash:**
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your-secure-password', 10);
console.log(hash);
```

---

### 3. Test Deployment

**Critical paths:**
1. Visit landing page
2. Register for test event
3. Create team
4. Submit project
5. Judge scoring (if judge assigned)
6. View results

**Monitor:** Vercel Analytics, Function Logs

---

## Environment Management

### Multiple Environments

**Vercel automatically creates:**
- **Production:** `main` branch → mongohacks.com
- **Preview:** Pull requests → unique URL
- **Development:** Local (`npm run dev`)

---

### Environment Variables by Environment

```env
# Production only
MONGODB_URI=mongodb+srv://prod-cluster...

# Preview/Development
MONGODB_URI=mongodb+srv://staging-cluster...
```

**Set in Vercel:** Each env var has checkboxes for Production / Preview / Development

---

## Monitoring

### Vercel Analytics

**Project → Analytics:**
- Page views
- Unique visitors
- Top pages
- Performance metrics
- Web Vitals (LCP, FID, CLS)

**Goals:**
- LCP &lt;2.5s
- FID &lt;100ms
- CLS &lt;0.1

---

### Function Logs

**Project → Functions → Logs:**
- Real-time API logs
- Error tracking
- Execution time
- Memory usage

**Filter by:**
- Status code (500 errors)
- Function name
- Time range

---

### Error Tracking

**Recommended: Sentry integration**

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Benefits:**
- Real-time error alerts
- Stack traces
- User context
- Performance monitoring

---

## Performance Optimization

### Edge Network

**Vercel automatically:**
- Serves from 100+ edge locations
- Caches static assets
- Optimizes images
- Compresses responses

**No configuration needed**

---

### Caching Strategy

**Static pages (landing):**
```typescript
export const revalidate = 3600;  // 1 hour
```

**API routes:**
```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
  }
});
```

---

### Database Connection Pooling

**Already configured** in `src/lib/db/connect.ts`

**Singleton pattern** prevents multiple connections in serverless

**Max connections:** Set in Atlas (default 100 for M10)

---

## Scaling

### Automatic Scaling

**Vercel handles:**
- Auto-scales based on traffic
- No configuration needed
- Pay per execution

**Limits (Pro plan):**
- 100GB bandwidth/month
- Unlimited executions
- 100 concurrent builds

---

### MongoDB Scaling

**Atlas auto-scaling:**
- Enable in cluster settings
- Scales from M10 → M20 → M30 based on load
- Scales back down during low traffic

**Manual scaling:**
- Upgrade tier in Atlas UI
- Takes ~5 minutes
- No downtime

---

## Backup & Recovery

### MongoDB Backups

**Atlas automatic backups:**
- Continuous backups (point-in-time recovery)
- Snapshot every 6 hours
- Retained for 7 days

**Manual snapshot:**
```
Atlas → Backup → Create Snapshot
```

**Restore:**
```
Backups → Select snapshot → Restore
```

---

### Code Backups

**GitHub repository:**
- All code versioned
- Can roll back any deployment

**Vercel deployment history:**
- Project → Deployments
- Redeploy previous version
- Instant rollback

---

## CI/CD Pipeline

### Automatic Deployments

**On every push to `main`:**
```
1. GitHub push detected
2. Vercel starts build
3. Runs tests (if configured)
4. Builds production bundle
5. Deploys to edge network
6. Updates mongohacks.com

Total: 2-3 minutes
```

**On pull requests:**
- Generates preview URL
- Comments on PR with link
- Test changes before merging

---

### Build Status Checks

**Vercel GitHub integration:**
- ✅ Build success → PR mergeable
- ❌ Build fails → PR blocked

**Protect main branch:**
```
GitHub → Settings → Branches → Add rule
- Require status checks
- Require vercel checks to pass
```

---

## Security Best Practices

### 1. Environment Variables

**Never commit:**
- API keys
- Database credentials
- Secrets

**Use `.env.local` (gitignored)**

**Rotate keys:**
- Quarterly rotation
- After any breach
- When team members leave

---

### 2. HTTPS Only

**Force HTTPS:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.url}`
    );
  }
}
```

**Vercel handles automatically**

---

### 3. Rate Limiting

**Protect API routes:**
```typescript
import rateLimit from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  if (!rateLimit.check(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  // Process request
}
```

---

### 4. Database Security

**Atlas security:**
- Network isolation (VPC peering optional)
- Encryption at rest (enabled by default)
- Encryption in transit (TLS/SSL)
- IP whitelist (or all IPs with strong password)

**User permissions:**
- Least privilege principle
- Separate users for app vs admin
- Read-only users for analytics

---

## Cost Estimation

### Monthly Costs

**Vercel Pro:** $20/month
- 100GB bandwidth
- Unlimited executions
- Team collaboration

**MongoDB Atlas M10:** $60/month
- 2GB RAM, 10GB storage
- Handles 500+ participants/event

**OpenAI API:** $30-50/month
- ~$0.04 per participant (embeddings)
- ~$0.02 per project (summaries)
- ~$0.04 per project (feedback)

**Total:** ~$110-130/month

**For 10 events/year, 1000 participants total**

---

### Cost Optimization

**Tips:**
1. Use Vercel Hobby ($0) for testing
2. Scale MongoDB down between events
3. Cache API responses
4. Batch OpenAI requests
5. Monitor usage dashboards

---

## Troubleshooting

### Build Failures

**Check Vercel build logs:**
```
Project → Deployments → [Failed] → View Logs
```

**Common issues:**
- Missing env variables
- TypeScript errors
- Dependency conflicts
- Out of memory

**Fix:**
```bash
# Test build locally
npm run build

# Check for errors
# Fix and push
```

---

### 500 Errors in Production

**Check Function Logs:**
```
Project → Functions → Filter by 5xx status
```

**Common causes:**
- MongoDB connection timeout
- Missing env variable
- Unhandled exception

**Quick fix:**
```
Redeploy previous working version
Fix issue
Deploy again
```

---

### Database Connection Issues

**Symptoms:**
- MongoNetworkError
- Connection timeout

**Checks:**
1. MongoDB URI correct?
2. Database user exists?
3. Network access allows 0.0.0.0/0?
4. Cluster running (not paused)?

**Test connection:**
```bash
mongosh "mongodb+srv://..." --username mongohacks-app
```

---

## Next Steps

- [Set up monitoring](/docs/admin/analytics)
- [Configure custom domain](https://vercel.com/docs/concepts/projects/domains)
- [Enable Vercel Analytics](https://vercel.com/analytics)
- [Set up error tracking](https://sentry.io)
