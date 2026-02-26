---
sidebar_position: 2
---

# Configuration

Configure MongoHacks for your organization with environment variables, branding, and feature flags.

## Environment Variables

### Required Variables

```bash
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mongohacks?retryWrites=true&w=majority

# NextAuth (Authentication)
NEXTAUTH_URL=http://localhost:3000  # Your app URL
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# OpenAI (AI Features)
OPENAI_API_KEY=sk-...  # Required for summaries, feedback, team matching
```

#### How to Get Each Credential

**MongoDB URI:**
```bash
# 1. Create cluster at https://cloud.mongodb.com
# 2. Click "Connect" → "Drivers"
# 3. Copy connection string
# 4. Replace <username> and <password> with your DB user credentials
```

**NEXTAUTH_SECRET:**
```bash
# Generate a secure random string
openssl rand -base64 32
```

**OpenAI API Key:**
```bash
# 1. Sign up at https://platform.openai.com
# 2. Go to API Keys section
# 3. Create new secret key
# 4. Copy immediately (won't be shown again)
```

---

### Optional Variables

```bash
# OAuth Providers
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-secret

# Email (Future Feature)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
FROM_EMAIL=noreply@mongohacks.com

# File Uploads (Future Feature)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=mongohacks-uploads
AWS_REGION=us-east-1

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # Google Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...  # PostHog

# Feature Flags
ENABLE_AI_FEATURES=true  # Default: true
ENABLE_VECTOR_SEARCH=true  # Default: true (requires Atlas M10+)
ENABLE_SOCIAL_LOGIN=true  # Default: true
```

---

## Configuration Files

### Database Configuration

**Location:** `src/lib/db/connection.ts`

```typescript
// MongoDB connection options
const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
  w: 'majority',
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};
```

**Adjust for production:**
- Increase `maxPoolSize` to 50-100 for high traffic
- Set `serverSelectionTimeoutMS` to 10000 for slower networks
- Enable connection monitoring

---

### Authentication Configuration

**Location:** `src/lib/auth.ts`

```typescript
// NextAuth providers
providers: [
  CredentialsProvider({
    // Email/password login
  }),
  GitHubProvider({
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }),
  // Add more providers here
]
```

**Available providers:**
- Credentials (email/password) - built-in
- GitHub - requires OAuth app
- Google - requires OAuth app
- Discord - requires OAuth app
- Magic Link - requires email setup

**Session configuration:**
```typescript
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

---

### OpenAI Configuration

**Location:** `src/lib/ai/`

**Default models:**
```typescript
// Text generation (summaries, feedback)
model: "gpt-4-turbo"
max_tokens: 150 (summaries) / 500 (feedback)
temperature: 0.6 (summaries) / 0.7 (feedback)

// Embeddings (vector search)
model: "text-embedding-3-small"
dimensions: 1536
```

**Cost optimization:**
- Use `gpt-3.5-turbo` for summaries (5x cheaper)
- Reduce `max_tokens` to 100 for summaries
- Cache embeddings (don't regenerate)

**Rate limiting:**
```typescript
// Set in OpenAI dashboard
soft_limit: $20/month
hard_limit: $50/month
```

---

## Branding Configuration

### Theme Customization

**Location:** `src/styles/theme.ts`

```typescript
export const mongoBrand = {
  // Your brand colors
  springGreen: "#00ED64",
  forestGreen: "#00684A",
  slateBlue: "#001E2B",
  // ... customize as needed
};
```

**To customize:**
1. Update color values in `mongoBrand` object
2. Adjust typography in `hackathonTheme.typography`
3. Modify component styles in `hackathonTheme.components`

### Logo & Assets

**Locations:**
- `/public/logo.svg` - Main logo (navbar, emails)
- `/public/logo-dark.svg` - Dark mode logo (optional)
- `/public/favicon.ico` - Browser tab icon
- `/public/og-image.jpg` - Social media preview (1200x630)

**Recommended sizes:**
- Logo: SVG (scalable) or PNG at 200x60px
- Favicon: 32x32 or 64x64 ICO
- OG Image: 1200x630 PNG/JPG

### Landing Page Branding

**Per-event customization in admin:**
1. Go to Admin → Events → [Event] → Landing Page
2. Upload background image (1920x1080+ recommended)
3. Set primary color, accent color
4. Customize hero text, description
5. Add partner logos

---

## Feature Flags

### Enable/Disable Features

**Location:** `.env.local`

```bash
# AI Features
ENABLE_AI_FEATURES=true
ENABLE_VECTOR_SEARCH=true

# Social Features
ENABLE_TEAM_CHAT=false  # Not implemented yet
ENABLE_SOCIAL_LOGIN=true

