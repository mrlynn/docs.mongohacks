---
sidebar_position: 3
---

# Project Suggestions Wizard

AI-powered project idea generation that helps hackathon participants brainstorm personalized project ideas based on their skills, preferences, and event context.

## Overview

The Project Suggestions Wizard is a multi-step interface that collects information about your team, technology preferences, and goals, then uses OpenAI GPT-4o to generate tailored hackathon project ideas.

**How it works:**
1. Select your event and describe your team composition
2. Choose preferred languages, frameworks, and databases
3. Select sponsor products you'd like to incorporate
4. Set constraints like time commitment and complexity
5. AI generates 3 unique project ideas with full implementation details

**Why use it:**
- Overcomes the "blank page" problem at hackathon kickoff
- Tailors suggestions to your team's actual skill levels
- Maximizes prize eligibility by incorporating sponsor products
- Provides realistic timelines based on your time commitment
- Includes implementation guides to help you get started fast

---

## Accessing the Wizard

**From the Dashboard:**
A "Need project ideas?" card appears on the main dashboard, linking directly to the wizard.

**From the New Project Page:**
When creating a new project for an event, a banner at the top offers AI-powered project suggestions.

**Direct URL:** `/project-suggestions`

**Requirements:**
- Must be logged in
- At least one event must exist in the platform

---

## Wizard Steps

### Step 1: Event & Team

Configure your event context and team details.

**Fields:**

| Field | Options | Description |
|-------|---------|-------------|
| Event | Dropdown (auto-selects registered event) | The hackathon event to generate ideas for |
| Team Size | Solo / 2-5 people / 5+ people | Number of team members |
| Skill Levels | Beginner, Intermediate, Advanced (multi-select) | Skill levels represented on the team |
| Team Composition | Frontend, Backend, Full-stack, Design, Data Science, DevOps (multi-select) | Specializations on the team |

**Tips:**
- If you're registered for an event, it auto-selects and shows a "Registered" badge
- The event's theme and categories are sent to the AI for context-aware suggestions
- Be honest about skill levels — the AI adjusts complexity accordingly

---

### Step 2: Technology Preferences

Select the technologies your team wants to work with.

**Available options:**

**Programming Languages:**
JavaScript, TypeScript, Python, Java, Go, Rust, C++

**Frameworks:**
React, Next.js, Vue, Angular, Flask, Django, Express, Spring Boot

**Databases:**
MongoDB Atlas, PostgreSQL, Redis, MySQL, Supabase, Firebase

**Tips:**
- Select technologies your team already knows for faster development
- Don't select everything — focus on what you'd actually enjoy building with
- MongoDB Atlas is recommended as it integrates with the platform's other AI features

---

### Step 3: Sponsor Products

Choose sponsor technologies to incorporate into your project.

**Available sponsors:**
MongoDB Atlas, Twilio, OpenAI, Stripe, Auth0, Vercel

**Why this matters:**
- Many hackathons offer **sponsor-specific prize categories**
- Using sponsor products increases eligibility for additional awards
- The AI generates ideas that naturally incorporate your selected sponsors

---

### Step 4: Constraints & Goals

Define your practical constraints and interests.

**Fields:**

| Field | Options | Description |
|-------|---------|-------------|
| Time Commitment | 12 hours / 24 hours / 48 hours | How long you plan to hack |
| Complexity | Simple MVP / Moderate features / Ambitious project | Desired project scope |
| Interest Areas | Free text (comma-separated) | Domains like Healthcare, Education, Climate |
| Target Prize Categories | Free text | Specific prizes you're aiming for |

**Tips:**
- Be realistic about time — the AI scales project scope accordingly
- Interest areas strongly influence the problem domain of suggestions
- Mentioning specific prize categories helps the AI align ideas with judging criteria

---

## Generated Results

After completing the wizard, the AI generates **3 unique project ideas**. Each idea includes:

### Idea Structure

