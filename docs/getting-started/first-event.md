---
sidebar_position: 3
---

# Create Your First Event

Step-by-step tutorial to create and run your first hackathon event from scratch.

**Time:** 15-20 minutes  
**Prerequisites:** Platform installed and configured

---

## Overview

By the end of this tutorial, you'll have:
- ✅ A fully configured hackathon event
- ✅ Custom landing page with branding
- ✅ Registration form ready for participants
- ✅ Event Hub configured
- ✅ Judging system set up
- ✅ AI features enabled

---

## Step 1: Create Admin Account

If you haven't already, create your admin account:

```bash
# Option A: Use seed script
npm run db:seed

# Option B: Manual registration
# 1. Start the app: npm run dev
# 2. Go to http://localhost:3000/register
# 3. Register with your email
# 4. Update user role in MongoDB:
```

**MongoDB Shell:**
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

**Login:** http://localhost:3000/login

---

## Step 2: Create Event

### Navigate to Admin Panel

**URL:** http://localhost:3000/admin/events

Click **"Create New Event"**

### Basic Information

```yaml
Event Name: MongoHacks Spring 2026
Slug: mongohacks-spring-2026  # URL-friendly (auto-generated)
Description: |
  Build innovative applications using MongoDB Atlas, 
  Vector Search, and AI in 48 hours.

Status: Draft  # Keep as draft until ready to launch

Event Type: Virtual  # or Hybrid, In-Person

Dates:
  Start Date: 2026-03-15 10:00 AM
  End Date: 2026-03-17 6:00 PM
  Submission Deadline: 2026-03-17 4:00 PM

Location:
  Country: United States
  City: Virtual
  Venue: Online

Capacity:
  Max Participants: 200
  Max Teams: 50
  Team Size: 1-5 people
```

**Click "Save Draft"**

---

## Step 3: Configure Registration Form

### Go to Registration Settings

**Path:** Admin → Events → [Your Event] → Registration

### Tier 1: Basic Information

Enable these fields:
- [x] Name (required)
- [x] Email (required)
- [x] Experience Level (optional)
- [x] Skills (required, multi-select)

**Skill options:**
```
JavaScript, Python, Java, C++, Go, Rust
React, Vue, Angular, Next.js
Node.js, Express, FastAPI, Django
MongoDB, PostgreSQL, MySQL
AI/ML, Vector Search, RAG
Docker, Kubernetes, AWS, Azure
```

### Tier 2: Advanced (Optional)

- [ ] GitHub Username
- [ ] LinkedIn Profile
- [ ] Portfolio URL
- [ ] Bio (200 chars)

### Custom Questions

Add event-specific questions:

**Example:**
```yaml
Question 1:
  Label: "Have you worked with MongoDB before?"
  Type: select
  Options: ["Yes - extensively", "Yes - a little", "No - first time"]
  Required: true

Question 2:
  Label: "What do you want to build?"
  Type: text
  Placeholder: "Brief description of your idea..."
  Required: false
```

**Save Configuration**

---

## Step 4: Build Landing Page

### Navigate to Landing Page Builder

**Path:** Admin → Events → [Your Event] → Landing Page

### Hero Section

```yaml
Background Image: 
  Upload: hero-background.jpg  # 1920x1080 recommended
  Or URL: https://cdn.example.com/hero.jpg

Primary Color: #00684A  # Forest Green
Accent Color: #00ED64   # Spring Green

Hero Title: "MongoHacks Spring 2026"
Hero Subtitle: "Build the Future with MongoDB Atlas & AI"

CTA Button:
  Text: "Register Now"
  Style: "primary"  # or "outlined"
```

### About Section

```markdown
## About This Hackathon

Join 200 developers for 48 hours of innovation! Build groundbreaking 
applications using:

- **MongoDB Atlas** - Cloud database with Vector Search
- **OpenAI GPT-4** - Cutting-edge AI integration  
- **Next.js 15** - Modern web framework
- **$10,000 in prizes** - Awarded across 5 categories

### What You'll Build

- AI-powered chatbots with RAG (Retrieval-Augmented Generation)
- Real-time collaborative tools
- Data visualization dashboards
- Mobile-first applications
- Developer tools and APIs

### Who Should Join

All skill levels welcome! Whether you're a beginner or expert, 
you'll find challenges and learning opportunities.
```

