---
sidebar_position: 3
---

# Team Matching API

AI-powered team recommendations using vector search.

## Get Team Recommendations

Get AI-matched team recommendations for a participant.

**Endpoint:** `GET /api/events/:eventId/teams/recommended`

**Authentication:** Required (participant)

**Query Parameters:**
- `limit` (number, default: 10) - Max recommendations

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "team": {
        "_id": "team123",
        "name": "Data Wizards",
        "description": "Building a RAG chatbot",
        "desiredSkills": ["Python", "ML", "APIs"],
        "members": [...],
        "capacity": 5,
        "memberCount": 3
      },
      "matchScore": 87.3,
      "matchReasons": {
        "matches": ["Python", "MongoDB"],
        "gaps": ["Docker", "CI/CD"]
      }
    },
    {
      "team": {
        "_id": "team456",
        "name": "AI Innovators",
        "desiredSkills": ["React", "APIs", "ML"]
      },
      "matchScore": 72.1,
      "matchReasons": {
        "matches": ["React", "APIs"],
        "gaps": ["ML"]
      }
    }
  ]
}
```

**Match Score:**
- 90-100%: Excellent match
- 75-89%: Good match
- 60-74%: Moderate match
- 40-59%: Weak match
- 0-39%: Poor match

**Algorithm:**
1. Fetch participant's skill embedding (1536-dim vector)
2. Query MongoDB Atlas Vector Search on `team_skills_vector` index
3. Calculate cosine similarity
4. Filter by:
   - Event ID
   - Looking for members
   - Not at capacity
5. Return top N with scores

**Fallback:**
If vector search unavailable, uses tag-overlap matching.

---

## Generate Participant Embedding

Trigger embedding generation for a participant.

**Endpoint:** `POST /api/participants/:participantId/generate-embedding`

**Authentication:** Required (admin)

**Response:**
```json
{
  "success": true,
  "message": "Embedding generated",
  "data": {
    "skillsEmbedding": [0.023, -0.145, 0.891, /* ... 1536 numbers */]
  }
}
```

**Process:**
- Combines skills + bio into text
- Calls OpenAI `text-embedding-3-small`
- Stores 1536-dim vector
- Takes 1-2 seconds
- Cost: ~$0.0001

---

## Generate Team Embedding

Trigger embedding generation for a team.

**Endpoint:** `POST /api/teams/:teamId/generate-embedding`

**Authentication:** Required (admin)

**Response:**
```json
{
  "success": true,
  "message": "Embedding generated",
  "data": {
    "desiredSkillsEmbedding": [0.156, 0.234, -0.089, /* ... */]
  }
}
```

**Process:**
- Combines desired skills + description
- Calls OpenAI embedding API
- Stores vector
- Enables vector search matching

---

## Match Quality Check

Test match quality for a participant.

**Endpoint:** `GET /api/events/:eventId/match-quality`

**Authentication:** Required (participant)

**Response:**
```json
{
  "success": true,
  "data": {
    "participantSkills": ["Python", "MongoDB", "React"],
    "hasEmbedding": true,
    "teamsWithEmbeddings": 38,
    "totalTeams": 42,
    "vectorSearchAvailable": true,
    "averageMatchScore": 65.4,
    "topMatch": {
      "teamName": "Data Wizards",
      "score": 87.3
    }
  }
}
```

**Use for:**
- Debugging match quality
- Verifying embeddings exist
- Checking Vector Search availability
