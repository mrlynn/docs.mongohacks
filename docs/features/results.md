---
sidebar_position: 7
---

# Results

View hackathon rankings, scores, and judge feedback after the event.

## Overview

The results page displays final project rankings once judging is complete and results are published by organizers.

**URL:** `/events/[eventId]/results`

**Access control:**
- **Published:** Everyone can view
- **Unpublished:** Only admins/organizers can view

---

## Results Page Layout

### Top 3 Podium

**Visual highlight for winners:**

```
        🥇                 🥈                 🥉
        #1                 #2                 #3
   RAG Chatbot         Mobile App         Data Viz
   Data Wizards       Team Alpha         Team Beta
     38.5/40            36.2/40            35.8/40
   (4 judges)         (3 judges)         (4 judges)
```

**Podium colors:**
- 🥇 Gold gradient background
- 🥈 Silver gradient background
- 🥉 Bronze gradient background

**Information displayed:**
- Rank and medal emoji
- Project name
- Team name
- Total score (out of 40)
- Number of judges who scored

---

### Full Leaderboard Table

**All projects ranked:**

| Rank | Project | Team | Innovation | Technical | Impact | Presentation | Total | Judges |
|------|---------|------|------------|-----------|--------|--------------|-------|--------|
| 🥇 1 | RAG Chatbot | Wizards | 9.2 | 9.5 | 9.0 | 9.8 | 38.5 | 4 |
| 🥈 2 | Mobile App | Alpha | 8.8 | 9.0 | 8.5 | 9.9 | 36.2 | 3 |
| 🥉 3 | Data Viz | Beta | 9.0 | 8.5 | 8.8 | 9.5 | 35.8 | 4 |
| 4 | API Gateway | Gamma | 8.5 | 8.8 | 8.0 | 9.0 | 34.3 | 3 |

**Columns explained:**
- **Rank** - Position (1 = winner)
- **Project** - Project name (clickable link)
- **Team** - Team name (clickable link)
- **Innovation** - Average score (1-10)
- **Technical** - Average score (1-10)
- **Impact** - Average score (1-10)
- **Presentation** - Average score (1-10)
- **Total** - Sum of averages (max 40)
- **Judges** - How many judges scored

**Sorting:** By total score (descending)

**Visual cues:**
- Top 3 rows highlighted with subtle background color
- Medal emojis for top 3
- Hover effects on rows

---

### Project Details (Expandable)

**Click any project to expand:**

```
► #1 RAG Chatbot                38.5/40

▼ #1 RAG Chatbot                38.5/40
  
  Description:
  A retrieval-augmented generation chatbot using MongoDB 
  Atlas Vector Search and GPT-4 to answer questions about
  MongoDB documentation.
  
  Technologies:
  [MongoDB] [OpenAI] [Python] [Next.js] [LangChain]
  
  Links:
  [GitHub] [Demo] [Video]
  
  Score Breakdown:
  ┌─────────────┬────────┐
  │ Innovation  │ 9.2/10 │
  │ Technical   │ 9.5/10 │
  │ Impact      │ 9.0/10 │
  │ Presentation│ 9.8/10 │
  └─────────────┴────────┘
  
  Averaged from 4 judges
```

**Expandable sections include:**
- Full project description
- Technologies used (clickable tags)
- External links (repo, demo, video)
- Individual criterion scores
- Judge count

---

## Scoring System

### Four Criteria (1-10 each)

**Innovation (max 10 points):**
- How novel is the solution?
- Creative use of technology?
- Unique approach to problem?

**Technical Complexity (max 10 points):**
- How sophisticated is the implementation?
- Quality of code architecture?
- Technical challenges overcome?

**Impact (max 10 points):**
- How valuable is the solution?
- Real-world applicability?
- Potential user benefit?

**Presentation (max 10 points):**
- Quality of documentation?
- Demo clarity?
- Code readability?

**Total Score:** Sum of four criteria = **40 points maximum**

---

### Score Aggregation

**How final scores are calculated:**

