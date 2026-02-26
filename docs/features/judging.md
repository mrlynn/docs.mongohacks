---
sidebar_position: 6
---

# Judging System

Complete judging workflow from judge assignment to published results.

## Overview

The MongoHacks judging system provides a streamlined experience for organizers, judges, and participants:

**For Organizers:**
- Assign judges to projects with one click
- Monitor judging progress in real-time
- Generate AI feedback for all projects
- Publish/unpublish results with toggle

**For Judges:**
- View only assigned projects
- Score on 4 criteria with sliders (1-10 each)
- Add optional comments
- Track progress (X of Y scored)

**For Participants:**
- View final rankings when published
- Receive AI-synthesized feedback
- See detailed score breakdowns

---

## Workflow

### 1. Judge Assignment (Admin)

**Location:** `/admin/events/[eventId]/judging`

**Steps:**
1. Navigate to event's judging page
2. Select judges (checkboxes)
3. Select projects to assign
4. Click "Assign Selected"

**Features:**
- Batch assignment (assign multiple judges to multiple projects)
- Assignment tracking (see who's assigned to what)
- Duplicate prevention (one assignment per judge per project)
- Real-time stats (X judges assigned to Y projects)

**Backend:**
- Creates `JudgeAssignment` documents
- Status: `pending` → `in_progress` → `completed`
- Enforces unique constraint: `{ projectId, judgeId }`

**API:** `POST /api/admin/events/[eventId]/assignments`

```json
{
  "judgeIds": ["judge1", "judge2"],
  "projectIds": ["project1", "project2", "project3"]
}
```

---

### 2. Scoring Projects (Judge)

**Location:** `/judging/[eventId]`

#### Judging Dashboard

Shows all assigned projects as cards:

```
┌─────────────────────────────┐
│ ✅ Data Wizards - RAG Chat  │  Status: Scored
│ 8.5/10 average              │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ⏳ Team Alpha - Mobile App  │  Status: Pending
│ Not yet scored              │
└─────────────────────────────┘
```

**Progress Bar:** "You've scored 7 of 15 projects (47%)"

#### Scoring Interface

**Location:** `/judging/[eventId]/[projectId]`

**Layout:**
1. **Project Header** - Name, team, description
2. **AI Summary** - 2-3 sentence overview (if available)
3. **Links** - GitHub repo, demo, video
4. **Scoring Sliders** - 4 criteria × 1-10 scale
5. **Comments** - Optional text feedback
6. **Submit Button** - Save scores

**Criteria:**

| Criterion | Description | Weight |
|-----------|-------------|--------|
| **Innovation** | How novel and creative is the solution? | 1x |
| **Technical Complexity** | How sophisticated is the implementation? | 1x |
| **Impact** | How valuable is the solution to users? | 1x |
| **Presentation** | How well is the project documented and demoed? | 1x |

**Total Score:** Sum of 4 criteria (max 40 points)

**Backend:**
- Stores in `Score` model
- Auto-calculates `totalScore` on save
- Enforces unique constraint (one score per judge per project)
- Updates assignment status to `completed`

**API:** `POST /api/judging/[eventId]/score`

```json
{
  "projectId": "...",
  "innovation": 8,
  "technical": 9,
  "impact": 7,
  "presentation": 8,
  "comments": "Great use of vector search! Could improve error handling."
}
```

---

### 3. Results Aggregation (Admin)

**Location:** `/admin/events/[eventId]/results`

#### Calculate Results

**Algorithm:**
1. For each project, get all judge scores
2. Calculate average for each criterion
3. Sum averages to get total score
4. Sort projects by total score (descending)
5. Assign ranks (handle ties: same score = same rank)

**Example:**

**Project: RAG Chatbot**
- Judge 1: Innovation 8, Technical 9, Impact 7, Presentation 8 → Total 32
- Judge 2: Innovation 7, Technical 8, Impact 8, Presentation 7 → Total 30
- Judge 3: Innovation 9, Technical 7, Impact 6, Presentation 9 → Total 31

**Average Scores:**
- Innovation: 8.0
- Technical: 8.0
- Impact: 7.0
- Presentation: 8.0
- **Total: 31.0**

**Rank:** Based on total score comparison with all projects

#### Generate AI Feedback

**Button:** "Generate All Feedback"

**What it does:**
1. For each judged project (with scores):
   - Fetch all judge scores
   - Synthesize into 2-3 paragraphs
   - Store in `project.aiFeedback`
2. Show progress: "Generated feedback for 87 of 100 projects"

**Backend:** `POST /api/admin/events/[eventId]/generate-all-feedback`

**Time:** ~10-30 seconds for 100 projects (batched)

---

### 4. Publish Results

**Control:** Toggle switch on admin results page

**States:**
- **Hidden** (default) - Only admins can see results
- **Published** - Results visible to all participants

**Visual Indicator:**
```
┌────────────────────────────────────┐
│ 🔓 Results Visibility              │
│                                    │
│ Results are publicly visible       │
│ [●━━━━━━━━━━━] Published          │
└────────────────────────────────────┘
```

**What changes:**
- `event.resultsPublished` set to `true`
- `event.resultsPublishedAt` timestamp recorded
- Public results page becomes accessible
- Participants receive notification (future feature)

**API:** `POST /api/admin/events/[eventId]/publish-results`

```json
{
  "publish": true  // or false to unpublish
}
```

---

## Results Page (Public)

**Location:** `/events/[eventId]/results`

**Access Control:**
- If `resultsPublished === false` → 403 error (participants)
- Admins can always view

**Layout:**

### Top 3 Podium

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│     🥇      │ │     🥈      │ │     🥉      │
│     #1      │ │     #2      │ │     #3      │
│ RAG Chatbot │ │ Mobile App  │ │ Data Viz    │
│ Team Wizards│ │ Team Alpha  │ │ Team Beta   │
│   38.5/40   │ │   36.2/40   │ │   35.8/40   │
└─────────────┘ └─────────────┘ └─────────────┘
```

### Full Leaderboard

| Rank | Project | Team | Innovation | Technical | Impact | Presentation | Total | Judges |
|------|---------|------|------------|-----------|--------|--------------|-------|--------|
| 🥇 1 | RAG Chatbot | Wizards | 9.2 | 9.5 | 9.0 | 9.8 | 38.5 | 4 |
| 🥈 2 | Mobile App | Alpha | 8.8 | 9.0 | 8.5 | 9.9 | 36.2 | 3 |
| 🥉 3 | Data Viz | Beta | 9.0 | 8.5 | 8.8 | 9.5 | 35.8 | 4 |
| 4 | API Gateway | Gamma | 8.5 | 8.8 | 8.0 | 9.0 | 34.3 | 3 |

### Project Details (Expandable)

Click any project to see:
- Full description
- Technologies used
- Links (repo, demo, video)
- **Score breakdown** by criterion
- **AI feedback** (if generated)
- Judge count

---

## Database Models

### JudgeAssignment

```typescript
{
  eventId: ObjectId,
  judgeId: ObjectId,     // User with role: "judge"
  projectId: ObjectId,
  status: "pending" | "in_progress" | "completed",
  assignedAt: Date,
  completedAt: Date,
}

// Indexes
{ eventId: 1, judgeId: 1 }
{ projectId: 1, judgeId: 1 } // unique
{ judgeId: 1, status: 1 }
```

### Score

```typescript
{
  eventId: ObjectId,
  projectId: ObjectId,
  judgeId: ObjectId,
  scores: {
    innovation: Number,    // 1-10
    technical: Number,     // 1-10
    impact: Number,        // 1-10
    presentation: Number,  // 1-10
  },
  totalScore: Number,      // auto-calculated (sum of above)
  comments: String,        // optional
  submittedAt: Date,
}

// Indexes
{ projectId: 1, judgeId: 1 } // unique
{ eventId: 1 }
{ judgeId: 1 }
```

### Event (Extended)

```typescript
{
  // ... other fields
  resultsPublished: Boolean,
  resultsPublishedAt: Date,
}
```

---

## API Reference

### Admin APIs

#### Assign Judges

```http
POST /api/admin/events/:eventId/assignments

Body:
{
  "judgeIds": ["userId1", "userId2"],
  "projectIds": ["projectId1", "projectId2"]
}

Response:
{
  "success": true,
  "created": 4,
  "skipped": 0,
  "assignments": [...]
}
```

#### Get Assignments

```http
GET /api/admin/events/:eventId/assignments

Response:
{
  "success": true,
  "assignments": [
    {
      "judge": { "name": "John Doe", "email": "..." },
      "project": { "name": "RAG Chatbot", ... },
      "status": "completed"
    }
  ],
  "stats": {
    "totalAssignments": 45,
    "pending": 12,
    "completed": 33
  }
}
```

#### Delete Assignment

```http
DELETE /api/admin/events/:eventId/assignments/:assignmentId

Response:
{
  "success": true,
  "message": "Assignment removed"
}
```

#### Publish Results

```http
POST /api/admin/events/:eventId/publish-results

Body:
{
  "publish": true  // or false
}

Response:
{
  "success": true,
  "message": "Results are now public!",
  "event": {
    "resultsPublished": true,
    "resultsPublishedAt": "2026-02-26T10:00:00Z"
  }
}
```

#### Generate All Feedback

```http
POST /api/admin/events/:eventId/generate-all-feedback

Response:
{
  "success": true,
  "message": "Generated feedback for 87 project(s)",
  "generated": 87,
  "failed": 0,
  "total": 87
}
```

---

### Judge APIs

#### Get Assigned Projects

```http
GET /api/judging/:eventId/projects

Response:
{
  "success": true,
  "projects": [
    {
      "project": { ... },
      "assignment": { "status": "completed" },
      "score": { "totalScore": 32 } // if already scored
    }
  ]
}
```

#### Submit Score

```http
POST /api/judging/:eventId/score

Body:
{
  "projectId": "...",
  "innovation": 8,
  "technical": 9,
  "impact": 7,
  "presentation": 8,
  "comments": "Great project!"
}

Response:
{
  "success": true,
  "score": { ... },
  "message": "Score submitted successfully!"
}
```

---

### Public APIs

#### Get Results

```http
GET /api/events/:eventId/results

Response (if published):
{
  "success": true,
  "results": [
    {
      "rank": 1,
      "projectId": "...",
      "project": { "name": "RAG Chatbot", ... },
      "team": { "name": "Data Wizards" },
      "averageScores": {
        "innovation": 9.2,
        "technical": 9.5,
        "impact": 9.0,
        "presentation": 9.8
      },
      "totalScore": 38.5,
      "judgeCount": 4
    }
  ],
  "event": {
    "name": "MongoHacks 2026",
    "resultsPublished": true,
    "resultsPublishedAt": "..."
  }
}

Response (if not published & not admin):
{
  "success": false,
  "error": "Results have not been published yet"
}
```

---

## Best Practices

### For Organizers

**Judging Timeline:**
1. **Day before judging:** Assign judges to projects
2. **Judging day:** Monitor progress, remind judges
3. **After judging:** Generate AI feedback, review results
4. **Publish:** Toggle results public, announce winners

**Assignment Strategy:**
- Assign 3-5 judges per project for balanced scoring
- Ensure judges have diverse backgrounds
- Avoid conflicts of interest (judges judging their own teams)

**Monitoring:**
- Check judging progress every 2 hours
- Send reminders to judges with pending assignments
- Review outlier scores (all 1s or all 10s)

### For Judges

**Time Management:**
- Budget 5-10 minutes per project
- Read AI summary first (saves 3-5 minutes)
- Focus on demo/repo over just description

**Scoring Guidelines:**
- Use the full scale (1-10, not just 7-10)
- Be consistent across projects
- Leave comments to help feedback synthesis

**Comments:**
- Mention specific strengths
- Suggest concrete improvements
- Keep it constructive and encouraging

---

## Troubleshooting

### Judge Can't See Assigned Projects

**Causes:**
1. User doesn't have `role: "judge"`
2. Assignment not created
3. Event ID mismatch

**Debug:**
```javascript
// Check user role
db.users.findOne({ email: "judge@example.com" }, { role: 1 })

// Check assignments
db.judgeassignments.find({ judgeId: userId, eventId: eventId })
```

### Score Submission Fails

**Error:** "You are not assigned to judge this project"

**Solution:** Admin must assign judge to project first

---

**Error:** "Score out of range"

**Solution:** All criteria must be 1-10

### Results Not Calculating

**Causes:**
1. No scores submitted yet
2. Projects not in "submitted" status
3. API timeout on large dataset

**Solution:**
- Verify at least one score exists per project
- Check project status is "submitted" or "judged"
- For 500+ projects, consider pagination

---

## Next Steps

- [Assign judges to projects](/docs/admin/judges)
- [Generate AI feedback](/docs/ai/feedback-synthesis)
- [Publish results](/docs/features/results)