### Schedule Section

```yaml
Friday, March 15:
  - 10:00 AM: Opening Ceremony & Kickoff
  - 11:00 AM: Team Formation
  - 12:00 PM: Hacking Begins
  - 6:00 PM: Workshop: MongoDB Atlas Basics

Saturday, March 16:
  - 9:00 AM: Breakfast & Networking
  - 12:00 PM: Workshop: Vector Search & AI
  - 3:00 PM: Mentor Office Hours
  - 8:00 PM: Checkpoint & Snack Break

Sunday, March 17:
  - 9:00 AM: Final Push Begins
  - 4:00 PM: Submissions Due (HARD DEADLINE)
  - 5:00 PM: Project Demos Begin
  - 6:00 PM: Awards Ceremony
```

### Prizes Section

```yaml
1st Place: $5,000 + MongoDB Swag
  Criteria: Overall best project

2nd Place: $2,500 + MongoDB Swag
  Criteria: Runner-up

3rd Place: $1,000 + MongoDB Swag
  Criteria: Third place

Best Use of Vector Search: $1,000
  Criteria: Most creative use of Atlas Vector Search

Best AI Integration: $500
  Criteria: Best implementation of AI/ML features
```

### FAQ Section

```yaml
Q: Do I need a team?
A: No! You can participate solo or form a team up to 5 people.

Q: Is there a cost?
A: No, the event is completely free!

Q: What do I need to bring?
A: Just your laptop and enthusiasm! We'll provide everything else.

Q: Can I start working before the hackathon?
A: No, all code must be written during the event period.

Q: What if I'm a beginner?
A: Perfect! We have workshops and mentors to help you learn.
```

**Publish Landing Page** (toggle switch at top)

**Preview:** `http://localhost:3000/events/mongohacks-spring-2026`

---

## Step 5: Set Up Partners & Prizes

### Add Partners

**Path:** Admin → Partners → Create Partner

```yaml
Name: MongoDB
Logo: mongodb-logo.svg
Tier: Platinum
Description: "Cloud database for modern applications"
Website: https://mongodb.com

Contact:
  Name: John Doe
  Email: partnerships@mongodb.com
  Phone: +1-555-0100
```

**Repeat for other sponsors**

### Link Prizes to Partners

**Path:** Admin → Events → [Event] → Prizes

```yaml
Prize 1:
  Name: "Best Use of MongoDB Atlas"
  Value: $2,000
  Category: "Technical Excellence"
  Partner: MongoDB
  Description: "Awarded to the team that best leverages MongoDB Atlas features"
  Display Order: 1
  Active: Yes
```

---

## Step 6: Configure Event Hub

The Event Hub is automatically configured based on your event settings, but you can customize it:

### Resources

Add useful links for participants:

**Path:** Admin → Events → [Event] → Settings

```yaml
Resources:
  - Name: "MongoDB Atlas Docs"
    URL: https://docs.atlas.mongodb.com
    Icon: book
  
  - Name: "Discord Server"
    URL: https://discord.gg/your-server
    Icon: discord
  
  - Name: "Starter Templates"
    URL: https://github.com/mongodb/hackathon-starters
    Icon: github

  - Name: "Vector Search Guide"
    URL: https://mongodb.com/docs/atlas/atlas-vector-search
    Icon: search
```

### Milestones

Event Hub shows smart next steps based on timeline. These are auto-calculated but you can customize:

```typescript
// Pre-event: "Join or create a team"
// During event: "Start building your project"
// Before deadline: "Submit your project"  
// After submission: "Judging in progress"
// After judging: "View results"
```

---

## Step 7: Set Up Judging

### Create Judging Criteria

**Path:** Admin → Events → [Event] → Judging

The platform uses a standard 4-criteria rubric (1-10 scale each):

1. **Innovation** - How novel and creative is the solution?
2. **Technical Complexity** - How sophisticated is the implementation?
3. **Impact** - How valuable is the solution to users?
4. **Presentation** - How well is the project documented and demoed?

**Total Score:** 40 points maximum

### Add Judges

**Path:** Admin → Judges → Add Judge

```yaml
Name: Jane Smith
Email: jane@example.com
Role: judge  # Set automatically
Expertise: ["AI/ML", "MongoDB", "Full Stack"]
```

