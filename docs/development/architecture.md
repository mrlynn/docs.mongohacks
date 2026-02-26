---
sidebar_position: 1
---

# Architecture

MongoHacks platform architecture, tech stack, and design decisions.

## Tech Stack

### Frontend

**Framework:**
- Next.js 15 (App Router)
- React 19 (Server Components + Client Components)
- TypeScript 5.3+

**UI Framework:**
- Material UI 7 (MUI)
- Custom MongoDB brand theme
- CSS-in-JS with Emotion

**Why Next.js 15 + React 19?**
- Server Components for better performance
- App Router for modern routing
- Built-in API routes
- Edge-compatible middleware
- Excellent TypeScript support

---

### Backend

**API Layer:**
- Next.js API Routes (REST)
- Server Actions (future)

**Database:**
- MongoDB with Mongoose ODM
- MongoDB Atlas (cloud-hosted)
- Atlas Vector Search for AI

**Authentication:**
- NextAuth.js (v5)
- JWT sessions
- OAuth providers (GitHub, Google)
- Credentials provider (email/password)

**AI Services:**
- OpenAI GPT-4 Turbo (summaries, feedback)
- OpenAI text-embedding-3-small (vectors)

---

### Infrastructure

**Deployment:**
- Vercel (recommended)
- Docker (alternative)
- Self-hosted (possible)

**Database:**
- MongoDB Atlas M10+ (production)
- Local MongoDB (development)

**File Storage:**
- URL-based (GitHub, external CDN)
- AWS S3 (future feature)

---

## Project Structure

```
mongohacks-platform/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (app)/               # Main application routes
│   │   │   ├── admin/           # Admin pages
│   │   │   ├── events/          # Event pages
│   │   │   ├── judging/         # Judge interfaces
│   │   │   └── dashboard/       # User dashboard
│   │   ├── api/                 # API routes
│   │   │   ├── admin/          # Admin APIs
│   │   │   ├── events/         # Event APIs
│   │   │   ├── judging/        # Judging APIs
│   │   │   └── auth/           # NextAuth endpoints
│   │   └── [slug]/              # Dynamic landing pages
│   ├── components/              # React components
│   │   ├── shared-ui/          # Reusable UI components
│   │   └── admin/              # Admin-specific components
│   ├── lib/                     # Core library code
│   │   ├── db/                 # Database layer
│   │   │   ├── connection.ts   # MongoDB connection
│   │   │   └── models/         # Mongoose models
│   │   ├── ai/                 # AI services
│   │   │   ├── summary-service.ts
│   │   │   ├── feedback-service.ts
│   │   │   ├── embedding-service.ts
│   │   │   └── matching-engine.ts
│   │   ├── auth.ts             # NextAuth configuration
│   │   └── utils/              # Utilities
│   ├── styles/                  # Global styles & theme
│   │   └── theme.ts            # MUI theme config
│   └── types/                   # TypeScript types
│       └── index.ts            # Shared type definitions
├── public/                      # Static assets
├── scripts/                     # Utility scripts
└── docs/                        # Documentation (separate repo)
```

---

## Routing Architecture

### App Router Structure

MongoHacks uses Next.js 15 App Router with route groups:

```
app/
├── (app)/              # Main app (requires auth)
│   ├── layout.tsx     # App layout with navbar
│   ├── admin/         # Admin routes
│   ├── events/        # Event routes
│   ├── judging/       # Judge routes
│   └── dashboard/     # User dashboard
├── (auth)/            # Auth pages (no navbar)
│   ├── login/
│   └── register/
├── api/               # API routes
└── [slug]/            # Landing pages (dynamic)
```

**Route groups `()` don't affect URL:**
- `(app)/dashboard` → `/dashboard`
- `(auth)/login` → `/login`

---

### Server vs Client Components

**Default:** All components are Server Components

**Use Server Components when:**
- Fetching data from database
- Rendering static content
- SEO matters
- No interactivity needed

**Use Client Components when:**
- Need useState, useEffect, event handlers
- Using browser APIs
- Interactive forms
- Real-time updates

**Pattern:**
```
page.tsx (Server)
  ↓ fetches data
ClientComponent.tsx (Client)
  ↓ handles interactions
```

**Example:**
```tsx
// app/events/[eventId]/page.tsx (Server)
export default async function EventPage({ params }) {
  const event = await getEvent(params.eventId);  // Direct DB query
  return <EventClient event={event} />;
}

// EventClient.tsx (Client)
"use client";
export default function EventClient({ event }) {
  const [loading, setLoading] = useState(false);
  // Interactive logic here
}
```

