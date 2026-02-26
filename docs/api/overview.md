---
sidebar_position: 1
---

# API Overview

MongoHacks REST API reference for building integrations and custom clients.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All API requests require authentication via **session cookies** (NextAuth.js).

### How to Authenticate

**1. Login via web UI:**
```
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**2. Use session cookie in subsequent requests:**
```
Cookie: next-auth.session-token=...
```

**3. Or use API token (future feature):**
```
Authorization: Bearer your-api-token
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

### List Response

```json
{
  "success": true,
  "data": [...],
  "count": 42,
  "page": 1,
  "totalPages": 3
}
```

---

## Core Endpoints

### Events API

#### List Events

```http
GET /api/events
```

**Query parameters:**
- `status` - Filter by status (`draft`, `open`, `in_progress`, `concluded`)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "event123",
      "name": "MongoHacks Spring 2026",
      "slug": "mongohacks-spring-2026",
      "status": "open",
      "startDate": "2026-03-15T10:00:00Z",
      "endDate": "2026-03-17T18:00:00Z",
      "capacity": 200,
      "registeredCount": 156
    }
  ],
  "count": 1,
  "page": 1
}
```

---

#### Get Event

```http
GET /api/events/:eventId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "event123",
    "name": "MongoHacks Spring 2026",
    "description": "Build innovative apps with MongoDB...",
    "status": "open",
    "startDate": "2026-03-15T10:00:00Z",
    "endDate": "2026-03-17T18:00:00Z",
    "submissionDeadline": "2026-03-17T16:00:00Z",
    "capacity": 200,
    "location": {
      "country": "United States",
      "city": "Virtual",
      "venue": "Online"
    }
  }
}
```

---

#### Register for Event

```http
POST /api/events/:eventId/register
```

**Request body:**
```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "password": "securePassword123",
  "skills": ["Python", "MongoDB", "React"],
  "experienceLevel": "intermediate"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful!",
  "data": {
    "participant": {
      "_id": "participant123",
      "userId": "user123",
      "skills": ["Python", "MongoDB", "React"]
    },
    "user": {
      "_id": "user123",
      "name": "Alice Smith",
      "email": "alice@example.com"
    }
  }
}
```

**Errors:**
- `400` - Validation failed
- `409` - Email already registered
- `422` - Event full or closed

---

### Teams API

#### List Teams

```http
GET /api/events/:eventId/teams
```

**Query parameters:**
- `lookingForMembers` - Filter by recruiting status (boolean)
- `category` - Filter by category
- `page` - Page number
- `limit` - Results per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "team123",
      "name": "Data Wizards",
      "description": "Building a RAG chatbot...",
      "leaderId": {
        "_id": "user123",
        "name": "Alice Smith"
      },
      "members": [
        { "_id": "user123", "name": "Alice Smith" },
        { "_id": "user456", "name": "Bob Jones" }
      ],
      "desiredSkills": ["Python", "AI/ML"],
      "lookingForMembers": true,
      "capacity": 5
    }
  ],
  "count": 15
}
```

---

#### Create Team

```http
POST /api/events/:eventId/teams
```

**Request body:**
```json
{
  "name": "Data Wizards",
  "description": "Building a RAG chatbot with MongoDB Vector Search",
  "desiredSkills": ["Python", "Machine Learning", "APIs"],
  "category": "AI/ML",
  "lookingForMembers": true,
  "capacity": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Team created successfully!",
  "data": {
    "_id": "team123",
    "name": "Data Wizards",
    "leaderId": "user123",
    "members": ["user123"],
    "eventId": "event123"
  }
}
```

**Errors:**
- `403` - User not registered for event
- `409` - User already on a team
- `422` - Team name taken

---

#### Join Team

```http
POST /api/events/:eventId/teams/:teamId/join
```

**Response:**
```json
{
  "success": true,
  "message": "You joined Data Wizards!",
  "data": {
    "team": { ... },
    "participant": { "teamId": "team123" }
  }
}
```

