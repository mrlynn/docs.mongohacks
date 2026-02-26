---
sidebar_position: 1
---

# Project Summaries API

AI-generated project summaries using GPT-4.

## Generate Summary

Trigger AI summary generation for a project.

**Endpoint:** `POST /api/admin/projects/:projectId/generate-summary`

**Authentication:** Required (admin/organizer)

**Response:**
```json
{
  "success": true,
  "message": "Summary generated",
  "data": {
    "aiSummary": "This project builds a retrieval-augmented generation (RAG) chatbot using MongoDB Atlas Vector Search and OpenAI's GPT-4 to answer questions about MongoDB documentation. The system embeds documentation chunks and retrieves relevant context before generating responses. Built with Python, LangChain, and a Next.js frontend."
  }
}
```

**Process:**
- Calls OpenAI GPT-4 Turbo
- Generates 2-3 sentence summary
- Stores in `project.aiSummary`
- Takes 10-30 seconds

---

## Regenerate Summary

Replace existing summary.

**Endpoint:** `POST /api/admin/projects/:projectId/regenerate-summary`

**Authentication:** Required (admin)

**Response:**
```json
{
  "success": true,
  "message": "Summary regenerated",
  "data": {
    "aiSummary": "Updated summary text..."
  }
}
```

---

## Batch Generate

Generate summaries for all projects in an event.

**Endpoint:** `POST /api/admin/events/:eventId/generate-all-summaries`

**Authentication:** Required (admin/organizer)

**Response:**
```json
{
  "success": true,
  "message": "Generated summaries for 42 projects",
  "data": {
    "total": 50,
    "success": 42,
    "skipped": 6,
    "failed": 2,
    "errors": [
      {
        "projectId": "project123",
        "error": "OpenAI rate limit exceeded"
      }
    ]
  }
}
```

**Process:**
- Processes in batches of 5
- Rate limits: 1 second delay between batches
- Skips projects that already have summaries
- Returns detailed results
