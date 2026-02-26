---
sidebar_position: 1
---

# Event Registration

Register participants for hackathon events.

## Register for Event

Register a new participant for an event. Creates user account if email doesn't exist.

**Endpoint:** `POST /api/events/:eventId/register`

**Authentication:** None (public)

---

### Request

**Path Parameters:**
- `eventId` (string, required) - Event ID

**Request Body:**
```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "password": "securePassword123",
  "skills": ["Python", "MongoDB", "React"],
  "experienceLevel": "intermediate",
  "bio": "Full-stack developer interested in AI",
  "githubUsername": "alice-dev",
  "linkedinUrl": "https://linkedin.com/in/alice-smith"
}
```

**Required Fields:**
- `name` (string, 2-100 chars)
- `email` (string, valid email format)
- `password` (string, min 8 chars)
- `skills` (array, 1-10 items)

**Optional Fields:**
- `experienceLevel` (enum: beginner, intermediate, advanced, expert)
- `bio` (string, max 500 chars)
- `githubUsername` (string)
- `linkedinUrl` (string, valid URL)

---

### Response

**Success (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful!",
  "data": {
    "participant": {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "userId": "65f1a2b3c4d5e6f7g8h9i0j2",
      "skills": ["Python", "MongoDB", "React"],
      "bio": "Full-stack developer interested in AI"
    },
    "user": {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "role": "participant"
    }
  },
  "redirectTo": "/events/event123/hub"
}
```

---

### Errors

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

**400 Bad Request - Already Registered:**
```json
{
  "success": false,
  "error": "Email already registered for this event",
  "code": "DUPLICATE_REGISTRATION"
}
```

**400 Bad Request - Event Full:**
```json
{
  "success": false,
  "error": "Event has reached capacity (150/150)",
  "code": "EVENT_FULL",
  "waitlistAvailable": true
}
```

**400 Bad Request - Registration Closed:**
```json
{
  "success": false,
  "error": "Registration deadline has passed",
  "code": "REGISTRATION_CLOSED"
}
```

---

### Example

```bash
curl -X POST http://localhost:3002/api/events/event123/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "password": "password123",
    "skills": ["Python", "MongoDB", "React"]
  }'
```

---

## Check Registration Status

Check if a user is already registered for an event.

**Endpoint:** `GET /api/events/:eventId/registration-status`

**Authentication:** Required (session)

**Response:**
```json
{
  "success": true,
  "data": {
    "isRegistered": true,
    "participant": {
      "_id": "...",
      "skills": ["Python", "MongoDB"],
      "teamId": "team123"
    }
  }
}
```