**Errors:**
- `403` - Not registered for event
- `409` - Already on a team
- `422` - Team at capacity

---

#### Leave Team

```http
POST /api/events/:eventId/teams/:teamId/leave
```

**Response:**
```json
{
  "success": true,
  "message": "You left the team"
}
```

**Errors:**
- `403` - Not a team member
- `422` - Cannot leave (team has submitted project)

---

### Projects API

#### List Projects

```http
GET /api/events/:eventId/projects
```

**Query parameters:**
- `status` - Filter by status
- `teamId` - Filter by team
- `page` - Page number
- `limit` - Results per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "project123",
      "name": "RAG Chatbot for MongoDB Docs",
      "description": "A retrieval-augmented generation...",
      "aiSummary": "This project builds a RAG chatbot...",
      "category": "AI/ML",
      "technologies": ["MongoDB", "OpenAI", "Python", "Next.js"],
      "repoUrl": "https://github.com/team/project",
      "demoUrl": "https://demo.example.com",
      "status": "submitted",
      "submittedAt": "2026-03-17T15:45:00Z",
      "team": {
        "_id": "team123",
        "name": "Data Wizards"
      }
    }
  ],
  "count": 87
}
```

---

#### Create Project

```http
POST /api/events/:eventId/projects
```

**Request body:**
```json
{
  "name": "RAG Chatbot for MongoDB Docs",
  "description": "A retrieval-augmented generation chatbot...",
  "category": "AI/ML",
  "technologies": ["MongoDB", "OpenAI", "Python", "Next.js"],
  "repoUrl": "https://github.com/team/rag-chatbot",
  "demoUrl": "https://demo.example.com",
  "innovations": "Uses Atlas Vector Search for semantic search..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project created!",
  "data": {
    "_id": "project123",
    "status": "draft",
    "teamId": "team123"
  }
}
```

**Errors:**
- `403` - Not a team member
- `409` - Team already has a project
- `422` - Invalid GitHub URL

---

#### Submit Project

```http
POST /api/events/:eventId/projects/:projectId
```

**Request body:**
```json
{
  "action": "submit"  // or "unsubmit"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project submitted successfully! 🎉",
  "data": {
    "status": "submitted",
    "submittedAt": "2026-03-17T15:45:00Z",
    "aiSummary": "This project builds a RAG chatbot..." // Generated async
  }
}
```

**Errors:**
- `403` - Not a team member
- `422` - Deadline passed

---

### Judging API

#### Get Assigned Projects (Judge)

```http
GET /api/judging/:eventId/projects
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "project": {
        "_id": "project123",
        "name": "RAG Chatbot",
        "aiSummary": "...",
        "repoUrl": "..."
      },
      "assignment": {
        "_id": "assignment123",
        "status": "pending"
      },
      "score": null  // or existing score if already judged
    }
  ]
}
```

---

#### Submit Score (Judge)

```http
POST /api/judging/:eventId/score
```

**Request body:**
```json
{
  "projectId": "project123",
  "innovation": 8,
  "technical": 9,
  "impact": 7,
  "presentation": 8,
  "comments": "Great use of vector search! Could improve error handling."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Score submitted successfully!",
  "data": {
    "_id": "score123",
    "totalScore": 32,
    "submittedAt": "2026-03-17T20:15:00Z"
  }
}
```

**Errors:**
- `403` - Not assigned as judge
- `422` - Invalid score range (must be 1-10)

---

#### Get Results (Public)

```http
GET /api/events/:eventId/results
```

**Response (if published):**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "projectId": "project123",
      "project": {
        "name": "RAG Chatbot",
        "description": "..."
      },
      "team": {
        "name": "Data Wizards"
      },
      "averageScores": {
        "innovation": 9.2,
        "technical": 9.5,
        "impact": 9.0,
        "presentation": 9.8
      },
      "totalScore": 38.5,
      "judgeCount": 4
    }
  ]
}
```

**Response (if not published):**
```json
{
  "success": false,
  "error": "Results have not been published yet"
}
```