# Admin Features
ENABLE_ANALYTICS=true
ENABLE_EMAIL_NOTIFICATIONS=false  # Not implemented yet
```

**In code (feature checks):**
```typescript
// Check if AI features enabled
if (process.env.ENABLE_AI_FEATURES === 'true') {
  await generateProjectSummary(project);
}
```

---

## MongoDB Atlas Setup

### Cluster Configuration

**Minimum Requirements:**
- **Free Tier (M0):** Development only, no vector search
- **M10:** Minimum for vector search, 2GB RAM
- **M30:** Recommended for production, 8GB RAM

**Atlas Configuration:**
1. **Network Access**
   - Add current IP for development
   - Add `0.0.0.0/0` for deployment (Vercel/Heroku)
   - Or use VPC peering for security

2. **Database User**
   - Create user with `readWrite` on `mongohacks` database
   - Use strong password (32+ characters)
   - Store in environment variable

3. **Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/mongohacks?retryWrites=true&w=majority
   ```

### Vector Search Indexes

**Required for AI team matching:**

```bash
# Create via Atlas UI or CLI
atlas clusters search indexes create \
  --clusterName mongohacks-cluster \
  --file participant-skills-index.json
```

**Index definitions:** See [Vector Search Setup](/docs/ai/vector-search)

---

## Security Configuration

### Production Checklist

- [ ] Strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] MongoDB user password (32+ characters)
- [ ] IP whitelist in Atlas (not `0.0.0.0/0` if possible)
- [ ] HTTPS enabled (`NEXTAUTH_URL=https://...`)
- [ ] Rate limiting enabled (future feature)
- [ ] CORS configured properly
- [ ] CSP headers set (future feature)

### Secrets Management

**Development:**
```bash
# .env.local (never commit!)
MONGODB_URI=...
NEXTAUTH_SECRET=...
OPENAI_API_KEY=...
```

**Production (Vercel):**
1. Go to Project Settings → Environment Variables
2. Add each variable
3. Check "Encrypt" for sensitive values
4. Deploy

**Production (Docker):**
```bash
# Use Docker secrets or .env file
docker run -e MONGODB_URI=$MONGODB_URI \
           -e NEXTAUTH_SECRET=$NEXTAUTH_SECRET \
           -e OPENAI_API_KEY=$OPENAI_API_KEY \
           mongohacks/platform
```

---

## Performance Configuration

### Next.js Optimization

**Location:** `next.config.mjs`

```javascript
const config = {
  // Image optimization
  images: {
    domains: ['cdn.mongohacks.com', 'avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Compression
  compress: true,
  
  // Bundle optimization
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          name: 'vendor',
          priority: 10,
        },
      },
    };
    return config;
  },
};
```

### Database Optimization

**Connection pooling:**
```typescript
// Adjust based on traffic
maxPoolSize: 100  // Production
minPoolSize: 10   // Keep warm connections
```

**Query optimization:**
- All critical indexes created (Phase 4.1 ✅)
- Use projection to limit fields
- Lean queries for read-only data

**Caching (future):**
- Redis for session storage
- CDN for static assets
- Service worker for offline support

---

## Monitoring Configuration

### Application Logs

**Location:** `logs/`

```bash
# Log levels
LOG_LEVEL=info  # debug, info, warn, error

# Log format
LOG_FORMAT=json  # json or text
```

**View logs:**
```bash
# Development
tail -f logs/app.log

# Production (Vercel)
vercel logs --follow
```

### Database Monitoring

**Atlas Monitoring:**
1. Go to Atlas → Monitoring
2. Enable alerts for:
   - CPU > 80%
   - Connections > 80% of max
   - Slow queries > 100ms
   - Disk usage > 80%

### OpenAI Monitoring

**Usage tracking:**
1. Go to OpenAI Platform → Usage
2. Set billing alerts at $20 (soft) and $50 (hard)
3. Monitor daily usage graph
4. Check for anomalies

---

## Development vs Production

### Development Configuration

```bash
# .env.local
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mongohacks  # Local DB
NEXTAUTH_URL=http://localhost:3000
ENABLE_DEBUG_LOGS=true
```

### Production Configuration

```bash
# Vercel environment variables
NODE_ENV=production
MONGODB_URI=mongodb+srv://...  # Atlas cluster
NEXTAUTH_URL=https://mongohacks.com
ENABLE_DEBUG_LOGS=false
```

**Key differences:**
- Production uses Atlas, dev can use local MongoDB
- Production requires HTTPS
- Debug logs disabled in production
- Minified bundles in production
- Source maps disabled in production

---

## Troubleshooting

### Common Configuration Issues

**MongoDB Connection Fails:**
```bash
Error: Authentication failed

Fix:
1. Check username/password in URI
2. Verify IP whitelist in Atlas
3. Confirm database user has readWrite permissions
```

**NextAuth Errors:**
```bash
Error: [next-auth] no secret provided

Fix:
1. Set NEXTAUTH_SECRET in .env.local
2. Restart dev server
3. Clear browser cookies
```

**OpenAI API Errors:**
```bash
Error: 401 Unauthorized

Fix:
1. Verify OPENAI_API_KEY starts with "sk-"
2. Check API key is active (not revoked)
3. Confirm billing is set up
```

---

## Next Steps

- [Create your first event](/docs/getting-started/first-event)
- [Set up vector search indexes](/docs/ai/vector-search)
- [Configure admin users](/docs/admin/users)
- [Deploy to production](/docs/development/deployment)
