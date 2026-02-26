---
sidebar_position: 5
---

# Projects

Project submission, management, and showcase features for hackathon teams.

## Overview

Projects are what teams build during hackathons. Each team can submit **one project per event**.

**Project lifecycle:**
1. **Draft** - Work in progress, not yet submitted
2. **Submitted** - Ready for judging, locked from major edits
3. **Under Review** - Being judged
4. **Judged** - Scoring complete, feedback available

---

## Creating a Project

### Prerequisites

- Must be on a team (cannot create solo project without team)
- Team must not already have a project
- Event must be active (not concluded)

### From Event Hub

1. Click "Create Project" button in Your Team section
2. Fill project creation form
3. Save as draft
4. Continue editing until ready
5. Submit when complete

### Project Form Fields

**Required:**
- **Name** - Project title (max 100 chars)
- **Description** - What it does, how it works (max 2000 chars)
- **Repository URL** - GitHub, GitLab, or Bitbucket link

**Optional:**
- **Demo URL** - Live demo link (Vercel, Netlify, etc.)
- **Video URL** - YouTube, Vimeo demo video
- **Technologies** - Tags (React, MongoDB, Python, etc.)
- **Category** - AI/ML, Web App, Mobile, etc.
- **Innovations** - What's unique or novel (for AI summary)

**Validation rules:**
- Repository URL must be valid (GitHub/GitLab/Bitbucket)
- URLs must be https://
- Technologies: 1-15 tags
- Category: must match event categories

---

## Editing Projects

### Draft Mode

**Full editing available:**
- Change name, description
- Update all URLs
- Add/remove technologies
- Modify innovations section

**Save types:**
- **Save Draft** - Auto-saves every 30s
- **Submit for Judging** - Locks project

**Auto-save indicators:**
- "Saving..." (spinner)
- "Saved" (checkmark)  
- "Error saving" (retry button)

---

### After Submission

**Limited editing:**
- ✅ Can update demo/video URLs
- ✅ Can add technologies (not remove)
- ❌ Cannot change name
- ❌ Cannot change description
- ❌ Cannot change repository

**Why locked:** Prevents teams from changing projects after judges start scoring.

**Unsubmit option:**
- Available before submission deadline
- Returns to draft mode
- Re-enables full editing
- Must resubmit before deadline

---

## Submission Process

### Submit for Judging

**Requirements:**
- All required fields filled
- Valid repository URL
- Before submission deadline
- Team consensus (leader can submit)

**What happens:**
1. Status changes to "submitted"
2. `submittedAt` timestamp recorded
3. AI summary generation triggered (async)
4. Project appears in judge queue
5. Editing restrictions applied

**Deadline enforcement:**
- Hard deadline (no submissions after)
- Clock visible in Event Hub
- Countdown shows hours/minutes/seconds
- Warning at 1 hour remaining

---

### AI Summary Generation

**Automatic on submission:**
```typescript
// Fire-and-forget (doesn't block submission)
generateProjectSummary({
  name: project.name,
  description: project.description,
  technologies: project.technologies,
  innovations: project.innovations
})
  .then(summary => {
    // Stores in project.aiSummary
  });
```

**Summary appears:**
- In judging interface (for judges)
- Usually within 10-30 seconds
- 2-3 sentence overview
- Highlights key technologies and innovation

**Example:**
> "This project builds a retrieval-augmented generation (RAG) chatbot using MongoDB Atlas Vector Search and OpenAI's GPT-4 to answer questions about MongoDB documentation. The system embeds documentation chunks and retrieves relevant context before generating responses. Built with Python, LangChain, and a Next.js frontend."

**Cost:** ~$0.01-0.02 per summary

---

## Project Showcase

### Project Detail Page

**URL:** `/events/[eventId]/projects/[projectId]`

**Displays:**
- Project name and description
- Team information
- Technologies used (tags)
- Links (repo, demo, video)
- Submission status and timestamp
- AI-generated summary (if available)
- Judge feedback (after judging, if published)

**Interactive elements:**
- Click technology tags to filter
- External links open in new tab
- Share button (copy link)
- GitHub stars/forks (if public repo)

---

### Browse Projects

**URL:** `/events/[eventId]/projects`

**Filters:**
- Status (draft, submitted, judged)
- Category (AI/ML, Web, Mobile, etc.)
- Technologies (React, MongoDB, Python, etc.)
- Team (search by team name)

**Sort options:**
- Newest first
- Alphabetical
- Most starred (GitHub)
- Top ranked (after results published)

**Card view:**
```
┌────────────────────────────┐
│ RAG Chatbot               │
│ By: Data Wizards          │
│                           │
│ Python • MongoDB • AI     │
│                           │
│ ✅ Submitted 2 hours ago  │
└────────────────────────────┘
```