```typescript
{
  name: string;              // 3-5 word project name
  tagline: string;           // One-sentence pitch
  problemStatement: string;  // 2-3 sentence problem description
  solution: string;          // 3-4 sentence solution overview
  techStack: {
    frontend: string[];      // UI frameworks and libraries
    backend: string[];       // Server-side technologies
    database: string[];      // Data storage solutions
    apis: string[];          // Sponsor products and third-party APIs
    deployment: string[];    // Hosting and deployment tools
  };
  timeline: [{
    phase: string;           // e.g., "Setup & Planning"
    hours: string;           // e.g., "1-4"
    tasks: string[];         // Specific tasks for this phase
  }];
  difficulty: number;        // 1-5 scale
  prizeCategories: string[]; // Suggested prize categories
  differentiator: string;    // What makes this idea unique
  implementationGuide: string; // Markdown setup tips
}
```

### Navigating Results

- Use **chip tabs** to switch between the 3 generated ideas
- Each idea shows the full tech stack breakdown, timeline, and difficulty rating
- Expand the **implementation guide** section for setup tips and gotchas

---

## Actions on Generated Ideas

### Save Ideas

Save ideas you like for later reference. Saved ideas appear at `/project-suggestions/saved`.

### Refine Ideas

Not quite right? Use the **Refine** feature to adjust an idea with natural language instructions:
- "Make it simpler"
- "Add more AI features"
- "Focus on mobile"
- "Use a different database"

The AI regenerates the idea with your adjustments applied. The refined version is saved as a new idea linked to the original.

### Share Ideas

Generate a **shareable link** for any idea. Share it with teammates to discuss before committing. Shared ideas are accessible at `/project-suggestions/shared/[id]`.

### Team Voting

Team members can **vote** (up/down) on shared ideas with optional comments, helping teams reach consensus on which project to build.

---

## Rate Limits

To manage AI costs, each user is limited to **5 generations per event**. Each generation produces 3 ideas, so you can generate up to **15 total ideas** per event.

The remaining generation count is displayed in the wizard interface.

---

## AI Model Details

### Configuration

| Parameter | Value |
|-----------|-------|
| Model | GPT-4o |
| Temperature | 0.8 (creative but coherent) |
| Max Tokens | 6,000 (~2,000 per idea) |
| Response Format | Structured JSON |

### Prompt Engineering

The AI prompt includes full context from all wizard steps:
- Event theme and prize categories
- Team size, skill levels, and composition
- All technology preferences
- Selected sponsor products
- Time commitment and complexity preference
- Interest areas and target prizes

This context-rich approach ensures suggestions are practical and relevant rather than generic.

---

## Cost Analysis

### Per Generation

| Component | Cost |
|-----------|------|
| GPT-4o input tokens (~1,500) | ~$0.004 |
| GPT-4o output tokens (~4,000) | ~$0.04 |
| **Per generation (3 ideas)** | **~$0.05** |

### Per Event (100 participants)

| Scenario | Generations | Cost |
|----------|-------------|------|
| Conservative (50% use, avg 2 generations) | 100 | ~$5 |
| Heavy (80% use, avg 4 generations) | 320 | ~$16 |

**Compared to value:**
- Saves teams 30-60 minutes of brainstorming
- Higher quality project submissions
- Better sponsor product integration
- **ROI: Very high for minimal cost**

---

## Database Model

Generated ideas are stored in the `projectideas` collection:

```typescript
{
  userId: ObjectId;           // Who generated this idea
  eventId: ObjectId;          // Which event it's for
  inputs: {                   // All wizard inputs (for regeneration)
    teamSize: number;
    skillLevels: string[];
    teamComposition: string[];
    preferredLanguages: string[];
    preferredFrameworks: string[];
    preferredDatabases: string[];
    sponsorProducts: string[];
    interestAreas: string[];
    timeCommitment: number;
    complexityPreference: 'simple' | 'moderate' | 'ambitious';
    targetPrizes: string[];
  };
  idea: { /* full idea object */ };
  saved: boolean;
  shared: boolean;
  teamVotes: [{
    userId: ObjectId;
    vote: 'up' | 'down';
    comment?: string;
    createdAt: Date;
  }];
  generatedAt: Date;
  model: string;              // e.g., "gpt-4o"
  tokensUsed: number;
}
```