1. **Collect** all judge scores for a project
2. **Average** each criterion across judges
3. **Sum** the four averages for total score
4. **Rank** projects by total score (highest first)
5. **Handle ties** (same score = same rank)

**Example:**
```
Project: RAG Chatbot

Judge 1: Innovation 8, Technical 9, Impact 7, Presentation 8 → Total 32
Judge 2: Innovation 7, Technical 8, Impact 8, Presentation 7 → Total 30  
Judge 3: Innovation 9, Technical 7, Impact 6, Presentation 9 → Total 31

Averages:
- Innovation: (8 + 7 + 9) / 3 = 8.0
- Technical: (9 + 8 + 7) / 3 = 8.0
- Impact: (7 + 8 + 6) / 3 = 7.0
- Presentation: (8 + 7 + 9) / 3 = 8.0

Final Total: 8.0 + 8.0 + 7.0 + 8.0 = 31.0
```

**Rounding:** Scores shown to 1 decimal place

---

### Tie Handling

**When two projects have identical scores:**
- Both get the same rank
- Next rank is skipped

**Example:**
```
1. Project A - 38.5
2. Project B - 36.5
2. Project C - 36.5  (tied with B)
4. Project D - 35.0  (3rd place skipped)
```

**Tiebreaker (optional):**
- Higher innovation score
- More judge scores
- Earlier submission time

---

## Judge Feedback

### AI-Synthesized Feedback

**After judging, teams receive:**
- 2-3 paragraph summary
- Combines all judge comments
- Constructive and encouraging
- Specific strengths and improvements

**Example feedback:**

> **Strengths:**
> Your project demonstrates strong technical execution, particularly in the integration of MongoDB Atlas Vector Search with the GPT-4 API. Judges consistently praised the innovation in applying RAG to documentation search (average 8/10), noting the practical value and real-world applicability.
>
> **Areas for Improvement:**
> To strengthen this further, consider adding more robust error handling for edge cases and expanding the dataset beyond MongoDB docs to demonstrate broader applicability. The presentation was excellent overall, though one judge suggested more detailed setup instructions in the README.
>
> **Summary:**
> Overall, this is a well-built project with clear potential for real-world use. Great work on the technical implementation and demo presentation!

**Visibility:**
- Shows on project detail page
- Only visible to team members
- Appears after organizers generate feedback
- Email notification (optional)

---

## Publishing Results

### Admin Control

**Before publishing:**
- Results page shows "Results not yet published"
- Only admins/organizers can view rankings
- Participants see message: "Results will be published soon"

**After publishing:**
- Results page becomes public
- All rankings visible
- Scores and feedback shown
- Winners announced

**Admin toggle:**
```
Results Visibility

● Published  ○ Hidden

Results are now public. All participants and visitors
can view rankings and scores.
```

**Benefits of controlled publishing:**
- Review results before making public
- Verify no scoring errors
- Prepare announcement materials
- Time publication for awards ceremony

---

## Unpublished State

### What Participants See

```
Results Not Yet Published

Judging is complete. Results will be published soon.

Check back later or wait for an email notification.
```

**Why useful:**
- Prevents premature leaks
- Allows time for winner notifications
- Coordinates with announcements
- Gives buffer to fix errors

---

## Results Data API

### GET /api/events/:eventId/results

**Public endpoint (if published):**

```http
GET /api/events/abc123/results
```

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
        "technologies": ["MongoDB", "OpenAI", "Python"],
        "repoUrl": "https://github.com/...",
        "demoUrl": "https://demo.com"
      },
      "team": {
        "name": "Data Wizards",
        "_id": "team123"
      },
      "averageScores": {
        "innovation": 9.2,
        "technical": 9.5,
        "impact": 9.0,
        "presentation": 9.8
      },
      "totalScore": 38.5,
      "judgeCount": 4,
      "scores": [
        {
          "judgeId": "judge1",
          "scores": { "innovation": 9, "technical": 10, ... },
          "totalScore": 39,
          "comments": "Excellent work!"
        }
      ]
    }
  ],
  "event": {
    "name": "MongoHacks Spring 2026",
    "resultsPublished": true,
    "resultsPublishedAt": "2026-03-18T10:00:00Z"
  }
}
```

**If not published:**
```json
{
  "success": false,
  "error": "Results have not been published yet"
}
```

---

## Mobile Experience

### Responsive Design

**Mobile viewport optimizations:**
- Stack podium vertically (1 column)
- Simplified leaderboard (hide some columns)
- Touch-friendly expand/collapse
- Swipe to view scores
- Bottom sheet for project details

**Mobile leaderboard:**
```
┌─────────────────────────┐
│ 🥇 #1                   │
│ RAG Chatbot             │
│ Team: Data Wizards      │
│ Score: 38.5/40          │
│ [Tap to view details]   │
└─────────────────────────┘

