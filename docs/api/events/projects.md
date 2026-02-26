---
sidebar_position: 3
---

# Projects API

Manage project submissions for hackathon teams.

## List Projects

**Endpoint:** `GET /api/events/:eventId/projects`

**Query Parameters:**
- `status` (enum: draft, submitted, judged)
- `category` (string)
- `teamId` (string)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "project123",
      "name": "RAG Chatbot",
      "description": "Vector search chatbot...",
      "category": "AI/ML",
      "technologies": ["MongoDB", "OpenAI", "Python"],
      "repoUrl": "https://github.com/team/project",
      "demoUrl": "https://demo.vercel.app",
      "status": "submitted",
      "teamId": "team123",
      "team": {
        "name": "Data Wizards",
        "members": [...]
      }
    }
  ]
}
```

---

## Create Project

**Endpoint:** `POST /api/events/:eventId/projects`

**Authentication:** Required (team member)

**Request:**
```json
{
  "name": "RAG Chatbot for MongoDB Docs",
  "description": "A retrieval-augmented generation chatbot...",
  "category": "AI/ML",
  "technologies": ["MongoDB", "OpenAI", "Python", "Next.js"],
  "innovations": "Uses Atlas Vector Search...",
  "repoUrl": "https://github.com/team/rag-chatbot"
}
```

**Response (201 Created):**
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

---

## Get Project

**Endpoint:** `GET /api/events/:eventId/projects/:projectId`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "project123",
    "name": "RAG Chatbot",
    "description": "...",
    "aiSummary": "This project builds a RAG chatbot...",
    "aiFeedback": "Your project demonstrates...",
    "category": "AI/ML",
    "technologies": ["MongoDB", "OpenAI"],
    "repoUrl": "https://github.com/...",
    "demoUrl": "https://demo.com",
    "videoUrl": "https://youtube.com/...",
    "status": "submitted",
    "submittedAt": "2026-03-18T18:00:00Z",
    "team": {
      "name": "Data Wizards",
      "members": [...]
    }
  }
}
```

---

## Update Project

**Endpoint:** `PATCH /api/events/:eventId/projects/:projectId`

**Authentication:** Required (team member)

**Request:**
```json
{
  "description": "Updated description",
  "demoUrl": "https://new-demo.vercel.app",
  "technologies": ["MongoDB", "OpenAI", "Python", "Docker"]
}
```

**Restrictions after submission:**
- ✅ Can update: `demoUrl`, `videoUrl`
- ✅ Can add: `technologies`
- ❌ Cannot change: `name`, `description`, `repoUrl`

**Response:**
```json
{
  "success": true,
  "data": { /* updated project */ }
}
```

---

## Submit Project

**Endpoint:** `POST /api/events/:eventId/projects/:projectId/submit`

**Authentication:** Required (team member)

**Checks:**
- All required fields filled?
- Before submission deadline?

**Response:**
```json
{
  "success": true,
  "message": "Project submitted for judging!",
  "data": {
    "status": "submitted",
    "submittedAt": "2026-03-18T17:30:00Z"
  }
}
```

**Triggers:**
- AI summary generation (async)
- Status change to "submitted"

---

## Delete Project

**Endpoint:** `DELETE /api/events/:eventId/projects/:projectId`

**Authentication:** Required (team leader)

**Checks:**
- Project status is "draft"?

**Response:**
```json
{
  "success": true,
  "message": "Project deleted"
}
```