**Important:** Judges must create an account first, then you upgrade their role.

### Assign Judges to Projects

**After projects are submitted:**

1. Go to Admin → Events → [Event] → Judging
2. Select judges (checkboxes)
3. Select projects to assign
4. Click "Assign Selected"

**Best practice:** Assign 3-5 judges per project for balanced scoring

---

## Step 8: Enable AI Features

### OpenAI Configuration

Verify AI features are enabled:

```bash
# .env.local
OPENAI_API_KEY=sk-...
ENABLE_AI_FEATURES=true
ENABLE_VECTOR_SEARCH=true
```

### Create Vector Search Indexes

**Required for team matching:**

See detailed guide: [Vector Search Setup](/docs/ai/vector-search)

**Quick setup:**
```bash
# 1. MongoDB Atlas UI → Search → Create Index
# 2. Select "mongohacks.participants" collection
# 3. Use JSON editor:
```

```json
{
  "name": "participant_skills_vector",
  "type": "vectorSearch",
  "fields": [{
    "type": "vector",
    "path": "skillsEmbedding",
    "numDimensions": 1536,
    "similarity": "cosine"
  }]
}
```

**Repeat for `teams` collection** with `team_skills_vector` index on `desiredSkillsEmbedding`

### Test AI Features

1. **Project Summaries:**
   - Submit a test project
   - Check `project.aiSummary` field populated within 30s

2. **Team Matching:**
   - Register a test participant with skills
   - Create a team with desired skills
   - Check Event Hub shows recommended teams

3. **Feedback Synthesis:**
   - Score a project as multiple judges
   - Admin → Results → "Generate All Feedback"
   - Check teams can see feedback

---

## Step 9: Launch Event

### Pre-Launch Checklist

- [ ] Landing page published and tested
- [ ] Registration form configured
- [ ] Admin account created
- [ ] At least one judge account created
- [ ] Partners and prizes added
- [ ] Resources linked in Event Hub
- [ ] AI features tested (optional but recommended)
- [ ] Slack/Discord server ready
- [ ] Email notifications configured (optional)

### Change Event Status

**Path:** Admin → Events → [Event] → Edit

```yaml
Status: Open  # Change from "Draft"
```

**This enables:**
- Public landing page visibility
- Registration form access
- Event appears in event list

### Share Event URL

```
Landing Page: https://yoursite.com/events/mongohacks-spring-2026
Direct Registration: https://yoursite.com/events/[eventId]/register
```

**Promote on:**
- Twitter/X
- LinkedIn
- Discord communities
- University mailing lists
- Hackathon directories (Devpost, MLH)

---

## Step 10: During the Event

### Monitor Progress

**Admin Dashboard:** http://localhost:3000/admin/events/[eventId]

**Key metrics:**
- Registrations: X / 200
- Teams formed: Y / 50
- Projects submitted: Z
- Completion rate: N%

### Participant Experience

**Registration Flow:**
1. User visits landing page
2. Clicks "Register Now"
3. Fills form (name, email, skills)
4. Auto-logs in
5. Redirected to Event Hub

**Event Hub Flow:**
1. See event countdown and current phase
2. Browse recommended teams (AI-powered)
3. Join team or create new one
4. Submit project before deadline
5. View results after judging

### Team Formation

**Best practices:**
- First 2-4 hours: Active team formation
- Encourage mingling in Discord
- Host icebreaker session
- Share skill distribution stats

### Project Submission

**Before deadline:**
- Send reminders at 24h, 6h, 1h before
- Monitor submission rate
- Help teams with technical issues

**At deadline:**
- System auto-submits drafts (future feature)
- No new submissions accepted
- Generate AI summaries for all projects

---

## Step 11: Judging

### Assign Judges

**Path:** Admin → Events → [Event] → Judging

1. Select all judges
2. Select all submitted projects
3. Click "Assign Selected" (batch assignment)

**Or individual assignment:**
- Assign specific judges to specific projects
- Useful for expertise matching

### Judge Experience

**Judges go to:** `/judging/[eventId]`

1. See all assigned projects as cards
2. Click project → view details + AI summary
3. Score on 4 criteria with sliders (1-10 each)
4. Add optional comments
5. Submit scores
6. Progress bar shows "X of Y scored"

