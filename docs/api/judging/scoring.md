---
sidebar_position: 2
---

# Project Scoring

Submit judge scores for assigned projects.

## Submit Score

**Endpoint:** `POST /api/judging/:eventId/:projectId`

**Authentication:** Required (judge)

**Request:**
```json
{
  "scores": {
    "innovation": 9,
    "technical": 8,
    "impact": 7,
    "presentation": 9
  },
  "comments": "Excellent use of MongoDB Vector Search. The RAG implementation is well-architected. Could improve error handling for edge cases."
}
```

**Validation:**
- Judge is assigned to this project
- Scores are integers 1-10
- Comments optional but recommended

**Response:**
```json
{
  "success": true,
  "message": "Score submitted",
  "data": {
    "_id": "score123",
    "projectId": "project456",
    "judgeId": "judge789",
    "scores": {
      "innovation": 9,
      "technical": 8,
      "impact": 7,
      "presentation": 9
    },
    "totalScore": 33,
    "comments": "Excellent use of...",
    "submittedAt": "2026-03-18T21:45:00Z"
  }
}
```

---

## Get Score

Retrieve judge's score for a project.

**Endpoint:** `GET /api/judging/:eventId/:projectId/score`

**Authentication:** Required (judge)

**Response:**
```json
{
  "success": true,
  "data": {
    "scores": {
      "innovation": 9,
      "technical": 8,
      "impact": 7,
      "presentation": 9
    },
    "totalScore": 33,
    "comments": "...",
    "submittedAt": "2026-03-18T21:45:00Z"
  }
}
```

---

## Update Score

**Endpoint:** `PATCH /api/judging/:eventId/:projectId/score`

**Authentication:** Required (judge)

**Request:**
```json
{
  "scores": {
    "innovation": 10,
    "technical": 9,
    "impact": 8,
    "presentation": 9
  },
  "comments": "Updated after reviewing demo video again."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Score updated",
  "data": { /* updated score */ }
}
```
