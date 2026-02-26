---
sidebar_position: 3
---

# Results API

View aggregated scores and rankings.

## Get Event Results

**Endpoint:** `GET /api/events/:eventId/results`

**Authentication:** None (if published), Admin (if unpublished)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "projectId": "project123",
      "project": {
        "name": "RAG Chatbot",
        "description": "...",
        "technologies": ["MongoDB", "OpenAI"],
        "repoUrl": "https://github.com/...",
        "demoUrl": "https://demo.com"
      },
      "team": {
        "_id": "team123",
        "name": "Data Wizards",
        "members": [
          {
            "name": "Alice Smith",
            "email": "alice@example.com"
          }
        ]
      },
      "averageScores": {
        "innovation": 9.2,
        "technical": 9.5,
        "impact": 9.0,
        "presentation": 9.8
      },
      "totalScore": 37.5,
      "judgeCount": 4,
      "scores": [
        {
          "judgeId": "judge1",
          "judgeName": "Sarah Johnson",
          "scores": {
            "innovation": 9,
            "technical": 10,
            "impact": 9,
            "presentation": 10
          },
          "totalScore": 38,
          "comments": "Excellent work!"
        }
      ]
    }
  ],
  "event": {
    "name": "MongoHacks Spring 2026",
    "resultsPublished": true,
    "resultsPublishedAt": "2026-03-19T10:00:00Z"
  }
}
```

**If not published:**
```json
{
  "success": false,
  "error": "Results have not been published yet",
  "code": "RESULTS_NOT_PUBLISHED"
}
```

---

## Publish Results

**Endpoint:** `POST /api/admin/events/:eventId/publish-results`

**Authentication:** Required (admin/organizer)

**Request:**
```json
{
  "publish": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Results published",
  "data": {
    "resultsPublished": true,
    "resultsPublishedAt": "2026-03-19T10:00:00Z"
  }
}
```

---

## Unpublish Results

**Request:**
```json
{
  "publish": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Results hidden from public",
  "data": {
    "resultsPublished": false
  }
}
```