**Expected time:** 5-10 minutes per project

### Monitor Judging Progress

**Admin view shows:**
- Total assignments: 45
- Completed: 33 (73%)
- Pending: 12 (27%)
- Per-judge breakdown

**Send reminders to judges with pending work**

---

## Step 12: Results

### Generate AI Feedback

**After all judging complete:**

1. Admin → Events → [Event] → Results
2. Click "Generate All Feedback"
3. Wait ~30 seconds for batch processing
4. Verify feedback generated for all projects

**AI synthesizes:**
- Average scores across judges
- Written comments into paragraphs
- Strengths and improvement areas
- Encouraging closing statement

### Review Results

**Admin Results Page:**
- Full leaderboard (ranked by total score)
- Podium display (top 3)
- Individual score breakdowns
- Judge comments
- AI feedback preview

**Verify:**
- No scoring errors
- No tied scores (if important)
- Fair distribution
- Outliers explained

### Publish Results

**Toggle switch:** "Results Visibility"

**Options:**
- **Hidden:** Only admins see results
- **Published:** Results visible to all participants

**When published:**
- Public results page goes live
- Participants get notification (future)
- Teams see their feedback
- Rankings displayed with scores

---

## Step 13: Post-Event

### Announce Winners

**Format:**
```
🏆 MongoHacks Spring 2026 Results 🏆

🥇 1st Place: Team Data Wizards - RAG Chatbot (38.5/40)
🥈 2nd Place: Team Alpha - Mobile App (36.2/40)
🥉 3rd Place: Team Beta - Data Viz Dashboard (35.8/40)

🎯 Best Use of Vector Search: Team Delta
🤖 Best AI Integration: Team Gamma

Full results: [link]
```

### Gather Feedback

**Post-event survey:**
- What did you enjoy most?
- What could be improved?
- Would you participate again?
- Rate your experience (1-5)

**Track metrics:**
- Registration to participation rate
- Team formation success rate
- Project submission rate
- Participant satisfaction (NPS)

### Archive Event

**Path:** Admin → Events → [Event] → Settings

```yaml
Status: Concluded  # Locks event for editing
Archive: Yes  # Moves to archived events list
```

**Archived events:**
- Read-only for participants
- Results remain public
- Data preserved for analytics
- Can be cloned for future events

---

## Common Issues & Solutions

### Low Registration

**Problem:** Only 20 registrations in first week

**Solutions:**
- Post in more communities
- Offer early-bird swag
- Partner with universities
- Create teaser content
- Run ads (Twitter, LinkedIn)

### Team Formation Struggles

**Problem:** Many solo participants, few teams

**Solutions:**
- Host virtual mixer session
- Create team-building channel
- Share participant skill distribution
- AI matching (enabled by default)
- Allow team formation after kickoff

### Low Submission Rate

**Problem:** 100 registrations, only 15 projects submitted

**Solutions:**
- Send deadline reminders
- Extend deadline by 2 hours
- Simplify submission form
- Offer submission help desk
- Allow draft submissions

### Judging Delays

**Problem:** Only 50% of scores submitted 24h after deadline

**Solutions:**
- Send reminder emails
- Reduce projects per judge
- Extend judging window
- Have backup judges
- Use admin override for missing scores

---

## Next Steps

**Your first event is live! 🎉**

Now learn about:
- [Event Hub features](/docs/features/event-hub)
- [Advanced judging setup](/docs/features/judging)
- [AI feature optimization](/docs/ai/overview)
- [Analytics and insights](/docs/admin/analytics)
- [Scaling for larger events](/docs/development/deployment)

---

## Quick Reference

**Admin URLs:**
- Dashboard: `/admin`
- Events: `/admin/events`
- Judges: `/admin/judges`
- Analytics: `/admin/analytics`

**Participant URLs:**
- Landing: `/events/[slug]`
- Register: `/events/[eventId]/register`
- Event Hub: `/events/[eventId]/hub`
- Results: `/events/[eventId]/results`

**Judge URLs:**
- Dashboard: `/judging/[eventId]`
- Score Project: `/judging/[eventId]/[projectId]`

**Timing:**
- Setup: 15-20 minutes
- Registration period: 2-4 weeks
- Event duration: 24-72 hours
- Judging period: 24-48 hours
- Results publication: Immediate after judging
