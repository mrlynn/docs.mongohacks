---
sidebar_position: 4
---

# Event Creation API

Create and manage hackathon events.

## Create Event

**Endpoint:** `POST /api/admin/events`

**Authentication:** Required (admin/organizer)

**Request:**
```json
{
  "name": "MongoHacks Spring 2026",
  "slug": "mongohacks-spring-2026",
  "description": "Join us for our biggest hackathon yet! Build innovative projects using MongoDB Atlas and AI.",
  "startDate": "2026-03-18T09:00:00Z",
  "endDate": "2026-03-18T20:00:00Z",
  "submissionDeadline": "2026-03-18T18:00:00Z",
  "capacity": 150,
  "categories": ["AI/ML", "Web Application", "Mobile App"],
  "location": "MongoDB HQ, New York",
  "isVirtual": false,
  "enableAI": true,
  "bannerUrl": "https://example.com/banner.jpg",
  "primaryColor": "#00ED64"
}
```

**Required Fields:**
- `name` (string, 3-100 chars)
- `slug` (string, URL-safe, unique)
- `description` (string, min 10 chars)
- `startDate` (ISO 8601 datetime)
- `endDate` (ISO 8601 datetime, after startDate)
- `capacity` (number, 1-10000)

**Optional Fields:**
- `submissionDeadline` (datetime, between start and end)
- `categories` (array of strings)
- `location` (string)
- `isVirtual` (boolean, default: false)
- `enableAI` (boolean, default: true)
- `bannerUrl` (string, valid URL)
- `primaryColor` (string, hex color)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Event created!",
  "data": {
    "_id": "event123",
    "name": "MongoHacks Spring 2026",
    "slug": "mongohacks-spring-2026",
    "status": "draft",
    "currentParticipants": 0,
    "createdAt": "2026-02-01T10:00:00Z"
  }
}
```

---

## Update Event

**Endpoint:** `PATCH /api/admin/events/:eventId`

**Authentication:** Required (admin/organizer)

**Request:**
```json
{
  "capacity": 200,
  "description": "Updated description",
  "submissionDeadline": "2026-03-18T19:00:00Z"
}
```

**Restrictions:**
- Cannot change `slug` (breaks URLs)
- Cannot change `startDate` if participants registered
- Cannot decrease `capacity` below current participants

**Response:**
```json
{
  "success": true,
  "message": "Event updated",
  "data": { /* updated event */ }
}
```

---

## Update Event Status

**Endpoint:** `PATCH /api/admin/events/:eventId/status`

**Request:**
```json
{
  "status": "published"
}
```

**Valid transitions:**
- `draft` → `published`
- `published` → `active`
- `active` → `concluded`

**Response:**
```json
{
  "success": true,
  "message": "Event status updated to published",
  "data": {
    "status": "published",
    "publishedAt": "2026-02-01T10:30:00Z"
  }
}
```

---

## Delete Event

**Endpoint:** `DELETE /api/admin/events/:eventId`

**Authentication:** Required (super admin)

**Checks:**
- Status is `draft`?
- No participants registered?

**Response:**
```json
{
  "success": true,
  "message": "Event deleted"
}
```

**Error - Has Participants:**
```json
{
  "success": false,
  "error": "Cannot delete event with registered participants",
  "code": "EVENT_HAS_PARTICIPANTS"
}
```