---

## Data Flow

### Registration Flow

```
Landing Page (Server)
    ↓
Registration Form (Client)
    ↓ POST /api/events/[eventId]/register
API Route (Server)
    ↓ 1. Validate input
    ↓ 2. Create User
    ↓ 3. Create Participant
    ↓ 4. Generate skill embedding (async)
    ↓ 5. Return session token
    ↓
Client receives token
    ↓ NextAuth sets cookie
    ↓ Redirect to Event Hub
Event Hub (Server)
    ↓ Fetch participant + event + teams
    ↓ Calculate next milestone
    ↓
Render personalized hub
```

---

### Team Matching Flow

```
Participant registers with skills
    ↓
OpenAI generates embedding (1536-dim vector)
    ↓
Store in participant.skillsEmbedding
    ↓
Team created with desired skills
    ↓
OpenAI generates embedding
    ↓
Store in team.desiredSkillsEmbedding
    ↓
Event Hub loads
    ↓
Server queries Atlas Vector Search:
    db.teams.aggregate([
      { $vectorSearch: { ... } }
    ])
    ↓
Returns top 6 matching teams with scores
    ↓
Client displays recommended teams
```

**Key insight:** Embeddings generated once, queried many times

---

### Judging Flow

```
Admin assigns judge to project
    ↓
JudgeAssignment document created
    ↓
Judge visits /judging/[eventId]
    ↓
Fetch assigned projects (with AI summaries)
    ↓
Judge scores project (sliders 1-10)
    ↓ POST /api/judging/[eventId]/score
API validates:
  - Judge assigned?
  - Scores in range?
  - All criteria filled?
    ↓
Store Score document
    ↓
Update assignment status = "completed"
    ↓
Results page aggregates scores:
  - Average per criterion
  - Total score
  - Rank projects
    ↓
Admin publishes results
    ↓
Participants see rankings
```

---

## Database Design

### Core Models

**User** - Authentication and profile
```typescript
{
  _id: ObjectId,
  email: string (unique),
  name: string,
  password: string (hashed),
  role: "participant" | "judge" | "admin" | "organizer",
  githubId?: string,
  createdAt: Date
}
```

**Event** - Hackathon event
```typescript
{
  _id: ObjectId,
  name: string,
  slug: string (unique),
  description: string,
  status: "draft" | "open" | "in_progress" | "concluded",
  startDate: Date,
  endDate: Date,
  submissionDeadline: Date,
  capacity: number,
  landingPage: {
    slug: string (unique),
    published: boolean,
    heroImage: string,
    // ... more landing page fields
  },
  resultsPublished: boolean,
  resultsPublishedAt?: Date
}
```

**Participant** - Event registration
```typescript
{
  _id: ObjectId,
  userId: ObjectId → User,
  skills: string[],
  skillsEmbedding: number[] (1536-dim),
  bio: string,
  teamId?: ObjectId → Team,
  registeredEvents: [{
    eventId: ObjectId → Event,
    registeredAt: Date
  }]
}
```

**Team** - Hackathon team
```typescript
{
  _id: ObjectId,
  eventId: ObjectId → Event,
  name: string,
  description: string,
  leaderId: ObjectId → User,
  members: ObjectId[] → User,
  desiredSkills: string[],
  desiredSkillsEmbedding: number[] (1536-dim),
  lookingForMembers: boolean,
  capacity: number,
  category?: string
}
```

**Project** - Team submission
```typescript
{
  _id: ObjectId,
  eventId: ObjectId → Event,
  teamId: ObjectId → Team,
  name: string,
  description: string,
  aiSummary?: string,
  aiFeedback?: string,
  category: string,
  technologies: string[],
  repoUrl: string,
  demoUrl?: string,
  status: "draft" | "submitted" | "under_review" | "judged",
  submittedAt?: Date
}
```

**Score** - Judge scoring
```typescript
{
  _id: ObjectId,
  eventId: ObjectId → Event,
  projectId: ObjectId → Project,
  judgeId: ObjectId → User,
  scores: {
    innovation: number (1-10),
    technical: number (1-10),
    impact: number (1-10),
    presentation: number (1-10)
  },
  totalScore: number (auto-calculated),
  comments?: string,
  submittedAt: Date
}
```

