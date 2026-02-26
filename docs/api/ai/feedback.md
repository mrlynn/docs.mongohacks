---
sidebar_position: 2
---

# Feedback Synthesis API

AI-synthesized feedback from judge scores and comments.

## Generate Feedback

Generate AI feedback for a project based on judge scores.

**Endpoint:** `POST /api/admin/projects/:projectId/generate-feedback`

**Authentication:** Required (admin/organizer)

**Prerequisites:**
- Project must have at least 1 judge score
- At least 1 judge must have left comments

**Response:**
```json
{
  "success": true,
  "message": "Feedback generated",
  "data": {
    "aiFeedback": "**Strengths:** Your project demonstrates strong technical execution, particularly in the integration of MongoDB Atlas Vector Search with the GPT-4 API. Judges consistently praised the innovation in applying RAG to documentation search (average 8/10).\n\n**Areas for Improvement:** Consider adding more robust error handling for edge cases and expanding the dataset beyond MongoDB docs.\n\n**Summary:** Overall, this is a well-built project with clear potential for real-world use. Great work!"
  }
}
```

**Process:**
- Collects all judge scores and comments
- Calls GPT-4 Turbo for synthesis
- Generates 2-3 paragraph feedback
- Takes 10-20 seconds

---

## Batch Generate Feedback

Generate feedback for all judged projects in an event.

**Endpoint:** `POST /api/admin/events/:eventId/generate-all-feedback`

**Authentication:** Required (admin/organizer)

**Response:**
```json
{
  "success": true,
  "message": "Generated feedback for 38 projects",
  "data": {
    "total": 42,
    "success": 38,
    "skipped": 2,
    "failed": 2,
    "errors": [
      {
        "projectId": "project456",
        "projectName": "Data Viz Tool",
        "error": "No judge comments available"
      }
    ]
  }
}
```

**Skips:**
- Projects without judge scores
- Projects already with feedback
- Projects with no judge comments

**Process:**
- Sequential processing (1 per second)
- Prevents rate limiting
- Returns detailed results
- Takes ~1 minute for 40 projects
