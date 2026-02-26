---
sidebar_position: 1
---

# Judge Assignments

Assign judges to projects for evaluation.

## List Assignments

Get all judge assignments for an event.

**Endpoint:** `GET /api/admin/events/:eventId/assignments`

**Authentication:** Required (admin/organizer)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "assignment123",
      "judgeId": {
        "_id": "judge1",
        "name": "Sarah Johnson",
        "email": "sarah@example.com"
      },
      "projectId": {
        "_id": "project1",
        "name": "RAG Chatbot",
        "team": { "name": "Data Wizards" }
      },
      "status": "completed",
      "assignedAt": "2026-03-18T20:00:00Z",
      "completedAt": "2026-03-18T21:30:00Z"
    }
  ]
}
```

---

## Create Assignment

Assign a judge to a project.

**Endpoint:** `POST /api/admin/events/:eventId/assignments`

**Authentication:** Required (admin/organizer)

**Request:**
```json
{
  "judgeId": "judge123",
  "projectId": "project456"
}
```

**Validation:**
- Judge user exists with role 'judge'
- Project exists and is submitted
- No duplicate assignment
- No conflict of interest

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Judge assigned to project",
  "data": {
    "_id": "assignment789",
    "judgeId": "judge123",
    "projectId": "project456",
    "status": "pending"
  }
}
```

---

## Batch Assign

Auto-assign all judges to projects.

**Endpoint:** `POST /api/admin/events/:eventId/assignments/batch`

**Request:**
```json
{
  "projectsPerJudge": 5,
  "avoidConflicts": true,
  "matchExpertise": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assigned 120 projects to 24 judges",
  "data": {
    "totalAssignments": 120,
    "judgesUsed": 24,
    "averagePerJudge": 5
  }
}
```

---

## Delete Assignment

**Endpoint:** `DELETE /api/admin/events/:eventId/assignments/:assignmentId`

**Authentication:** Required (admin/organizer)

**Checks:**
- Assignment not yet completed?

**Response:**
```json
{
  "success": true,
  "message": "Assignment removed"
}
```

---

## Get Judge's Assignments

**Endpoint:** `GET /api/judging/:eventId`

**Authentication:** Required (judge)

**Response:**
```json
{
  "success": true,
  "data": {
    "judge": {
      "name": "Sarah Johnson",
      "assignedCount": 5,
      "completedCount": 3
    },
    "assignments": [
      {
        "project": {
          "_id": "project1",
          "name": "RAG Chatbot",
          "description": "...",
          "aiSummary": "...",
          "technologies": ["MongoDB", "OpenAI"],
          "team": { "name": "Data Wizards" }
        },
        "status": "completed",
        "yourScore": {
          "innovation": 9,
          "technical": 10,
          "impact": 8,
          "presentation": 9
        }
      }
    ]
  }
}
```