**JudgeAssignment** - Judge-project mapping
```typescript
{
  _id: ObjectId,
  eventId: ObjectId → Event,
  judgeId: ObjectId → User,
  projectId: ObjectId → Project,
  status: "pending" | "in_progress" | "completed",
  assignedAt: Date,
  completedAt?: Date
}
```

---

### Indexes

**Critical for performance:**

```javascript
// Users
{ email: 1 } unique

// Events
{ "landingPage.slug": 1 } unique, sparse
{ status: 1, startDate: 1 }

// Participants
{ userId: 1 }
{ "registeredEvents.eventId": 1 }
{ teamId: 1, "registeredEvents.eventId": 1 }

// Teams
{ eventId: 1, lookingForMembers: 1 }
{ leaderId: 1 }

// Projects
{ eventId: 1, status: 1 }
{ teamId: 1, eventId: 1 } unique

// Scores
{ projectId: 1, judgeId: 1 } unique
{ eventId: 1 }

// JudgeAssignments
{ eventId: 1, judgeId: 1 }
{ projectId: 1, judgeId: 1 } unique
{ judgeId: 1, status: 1 }
```

**Vector Search indexes:**
- `participant_skills_vector` on `skillsEmbedding`
- `team_skills_vector` on `desiredSkillsEmbedding`

---

## Authentication & Authorization

### NextAuth.js Configuration

**Providers:**
- Credentials (email/password with bcrypt)
- GitHub OAuth
- Google OAuth (future)

**Session strategy:** JWT (stored in httpOnly cookie)

**Session object:**
```typescript
{
  user: {
    id: string,
    email: string,
    name: string,
    role: "participant" | "judge" | "admin" | "organizer",
    image?: string
  },
  expires: string
}
```

### Authorization Patterns

**Middleware protection:**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await auth();
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session || !["admin", "organizer"].includes(session.user.role)) {
      return NextResponse.redirect('/login');
    }
  }
  
  return NextResponse.next();
}
```

**API route protection:**
```typescript
// API route
export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  // ... admin logic
}
```

**Role hierarchy:**
```
admin > organizer > judge > participant
```

---

## AI Services Architecture

### Service Layer

**Location:** `/src/lib/ai/`

**Services:**
1. **summary-service.ts** - Project summaries (GPT-4 Turbo)
2. **feedback-service.ts** - Judge feedback synthesis (GPT-4 Turbo)
3. **embedding-service.ts** - Vector embeddings (text-embedding-3-small)
4. **matching-engine.ts** - Team recommendations (Atlas Vector Search)

**Pattern:**
```typescript
// Each service exports focused functions
export async function generateProjectSummary(project): Promise<string>
export async function synthesizeJudgeFeedback(input): Promise<string>
export async function generateEmbedding(text): Promise<number[]>
export async function findMatchingTeams(participant, eventId): Promise<Team[]>
```

### Fire-and-Forget Pattern

**AI operations don't block user actions:**

```typescript
// Project submission
project.status = "submitted";
await project.save();

// Fire-and-forget: generate summary asynchronously
generateProjectSummary(project)
  .then(summary => {
    ProjectModel.findByIdAndUpdate(project._id, { aiSummary: summary });
  })
  .catch(err => console.error('Summary generation failed:', err));

// Return immediately to user
return NextResponse.json({ success: true, project });
```

**Benefits:**
- Fast response times (&lt;500ms)
- AI failures don't break UX
- Retries possible
- Can queue/batch operations

---

## API Design

### RESTful Patterns

**Resource-based URLs:**
```
GET    /api/events                     # List events
POST   /api/events                     # Create event
GET    /api/events/[eventId]           # Get event
PATCH  /api/events/[eventId]           # Update event
DELETE /api/events/[eventId]           # Delete event

POST   /api/events/[eventId]/register  # Register for event
GET    /api/events/[eventId]/teams     # List teams
POST   /api/events/[eventId]/teams     # Create team
```

**Nested resources:**
```
GET  /api/events/[eventId]/teams/[teamId]      # Get team
POST /api/events/[eventId]/teams/[teamId]/join # Join team
```

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE_OPTIONAL"
}
```

**List responses:**
```json
{
  "success": true,
  "data": [...],
  "count": 42,
  "page": 1,
  "totalPages": 3
}
```

### Validation

**Using Zod schemas:**
```typescript
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  skills: z.array(z.string()).min(1).max(10)
});

// In API route
const body = await request.json();
const validated = registerSchema.parse(body);  // Throws if invalid
```

---

## Performance Optimizations

### Database Query Optimization