---

### Admin APIs

#### Judge Assignment

```http
POST /api/admin/events/:eventId/assignments
```

**Request body:**
```json
{
  "judgeIds": ["user123", "user456"],
  "projectIds": ["project1", "project2", "project3"]
}
```

**Response:**
```json
{
  "success": true,
  "created": 6,
  "skipped": 0,
  "message": "Assigned 2 judges to 3 projects"
}
```

---

#### Publish Results

```http
POST /api/admin/events/:eventId/publish-results
```

**Request body:**
```json
{
  "publish": true  // or false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Results are now public!",
  "event": {
    "resultsPublished": true,
    "resultsPublishedAt": "2026-03-18T10:00:00Z"
  }
}
```

---

#### Generate All Feedback

```http
POST /api/admin/events/:eventId/generate-all-feedback
```

**Response:**
```json
{
  "success": true,
  "message": "Generated feedback for 87 project(s)",
  "generated": 87,
  "failed": 0,
  "total": 87
}
```

---

## Rate Limits

**Current:** No rate limiting implemented

**Recommended for production:**
- 100 requests per 15 minutes per IP
- 1000 requests per day per user
- Authenticated requests: Higher limits

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Not logged in |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 422 | Unprocessable Entity - Business logic error |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

---

## Pagination

List endpoints support pagination:

**Query parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20, max: 100)

**Response includes:**
```json
{
  "data": [...],
  "count": 87,
  "page": 2,
  "totalPages": 5
}
```

---

## Webhooks (Future)

**Planned events:**
- `event.created`
- `participant.registered`
- `team.created`
- `project.submitted`
- `score.submitted`
- `results.published`

**Webhook payload:**
```json
{
  "event": "project.submitted",
  "timestamp": "2026-03-17T15:45:00Z",
  "data": {
    "projectId": "project123",
    "teamId": "team123",
    "eventId": "event123"
  }
}
```

---

## GraphQL (Future)

**Planned for v2:**
- Single `/api/graphql` endpoint
- Query flexibility
- Reduced over-fetching
- Real-time subscriptions

---

## SDK/Client Libraries (Future)

**Planned official clients:**
- JavaScript/TypeScript
- Python
- Go

**Community clients welcome!**

---

## Testing

### Development Environment

**Base URL:** `http://localhost:3000/api`

**Test user:**
```json
{
  "email": "admin@mongohacks.com",
  "password": "admin123"
}
```

### Postman Collection

**TODO:** Publish Postman collection for testing

---

## Best Practices

### 1. Always Check Response Status

```javascript
const response = await fetch('/api/events');
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.error);
}
const data = await response.json();
```

### 2. Handle Errors Gracefully

```javascript
try {
  const result = await registerForEvent(eventId, data);
} catch (error) {
  if (error.status === 409) {
    // Already registered
  } else if (error.status === 422) {
    // Event full
  } else {
    // Generic error
  }
}
```

### 3. Use Proper HTTP Methods

- `GET` - Retrieve data (idempotent)
- `POST` - Create resource or action
- `PATCH` - Partial update
- `PUT` - Full replacement
- `DELETE` - Remove resource

### 4. Include CSRF Token (if required)

For POST/PATCH/DELETE requests:
```javascript
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});
```

---

## Support

**Questions or issues?**
- GitHub Issues: https://github.com/mongodb/mongohacks-platform/issues
- Discord: https://discord.gg/mongodb
- Email: support@mongohacks.com

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- Core endpoints (events, teams, projects, judging)
- AI features (summaries, feedback, matching)

### Upcoming (v1.1.0)
- Rate limiting
- API tokens
- Webhooks
- Pagination improvements
- GraphQL endpoint (beta)

---

## Further Reading

- [Authentication Guide](/docs/getting-started/configuration#authentication)
- [Architecture Overview](/docs/development/architecture)
- [Events API Details](/docs/api/events/create)
- [Judging API Details](/docs/api/judging/scoring)