---

## Project Validation

### Repository URL Check

**Accepted formats:**
```
https://github.com/user/repo
https://gitlab.com/user/repo
https://bitbucket.org/user/repo
```

**Validation:**
- Must be https (not http)
- Must be public or accessible
- Cannot be github.com/user (needs repo)
- Cannot be gist URLs

**Why required:** Judges need to review code quality.

---

### Originality Check

**Manual review (organizers):**
- Check commit history (timestamps)
- Verify code written during event
- Flag suspicious patterns

**Automated checks (future):**
- First commit during event period?
- Majority of commits during event?
- No large file drops (pre-written code)?

**Penalties:**
- Disqualification for pre-written code
- Must be built during event

---

## Technologies & Categories

### Technology Tags

**Common tags:**
- **Languages:** Python, JavaScript, TypeScript, Java, Go, Rust
- **Frontend:** React, Vue, Angular, Next.js, Svelte
- **Backend:** Node.js, Express, FastAPI, Django, Flask
- **Databases:** MongoDB, PostgreSQL, Redis, MySQL
- **AI/ML:** OpenAI, TensorFlow, PyTorch, Hugging Face
- **Cloud:** AWS, Azure, GCP, Vercel, Heroku
- **Tools:** Docker, Kubernetes, Git, GitHub Actions

**Why tags matter:**
- Help judges understand tech stack
- Enable project discovery by technology
- Show team skills
- Used in analytics

**Best practices:**
- 3-8 tags optimal
- Specific > generic ("Next.js" > "JavaScript")
- List core technologies only
- Consistent naming (MongoDB not mongo)

---

### Project Categories

**Standard categories:**
- **AI/ML** - Machine learning, LLMs, computer vision
- **Web Application** - Full-stack web apps
- **Mobile App** - iOS, Android, React Native
- **Developer Tools** - APIs, CLIs, libraries
- **Data Visualization** - Dashboards, charts, analytics
- **Social Impact** - Accessibility, education, sustainability
- **Gaming** - Games, simulations
- **Hardware/IoT** - Embedded systems, robotics

**Category-specific prizes:**
- Best AI/ML Project
- Best Use of MongoDB
- Best Mobile App
- etc.

---

## Project Assets

### Repository

**Best practices:**
- Include README.md with:
  - Project description
  - Setup instructions
  - Screenshots
  - Technology stack
  - Team members
- Add LICENSE file
- Keep commits clean
- Document API endpoints
- Include .env.example

**Judges look for:**
- Code quality
- Documentation
- Commit history
- Test coverage
- Project structure

---

### Demo URL

**Recommended platforms:**
- **Vercel** - Next.js, React apps
- **Netlify** - Static sites, serverless
- **Heroku** - Full-stack apps
- **Railway** - Docker deployments
- **Render** - Web services
- **GitHub Pages** - Static sites

**Requirements:**
- Must be publicly accessible
- Should work without login (or demo account)
- Fast loading (<3 seconds)
- Mobile-responsive

**Demo tips:**
- Seed with sample data
- Include walkthrough instructions
- Handle errors gracefully
- Test before submitting

---

### Video Demo

**Length:** 2-3 minutes ideal

**What to include:**
1. Problem statement (15-30s)
2. Solution overview (30s)
3. Live demo (60-90s)
4. Tech stack (15-30s)
5. Call to action (10s)

**Tools:**
- **Recording:** Loom, OBS, QuickTime
- **Hosting:** YouTube, Vimeo, Wistia
- **Editing:** iMovie, DaVinci Resolve (free)

**Tips:**
- Script it first
- Practice run-through
- Good audio quality matters
- Show, don't just tell
- Keep it concise

---

## Quick Edit Feature

### From Event Hub

**Inline editing without navigation:**
1. Click "Edit" button on project card
2. Dialog opens with key fields
3. Make changes
4. Click "Save"
5. Dialog closes, hub updates

**Editable in Quick Edit:**
- Project name
- Description
- Technologies (tags)
- Repository URL
- Demo URL

**Why useful:**
- 67% faster than full edit page
- Stay in Event Hub flow
- Quick URL updates
- Minimal context switching

**When to use full edit page:**
- Adding video
- Changing category
- Major description rewrite
- Multiple field changes

---

## Technical Implementation

### Project Model

```typescript
{
  _id: ObjectId,
  eventId: ObjectId → Event,
  teamId: ObjectId → Team,
  name: string,
  description: string,
  aiSummary?: string,
  aiFeedback?: string,
  category: string,
  technologies: string[],
  innovations?: string,
  repoUrl: string,
  demoUrl?: string,
  videoUrl?: string,
  status: "draft" | "submitted" | "under_review" | "judged",
  submittedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
{ eventId: 1, status: 1 }          // Browse projects
{ teamId: 1, eventId: 1 } unique   // One per team per event
{ teamId: 1 }                      // Team's project
```

