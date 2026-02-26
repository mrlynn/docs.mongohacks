---
sidebar_position: 2
---

# Teams API

Manage teams for hackathon events.

## List Teams

Get all teams for an event with optional filtering.

**Endpoint:** `GET /api/events/:eventId/teams`

**Authentication:** None (public for published events)

**Query Parameters:**
- `lookingForMembers` (boolean) - Filter by availability
- `category` (string) - Filter by category
- `limit` (number, default: 20) - Results per page
- `page` (number, default: 1) - Page number

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "team123",
      "name": "Data Wizards",
      "description": "Building a RAG chatbot",
      "desiredSkills": ["Python", "ML", "APIs"],
      "members": [
        {
          "_id": "user1",
          "name": "Alice Smith",
          "email": "alice@example.com"
        }
      ],
      "leaderId": "user1",
      "lookingForMembers": true,
      "capacity": 5,
      "memberCount": 1,
      "category": "AI/ML"
    }
  ]
}
```

---

## Create Team

Create a new team for an event.

**Endpoint:** `POST /api/events/:eventId/teams`

**Authentication:** Required (participant)

**Request:**
```json
{
  "name": "Data Wizards",
  "description": "Building a RAG chatbot with Vector Search",
  "desiredSkills": ["Python", "Machine Learning", "APIs"],
  "category": "AI/ML",
  "capacity": 5,
  "lookingForMembers": true
}
```

**Validation:**
- User must be registered for event
- User cannot already be on a team
- Team name must be unique per event

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Team created!",
  "data": {
    "_id": "team123",
    "name": "Data Wizards",
    "members": ["user1"],
    "leaderId": "user1"
  }
}
```

---

## Get Team Details

**Endpoint:** `GET /api/events/:eventId/teams/:teamId`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "team123",
    "name": "Data Wizards",
    "description": "Building a RAG chatbot",
    "desiredSkills": ["Python", "ML"],
    "members": [
      {
        "_id": "user1",
        "name": "Alice Smith",
        "email": "alice@example.com",
        "skills": ["Python", "MongoDB"]
      }
    ],
    "leaderId": "user1",
    "capacity": 5,
    "lookingForMembers": true
  }
}
```

---

## Join Team

**Endpoint:** `POST /api/events/:eventId/teams/:teamId/join`

**Authentication:** Required (participant)

**Checks:**
- User registered for event?
- User not already on a team?
- Team not at capacity?
- Team looking for members?

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined team!",
  "data": {
    "team": { /* updated team */ },
    "memberCount": 2
  }
}
```

**Error - Team Full:**
```json
{
  "success": false,
  "error": "Team is at capacity (5/5)",
  "code": "TEAM_FULL"
}
```

---

## Leave Team

**Endpoint:** `POST /api/events/:eventId/teams/:teamId/leave`

**Authentication:** Required (team member)

**Checks:**
- User is team member?
- User is not leader? (transfer leadership first)
- Team has no submitted project?

**Response:**
```json
{
  "success": true,
  "message": "Left team successfully"
}
```

---

## Update Team

**Endpoint:** `PATCH /api/events/:eventId/teams/:teamId`

**Authentication:** Required (team leader)

**Request:**
```json
{
  "description": "Updated description",
  "desiredSkills": ["Python", "ML", "Docker"],
  "lookingForMembers": false,
  "capacity": 4
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated team */ }
}
```

---

## Delete Team

**Endpoint:** `DELETE /api/events/:eventId/teams/:teamId`

**Authentication:** Required (team leader)

**Checks:**
- Team has no submitted project?

**Response:**
```json
{
  "success": true,
  "message": "Team deleted"
}
```

---

## Transfer Leadership

**Endpoint:** `POST /api/events/:eventId/teams/:teamId/transfer-leadership`

**Authentication:** Required (team leader)

**Request:**
```json
{
  "newLeaderId": "user2"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leadership transferred to Alice Smith",
  "data": { /* updated team */ }
}
```