**Indexes:**
- `{ userId: 1, eventId: 1 }` — user's ideas per event
- `{ eventId: 1, saved: 1 }` — saved ideas per event
- `{ 'inputs.preferredLanguages': 1 }` — language-based queries

---

## API Endpoints

### Generate Ideas

```
POST /api/project-suggestions/generate
```

**Request body:** All wizard inputs (team size, preferences, constraints, etc.)

**Response:**
```json
{
  "ideas": [{ /* idea 1 */ }, { /* idea 2 */ }, { /* idea 3 */ }],
  "tokensUsed": 5200,
  "remainingGenerations": 4
}
```

### Save/Unsave Idea

```
POST   /api/project-suggestions/[id]/save    // Save
DELETE /api/project-suggestions/[id]/save    // Unsave
```

### Refine Idea

```
POST /api/project-suggestions/[id]/refine
```

**Request body:**
```json
{
  "instructions": "Make it simpler and focus on mobile"
}
```

### Share Idea

```
POST /api/project-suggestions/[id]/share
```

**Response:**
```json
{
  "shareUrl": "/project-suggestions/shared/abc123"
}
```

### Vote on Idea

```
POST /api/project-suggestions/[id]/vote
```

**Request body:**
```json
{
  "vote": "up",
  "comment": "Love this idea, let's go with it!"
}
```

### List Saved Ideas

```
GET /api/project-suggestions/saved
```

Returns up to 50 saved ideas sorted by date.

### List Events

```
GET /api/project-suggestions/events
```

Returns available events with registration status.

---

## Troubleshooting

### Ideas Not Generating

**Symptom:** Wizard completes but no ideas appear, or an error is shown.

**Possible causes:**
1. Invalid OpenAI API key
2. Rate limit exceeded (5 generations per event)
3. OpenAI API timeout
4. Insufficient OpenAI account balance

**Debug steps:**
```bash
# Check API key is set
echo $OPENAI_API_KEY

# Test OpenAI connectivity
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check application logs
grep "project-suggestion" logs/app.log | tail -10
```

**Solutions:**
- Verify `OPENAI_API_KEY` in `.env.local`
- Check OpenAI usage limits and billing
- Try again — transient API errors resolve on retry

---

### Low Quality Suggestions

**Symptom:** Ideas feel generic or don't match your preferences.

**Causes:**
- Too few preferences selected (AI has limited context)
- Interest areas too vague
- No sponsor products selected

**Solutions:**
1. Select more specific technology preferences
2. Use descriptive interest areas (e.g., "healthcare for elderly" vs. "health")
3. Specify target prize categories
4. Use the **Refine** feature to steer the idea in a better direction

---

### Saved Ideas Not Appearing

**Symptom:** Saved an idea but it's not on the saved page.

**Debug:**
```javascript
// Check if idea is marked as saved
db.projectideas.findOne({ _id: ideaId }, { saved: 1 });
// Should show { saved: true }
```

**Solutions:**
- Refresh the saved ideas page
- Verify you're logged in as the same user who saved it
- Check browser console for API errors

---

### Rate Limit Reached

**Symptom:** "You've reached the maximum number of generations for this event"

**Solutions:**
- Use the **Refine** feature on existing ideas (doesn't count against the limit)
- Try generating ideas for a different event
- Contact an event organizer if you need additional generations

---

## Next Steps

- [Learn about other AI features](/docs/ai/overview)
- [Set up your project after choosing an idea](/docs/features/projects)
- [Find teammates with AI matching](/docs/ai/team-matching)
- [Configure OpenAI API key](/docs/getting-started/configuration#openai-api-key)