---

### API Endpoints

#### Create Project

```http
POST /api/events/:eventId/projects
```

**Request:**
```json
{
  "name": "RAG Chatbot for MongoDB Docs",
  "description": "A retrieval-augmented generation chatbot...",
  "category": "AI/ML",
  "technologies": ["MongoDB", "OpenAI", "Python", "Next.js"],
  "innovations": "Uses Atlas Vector Search for semantic search...",
  "repoUrl": "https://github.com/team/rag-chatbot"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project created!",
  "data": {
    "_id": "project123",
    "status": "draft",
    "teamId": "team123"
  }
}
```

---

#### Update Project

```http
PATCH /api/events/:eventId/projects/:projectId
```

**Request:**
```json
{
  "demoUrl": "https://rag-chatbot.vercel.app",
  "videoUrl": "https://youtube.com/watch?v=abc123"
}
```

**Validation:**
- User must be team member
- If submitted: only URLs can change
- If draft: all fields can change

---

#### Submit Project

```http
POST /api/events/:eventId/projects/:projectId
```

**Request:**
```json
{
  "action": "submit"
}
```

**Checks:**
- Before submission deadline?
- All required fields filled?
- User is team member?

**On success:**
- status → "submitted"
- submittedAt timestamp set
- AI summary generation triggered
- Returns updated project

---

## Judge Feedback

### After Judging

**Teams receive:**
- AI-synthesized feedback (2-3 paragraphs)
- Combined from all judge scores + comments
- Constructive and encouraging tone
- Specific strengths and improvements

**Example feedback:**
> "Your project demonstrates strong technical execution, particularly in the integration of MongoDB Atlas Vector Search with the GPT-4 API, earning consistent high marks across judges (average 8.3/10 technical). The innovation in applying RAG to documentation search was widely appreciated (average 8/10), with judges noting the practical value of the solution. To take this further, consider adding more robust error handling for edge cases and expanding the dataset beyond MongoDB docs to demonstrate broader applicability. Overall, this is a well-built project with clear real-world potential—great work on the demo presentation!"

**When available:**
- After admin generates feedback
- Usually 1-2 hours after judging concludes
- Displayed on project detail page
- Email notification sent (optional)

---

## Project Analytics

### For Organizers

**Metrics tracked:**
- Projects created vs teams formed
- Submission rate (% of teams that submit)
- Technologies used (frequency)
- Category distribution
- Average project completeness
- Submission timing (when do teams submit?)

**Goals:**
- 70%+ submission rate
- Average 5+ technologies per project
- <10% submitted in last hour (procrastination)

---

## Best Practices

### For Teams

**Planning phase:**
- Agree on project idea day 1
- Create draft immediately
- Commit frequently to repo
- Test demo URL early

**During development:**
- Update description as features complete
- Add technologies as you use them
- Keep README updated
- Record demo video early (can redo)

**Before submission:**
- Test all links work
- Verify demo is accessible
- Check repo is public
- Proofread description
- Submit 1 hour before deadline (not last minute)

---

### For Organizers

**Submission window:**
- Open at event start
- Deadline 2-4 hours before event end
- Gives judges time to review
- Allows for late demos/videos

**Validation:**
- Automated repo URL checks
- Manual originality spot checks
- Review commit timestamps
- Flag suspicious projects

**Post-submission:**
- Generate AI summaries immediately
- Assign judges within 1 hour
- Begin judging promptly
- Generate feedback after all scores in

---

## Troubleshooting

### "Team already has a project"

**Cause:** One project per team per event

**Solution:** Edit existing project instead of creating new

---

### "Submission deadline passed"

**Cause:** After event submission deadline

**Solutions:**
- Request extension from organizers
- Save as draft for portfolio
- Cannot be judged this event

---

### AI Summary Not Generating

**Symptoms:** Project submitted but aiSummary is null after 5 minutes

**Causes:**
1. OpenAI API key invalid
2. OpenAI rate limit hit
3. Description too short or empty

**Debug:**
```javascript
// Check project
db.projects.findOne({ _id: projectId }, { aiSummary: 1, description: 1 });

// Check logs for errors
grep "generateProjectSummary" logs/app.log
```

**Workaround:** Admin can manually trigger regeneration

---

## Next Steps

- [Submit your first project](/docs/getting-started/first-event#project-submission)
- [Understand judging criteria](/docs/features/judging)
- [View results after judging](/docs/features/results)
- [Get AI-generated feedback](/docs/ai/feedback-synthesis)
