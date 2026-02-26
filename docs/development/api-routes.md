---
sidebar_position: 2
---

# API Routes

Next.js App Router API structure and routing conventions.

## Overview

MongoHacks uses Next.js 15 App Router with route handlers for all API endpoints.

**Base URL:** `http://localhost:3002/api`

**Structure:** File-based routing in `/src/app/api/`

---

## Route Organization

### Directory Structure

```
src/app/api/
├── auth/
│   └── [...nextauth]/
│       └── route.ts          # NextAuth endpoints
├── events/
│   ├── route.ts              # GET /api/events (list all)
│   └── [eventId]/
│       ├── route.ts          # GET /api/events/:id
│       ├── register/
│       │   └── route.ts      # POST /api/events/:id/register
│       ├── teams/
│       │   ├── route.ts      # GET/POST /api/events/:id/teams
│       │   └── [teamId]/
│       │       ├── route.ts  # GET/PATCH/DELETE
│       │       └── join/
│       │           └── route.ts
│       ├── projects/
│       │   ├── route.ts      # GET/POST
│       │   └── [projectId]/
│       │       ├── route.ts  # GET/PATCH/DELETE
│       │       └── feedback/
│       │           └── route.ts
│       └── results/
│           └── route.ts      # GET results
├── admin/
│   └── events/
│       └── [eventId]/
│           ├── assignments/
│           │   └── route.ts  # Judge assignments
│           ├── publish-results/
│           │   └── route.ts
│           └── generate-all-feedback/
│               └── route.ts
└── judging/
    └── [eventId]/
        ├── route.ts          # GET assigned projects
        └── [projectId]/
            └── route.ts      # POST score
```

---

## Route Handler Pattern

### Basic Structure

```typescript
// src/app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Event from '@/lib/db/models/Event';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const events = await Event.find({ status: 'published' })
      .sort({ startDate: -1 })
      .limit(20);
    
    return NextResponse.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
```

---

### Dynamic Routes

**Path parameters:**
```typescript
// src/app/api/events/[eventId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const { eventId } = params;
  
  await dbConnect();
  const event = await Event.findById(eventId);
  
  if (!event) {
    return NextResponse.json(
      { success: false, error: 'Event not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({
    success: true,
    data: event
  });
}
```

**Nested dynamic routes:**
```typescript
// src/app/api/events/[eventId]/teams/[teamId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string; teamId: string } }
) {
  const { eventId, teamId } = params;
  
  const team = await Team.findOne({
    _id: teamId,
    eventId: eventId
  }).populate('members');
  
  return NextResponse.json({ success: true, data: team });
}
```

---

## HTTP Methods

### GET - Retrieve Data

```typescript
export async function GET(request: NextRequest) {
  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  const events = await Event.find(status ? { status } : {})
    .limit(limit);
  
  return NextResponse.json({ success: true, data: events });
}
```

---