**Use projection to limit fields:**
```typescript
// Bad: Fetches everything
const users = await UserModel.find({});

// Good: Fetch only needed fields
const users = await UserModel.find({}, 'name email');
```

**Use lean() for read-only:**
```typescript
// Returns plain JavaScript objects (faster)
const events = await EventModel.find({ status: 'open' }).lean();
```

**Avoid N+1 queries with populate:**
```typescript
// Bad: N+1 query (fetches members one-by-one)
const team = await TeamModel.findById(teamId);
const members = await UserModel.find({ _id: { $in: team.members } });

// Good: Single query with populate
const team = await TeamModel.findById(teamId).populate('members', 'name email');
```

### Caching Strategy

**Server component caching:**
```typescript
// Revalidate every 60 seconds
export const revalidate = 60;
```

**API route caching:**
```typescript
export async function GET() {
  // Set cache headers
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=120'
    }
  });
}
```

**Client-side caching:**
- React Query for API calls
- SWR for real-time data
- LocalStorage for user preferences

---

## Security Considerations

### Input Validation

**Always validate user input:**
- Use Zod schemas
- Sanitize HTML (prevent XSS)
- Validate file uploads
- Check permissions

### SQL/NoSQL Injection

**Safe (using Mongoose):**
```typescript
// Mongoose escapes automatically
await UserModel.findOne({ email: userInput });
```

**Dangerous (raw queries):**
```typescript
// DON'T DO THIS
db.collection('users').find({ email: userInput });
```

### Authentication

**JWT tokens:**
- httpOnly cookies (can't be accessed by JavaScript)
- Secure flag (HTTPS only)
- SameSite=Lax (CSRF protection)

**Password hashing:**
```typescript
import bcrypt from 'bcrypt';

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Rate Limiting

**TODO:** Not yet implemented

**Planned:**
```typescript
// Rate limit by IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // Max requests per window
});
```

---

## Error Handling

### API Error Responses

**Standard error codes:**
```typescript
400 - Bad Request (validation failed)
401 - Unauthorized (not logged in)
403 - Forbidden (insufficient permissions)
404 - Not Found
422 - Unprocessable Entity (business logic error)
429 - Too Many Requests (rate limited)
500 - Internal Server Error
```

### Error Logging

**Current:** console.error

**Recommended for production:**
- Sentry for error tracking
- Winston for structured logging
- Custom error classes

---

## Testing Strategy

**Current state:** Minimal tests (Phase 4.4 planned)

**Target coverage:** 40% on API routes

**Test types:**
1. **Unit tests** - Individual functions
2. **Integration tests** - API routes
3. **E2E tests** - Full user flows (Playwright)

**Example test:**
```typescript
// tests/api/register.test.ts
describe('POST /api/events/[eventId]/register', () => {
  it('creates user and participant', async () => {
    const response = await request(app)
      .post('/api/events/123/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        skills: ['Python', 'MongoDB']
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

---

## Deployment Architecture

### Vercel (Recommended)

**Why Vercel:**
- Zero-config Next.js deployment
- Automatic HTTPS
- Edge network (CDN)
- Serverless functions
- GitHub integration

**Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment variables:**
Set in Vercel dashboard → Project → Settings → Environment Variables

---

### Docker (Alternative)

**Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
```

---

## Monitoring & Observability

**TODO:** Not yet implemented

**Planned:**
- Vercel Analytics (built-in)
- Sentry for errors
- MongoDB Atlas monitoring
- OpenAI usage tracking
- Custom metrics dashboard

---

## Future Improvements

### Short Term (Sprint 4)
- [ ] Type safety (eliminate `any`)
- [ ] Loading states (Suspense)
- [ ] Error boundaries
- [ ] API tests (40% coverage)
- [ ] Mobile responsive fixes
- [ ] Dark mode

### Medium Term
- [ ] Real-time features (WebSockets)
- [ ] Email notifications
- [ ] File uploads (S3)
- [ ] Advanced analytics
- [ ] Rate limiting
- [ ] Caching layer (Redis)

### Long Term
- [ ] Multi-language support (i18n)
- [ ] Mobile apps (React Native)
- [ ] GraphQL API
- [ ] Microservices split
- [ ] Kubernetes deployment

---

## Contributing

See [Development Guide](/docs/development/testing) for setup and contribution guidelines.

## Further Reading

- [Next.js 15 Docs](https://nextjs.org/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [MUI Documentation](https://mui.com/material-ui/)
- [NextAuth.js Guide](https://next-auth.js.org/)