┌─────────────────────────┐
│ 🥈 #2                   │
│ Mobile App              │
│ Team: Alpha             │
│ Score: 36.2/40          │
└─────────────────────────┘
```

**Touch targets:**
- Minimum 44px height
- Generous tap areas
- Clear visual feedback

---

## Exporting Results

### CSV Export (Admin)

**Admin results page has "Export CSV" button**

**Downloaded file:** `mongohacks-results-2026-03-18.csv`

**Columns:**
```csv
Rank,Project,Team,Innovation,Technical,Impact,Presentation,Total,Judges,Repository,Demo
1,RAG Chatbot,Data Wizards,9.2,9.5,9.0,9.8,38.5,4,https://github.com/...,https://demo.com
2,Mobile App,Team Alpha,8.8,9.0,8.5,9.9,36.2,3,https://github.com/...,https://app.com
```

**Use cases:**
- Reporting to sponsors
- Internal records
- Prize fulfillment
- Analytics

---

## Analytics

### Results Page Metrics

**Track:**
- Page views after publication
- Time spent viewing
- Projects clicked/expanded
- External link clicks (repo, demo)
- Share button usage

**Goals:**
- 80%+ participants view results
- Average 3+ minutes time on page
- 40%+ click through to winning projects

---

## Best Practices

### For Organizers

**Before publishing:**
1. Review all scores for anomalies
2. Verify no tied winners (if undesired)
3. Generate feedback for all projects
4. Prepare winner announcement
5. Notify top 3 teams privately first

**Publication timing:**
- During awards ceremony (live reveal)
- OR immediately after judging
- OR scheduled time (e.g., next day 10 AM)

**Communication:**
- Email all participants
- Post on Discord/Slack
- Tweet winners
- Update event page

---

### For Participants

**Viewing results:**
- Don't refresh obsessively (hurts server)
- Congratulate winners
- Review your own feedback
- Share your project
- Connect with teammates

**After results:**
- Add project to portfolio
- Update GitHub README with ranking
- Share on LinkedIn
- Apply feedback to next project

---

## Troubleshooting

### Results Still Not Published

**Check:**
- Look for admin announcement
- Check Discord/email
- Refresh page (might cache)

**Typical delay:** 1-4 hours after judging concludes

---

### My Team's Project Missing

**Causes:**
- Project not submitted
- Submitted after deadline
- Disqualified (organizer action)

**Solution:** Contact organizers

---

### Scores Seem Wrong

**Double-check:**
- Look at individual judge scores (expanded view)
- Verify it's average, not sum
- Check judge count (fewer judges = less stable)

**If truly wrong:** Contact organizers immediately

---

## Fair Judging

### Preventing Bias

**Score normalization (optional):**
- Some judges score higher/lower on average
- Normalize scores to mean=5
- Reduces judge-specific bias

**Blind judging:**
- Judges don't see team names
- Prevents favoritism
- Focus on project merit

**Conflict of interest:**
- Judges recuse from their team's project
- Judges with personal connections recuse
- Minimum 3 judges per project for stability

---

## Next Steps

- [Understand judging criteria](/docs/features/judging)
- [Generate AI feedback](/docs/ai/feedback-synthesis)
- [Export results data](/docs/admin/analytics)
- [Create your next project](/docs/features/projects)