### POST - Create Data

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Name and email required' },
        { status: 400 }
      );
    }
    
    // Create
    const user = await User.create(body);
    
    return NextResponse.json(
      { success: true, data: user },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

### PATCH - Update Data

```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const body = await request.json();
  
  const event = await Event.findByIdAndUpdate(
    params.eventId,
    body,
    { new: true, runValidators: true }
  );
  
  if (!event) {
    return NextResponse.json(
      { success: false, error: 'Event not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ success: true, data: event });
}
```

---

### DELETE - Remove Data

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  const team = await Team.findByIdAndDelete(params.teamId);
  
  if (!team) {
    return NextResponse.json(
      { success: false, error: 'Team not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({
    success: true,
    message: 'Team deleted'
  });
}
```

---

## Authentication

### Protected Routes

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Check role
  if (session.user.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  // Proceed with authenticated request
  // ...
}
```

---

### Role-Based Access

```typescript
// Helper function
async function requireRole(roles: string[]) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  if (!roles.includes(session.user.role)) {
    throw new Error('Forbidden');
  }
  
  return session;
}

// Usage
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(['admin', 'organizer']);
    
    // Admin/organizer only logic
    // ...
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    );
  }
}
```

---

## Request Validation

### Zod Schema Validation

```typescript
import { z } from 'zod';

const eventSchema = z.object({
  name: z.string().min(3).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  capacity: z.number().int().positive()
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validate
  const result = eventSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        errors: result.error.issues
      },
      { status: 400 }
    );
  }
  
  // Create with validated data
  const event = await Event.create(result.data);
  
  return NextResponse.json({ success: true, data: event });
}
```

---

## Error Handling

### Centralized Error Handler

```typescript
// src/lib/api/error-handler.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: any) {
  console.error('API Error:', error);
  
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code
      },
      { status: error.statusCode }
    );
  }
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        errors: Object.values(error.errors).map((e: any) => e.message)
      },
      { status: 400 }
    );
  }
  
  // MongoDB duplicate key
  if (error.code === 11000) {
    return NextResponse.json(
      {
        success: false,
        error: 'Duplicate entry',
        field: Object.keys(error.keyPattern)[0]
      },
      { status: 409 }
    );
  }
  
  // Generic error
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}
```

**Usage:**
```typescript
export async function POST(request: NextRequest) {
  try {
    // Throw specific errors
    if (!body.email) {
      throw new APIError('Email is required', 400, 'MISSING_EMAIL');
    }
    
    // ...
  } catch (error) {
    return handleAPIError(error);
  }
}
```

---

## Response Formats

### Standard Success Response

```typescript
{
  success: true,
  data: { /* response data */ },
  message?: string  // optional
}
```

### Standard Error Response

```typescript
{
  success: false,
  error: string,
  code?: string,  // error code
  errors?: any[]  // validation errors
}
```

### Paginated Response

```typescript
{
  success: true,
  data: [ /* items */ ],
  pagination: {
    page: 1,
    limit: 20,
    total: 156,
    pages: 8
  }
}
```

---

## Query Parameters

### Parsing & Validation

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Simple parameters
  const status = searchParams.get('status') || 'published';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  
  // Array parameters (?skills=Python&skills=MongoDB)
  const skills = searchParams.getAll('skills');
  
  // Date range
  const startDate = searchParams.get('startDate')
    ? new Date(searchParams.get('startDate')!)
    : undefined;
  
  // Build query
  const query: any = { status };
  if (startDate) query.startDate = { $gte: startDate };
  if (skills.length > 0) query.skills = { $in: skills };
  
  const events = await Event.find(query)
    .skip((page - 1) * limit)
    .limit(limit);
  
  return NextResponse.json({ success: true, data: events });
}
```

---

## CORS Configuration

### Enable CORS

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }
  
  return response;
}

export const config = {
  matcher: '/api/:path*'
};
```

---

## Rate Limiting

### Simple In-Memory Rate Limiter

```typescript
// src/lib/api/rate-limit.ts
const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimit.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimit.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

// Usage
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  if (!checkRateLimit(ip, 10, 60000)) {  // 10 requests per minute
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  // Process request
}
```

---

## Testing Routes

### Jest + Supertest

```typescript
// __tests__/api/events.test.ts
import { GET } from '@/app/api/events/route';

describe('GET /api/events', () => {
  it('returns published events', async () => {
    const request = new Request('http://localhost:3002/api/events');
    const response = await GET(request as any);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
```

---

## Best Practices

### 1. Database Connection

**Always connect before queries:**
```typescript
import dbConnect from '@/lib/db/connect';

export async function GET() {
  await dbConnect();  // ← Essential
  const events = await Event.find();
  // ...
}
```

---

### 2. Error Logging

**Log all errors:**
```typescript
try {
  // ...
} catch (error) {
  console.error('[API Error]', {
    endpoint: request.url,
    method: request.method,
    error: error.message,
    stack: error.stack
  });
  return handleAPIError(error);
}
```

---

### 3. Input Sanitization

**Sanitize user input:**
```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitizedDescription = DOMPurify.sanitize(body.description);
```

---

### 4. Response Caching

**Cache static data:**
```typescript
export async function GET() {
  const events = await Event.find({ status: 'published' });
  
  return NextResponse.json(
    { success: true, data: events },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    }
  );
}
```

---

## Common Patterns

### Pagination Helper

```typescript
async function paginate(
  model: any,
  query: any,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    model.find(query).skip(skip).limit(limit),
    model.countDocuments(query)
  ]);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}
```

---

### Async Batch Processing

```typescript
export async function POST(request: NextRequest) {
  const { projectIds } = await request.json();
  
  // Process in batches to avoid rate limits
  const batchSize = 5;
  const results = [];
  
  for (let i = 0; i < projectIds.length; i += batchSize) {
    const batch = projectIds.slice(i, i + batchSize);
    
    const batchResults = await Promise.allSettled(
      batch.map(id => generateSummary(id))
    );
    
    results.push(...batchResults);
    
    // Rate limit delay
    if (i + batchSize < projectIds.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  return NextResponse.json({ success: true, results });
}
```

---

## Next Steps

- [Database schema guide](/docs/development/database)
- [Testing strategies](/docs/development/testing)
- [Deployment guide](/docs/development/deployment)
- [API endpoint reference](/docs/api/overview)
