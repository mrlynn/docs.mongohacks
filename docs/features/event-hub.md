---
sidebar_position: 2
---

# Event Hub

The Event Hub is the participant's home base during a hackathon. It provides a personalized dashboard that answers the question: **"What do I do next?"**

## Overview

The Event Hub adapts to each participant's state and the event timeline, showing only relevant sections and actions.

**URL:** `/events/[eventId]/hub`

**Access:** Registered participants only (redirects to registration if not registered)

---

## Smart Next Steps

### Adaptive Guidance

The Hub calculates the participant's next milestone based on:
1. Current event phase (pre-event, hacking, judging, results)
2. Participant state (has team?, has project?, submitted?)
3. Upcoming deadlines

**Examples:**

| Timeline | Participant State | Next Step Shown |
|----------|-------------------|-----------------|
| Before start date | No team | "Join or create a team" |
| Before start date | Has team | "Prepare for hacking" |
| During hacking | No project | "Start building your project" |
| During hacking | Draft project | "Complete and submit your project" |
| Before deadline | Submitted | "Keep working on your project" |
| After deadline | Submitted | "Judging in progress" |
| After judging | - | "View your results" |

### Priority Indicators

```
🔴 High Priority: "Submit your project - 2 hours remaining!"
🟡 Medium Priority: "Join a team to start hacking"
🟢 Low Priority: "Check out event resources"
```

---

## Hub Sections

### 1. Hero Section

**Always visible**

**Displays:**
- Event name and dates
- Countdown timer (to start, deadline, or end)
- Current event phase with progress bar
- Participant status badges

**Phase progress:**
```
Registration ━━●━━━━ Hacking ━━━━━━ Judging ━━━━━━ Results
             20%              50%            75%         100%
```

**Status badges:**
- ✅ Registered
- 👥 Team: [Team Name]
- 📝 Project: [Submitted | Draft | Not Started]
- 🏆 Rank: #3 (after results published)

---

### 2. Next Steps Section

**Always visible**

**Smart milestone calculation:**

```typescript
function calculateNextMilestone(event, participant, team, project) {
  const now = new Date();
  
  // Pre-event
  if (now < event.startDate) {
    if (!team) return "Join or create a team";
    return "Prepare for hacking";
  }
  
  // During hacking
  if (now < event.submissionDeadline) {
    if (!project) return "Start building your project";
    if (project.status === "draft") return "Submit your project";
    return "Keep refining your project";
  }
  
  // Judging phase
  if (now < event.endDate) {
    return "Judging in progress";
  }
  
  // After event
  return "View your results";
}
```

**Visual display:**
```
┌──────────────────────────────────────────┐
│  🎯 Your Next Step                       │
│                                          │
│  Submit Your Project                     │
│  Deadline: 4 hours remaining             │
│                                          │
│  [Submit Now] button                     │
└──────────────────────────────────────────┘
```

---

### 3. Your Team Section

**Conditional:** Only shown if participant has joined a team

**Displays:**
- Team name and member count
- Team leader badge
- Member avatars and names
- Team description
- Communication links (Discord, Slack)
- Quick actions

**Layout:**
```
┌──────────────────────────────────────────┐
│  👥 Your Team: Data Wizards              │
│                                          │
│  👤 Alice (Leader)  👤 Bob  👤 Charlie   │
│                                          │
│  "We're building a RAG chatbot using     │
│   MongoDB Vector Search and GPT-4"       │
│                                          │
│  [💬 Team Chat] [📋 View Details]       │
│  [✏️ Manage Team]                        │
└──────────────────────────────────────────┘
```

**Quick actions:**
- **Share Team Link** - Copy invite link to clipboard
- **View Team Details** - Navigate to team page
- **Manage Team** (leader only) - Edit team, invite members
- **Leave Team** - With confirmation dialog

**Team leader controls:**
- Edit team name and description
- Remove members
- Transfer leadership
- Delete team (if no project)

---

### 4. Your Project Section

**Conditional:** Only shown if team has a project

**Displays:**
- Project name and category
- Status (Draft | Submitted | Under Review | Judged)
- Technologies used
- GitHub repo link
- Demo/video links
- Last modified timestamp
- Quick actions

**Layout:**
```
┌──────────────────────────────────────────┐
│  🚀 Your Project                         │
│                                          │
│  RAG Chatbot for MongoDB Docs            │
│  Status: Submitted ✅                    │
│                                          │
│  Tech: MongoDB, OpenAI, Next.js, Python  │
│                                          │
│  📂 GitHub  🌐 Demo  🎥 Video           │
│                                          │
│  Last updated: 2 hours ago               │
│                                          │
│  [✏️ Edit] [📝 Unsubmit] [🔗 Share]    │
└──────────────────────────────────────────┘
```

**Status indicators:**
- **Draft** 📝 - Not submitted yet (yellow)
- **Submitted** ✅ - Ready for judging (green)
- **Under Review** ⏳ - Being judged (blue)
- **Judged** 🏆 - Scoring complete (purple)

**Quick actions:**
- **Quick Edit** - Inline dialog for fast updates (67% faster than full edit page)
- **Unsubmit** - Change status back to draft (before deadline)
- **Share Project** - Copy link or native share API

---

### 5. Event Resources Section

**Always visible**

**Displays:**
- Event information (location, dates, format)
- Resource links (Discord, docs, starter code)
- Upcoming schedule items (next 3)
- Contact/support information

**Layout:**
```
┌──────────────────────────────────────────┐
│  📚 Event Resources                      │
│                                          │
│  📅 March 15-17, 2026 | 🌍 Virtual      │
│  👥 156 / 200 participants               │
│                                          │
│  🔗 Quick Links:                         │
│  • Discord Server                        │
│  • MongoDB Atlas Docs                    │
│  • Starter Templates                     │
│  • Vector Search Guide                   │
│                                          │
│  📆 Upcoming:                            │
│  • Workshop: Vector Search (2:00 PM)     │
│  • Mentor Office Hours (4:00 PM)         │
│  • Checkpoint Meeting (8:00 PM)          │
│                                          │
│  [📜 View Full Schedule]                 │
└──────────────────────────────────────────┘
```

**Resource types:**
- Documentation links
- Video tutorials
- Starter code repositories
- API keys/credentials
- Discord/Slack invites
- Mentor scheduling links

---

### 6. Browse Teams Section

**Conditional:** Only shown if participant has NOT joined a team

**Displays:**
- Recommended teams (AI-powered matching)
- Match scores (0-100%)
- Match reasons
- Team size and capacity
- Skills they're looking for
- Quick join button

**Layout:**
```
┌──────────────────────────────────────────┐
│  🔍 Recommended Teams for You            │
│                                          │
│  ┌────────────────────────────────┐     │
│  │ 🎯 AI Builders (Match: 87%)    │     │
│  │ 3/5 members                    │     │
│  │                                │     │
│  │ Looking for: Python, ML, APIs  │     │
│  │ ✓ Your skills match: Python,ML │     │
│  │ • They need: API Development   │     │
│  │                                │     │
│  │ [Join Team] button             │     │
│  └────────────────────────────────┘     │
│                                          │
│  (5 more teams...)                       │
│                                          │
│  [Browse All Teams]                      │
└──────────────────────────────────────────┘
```

**Team matching algorithm:**

**If vector search available:**
```typescript
// MongoDB Atlas Vector Search
db.teams.aggregate([{
  $vectorSearch: {
    index: "team_skills_vector",
    path: "desiredSkillsEmbedding",
    queryVector: participant.skillsEmbedding,  // 1536-dim
    numCandidates: 100,
    limit: 6
  }
}])
```

**Fallback (tag-overlap):**
```typescript
// Simple intersection
matchScore = (matching_skills / total_desired_skills) * 100

// Example:
participant.skills = ["Python", "MongoDB", "React"]
team.desiredSkills = ["Python", "MongoDB", "APIs"]
matching = ["Python", "MongoDB"]
score = (2 / 3) * 100 = 67%
```

**Match reasons displayed:**
- "Your skills match: Python, MongoDB"
- "They need: API Development, Docker"
- "Team size: 3/5 (2 spots available)"

**Quick join:**
- Click "Join Team" → instant join (no approval needed)
- Toast notification: "You joined AI Builders! 🎉"
- Section switches to "Your Team"

---

## Interactive Features

### Toast Notifications

**Global notification system** for instant feedback:

**Success (green):**
- "Project submitted successfully! 🎉"
- "You joined Data Wizards!"
- "Team link copied to clipboard"

**Info (blue):**
- "Draft saved automatically"
- "Your team link has been shared with 3 people"

**Warning (orange):**
- "Submission deadline in 1 hour!"
- "Your team is missing required fields"

**Error (red):**
- "Failed to join team (already full)"
- "Project submission failed (check repo URL)"

**Implementation:**
```tsx
const { showToast } = useToast();

showToast("Project submitted! 🎉", "success");
```

---

### Quick Edit Dialog

**Fast inline editing** without leaving the Hub:

**Opens when:** Click "Edit" on project card

**Fields available:**
- Project name
- Description
- Technologies (tags)
- Repository URL
- Demo URL

**Benefits:**
- 67% faster than navigating to full edit page
- Stay in context
- Auto-saves on submit
- Closes automatically

**UX pattern:**
```
Hub → Click Edit → Dialog Opens → Make Changes → Submit → Dialog Closes → Hub Updates
```

Time saved: 15 seconds → 5 seconds per edit

---

### Copy/Share Buttons

**One-click sharing** with native API support:

**Team invite link:**
```
Button: [📋 Copy Link]
Action: navigator.clipboard.writeText(teamInviteUrl)
Result: "Link copied!" toast
```

**Native share (mobile):**
```javascript
if (navigator.share) {
  navigator.share({
    title: "Join my hackathon team!",
    text: "We're building a RAG chatbot. Want to join?",
    url: teamInviteUrl
  });
} else {
  // Fallback to clipboard
}
```

**Metrics:**
- Copy action: <1 second
- Share dialog: Native OS picker (Instagram, WhatsApp, etc.)

---

## Technical Implementation

### Server Component (Data Fetching)

**File:** `/src/app/(app)/events/[eventId]/hub/page.tsx`

**What it does:**
- Fetches all hub data in one query (participant, team, project, event)
- Calculates next milestone server-side
- Gets recommended teams (vector search or tag-overlap)
- Serializes data for client

**Why server component:**
- Direct database access (no API call)
- Better SEO (pre-rendered HTML)
- Avoids authentication cookies in client fetch
- Faster initial load

**Data fetched:**
```typescript
{
  participant: { userId, skills, teamId, registeredEvents },
  event: { name, dates, status, capacity },
  team: { name, members, leaderId, description } | null,
  project: { name, status, technologies, links } | null,
  recommendedTeams: [...] | [],
  nextMilestone: { title, description, action, deadline }
}
```

---

### Client Component (Interactivity)

**File:** `/src/app/(app)/events/[eventId]/hub/EventHubContent.tsx`

**What it does:**
- Renders all sections conditionally
- Handles user actions (join team, edit project)
- Manages toast notifications
- Optimistic updates

**Conditional rendering:**
```tsx
{team && <YourTeamSection team={team} />}
{project && <YourProjectSection project={project} />}
{!team && <BrowseTeamsSection teams={recommendedTeams} />}
```

**Optimistic updates:**
```tsx
// Join team
const handleJoinTeam = async (teamId) => {
  // Update UI immediately
  setTeam(optimisticTeam);
  
  // Call API
  const result = await fetch('/api/teams/join', { ... });
  
  // Rollback on error
  if (!result.ok) setTeam(null);
};
```

---

### Individual Section Components

**Location:** `/src/app/(app)/events/[eventId]/hub/sections/`

**Components:**
- `HeroSection.tsx` - Event header, countdown, phase
- `NextStepsSection.tsx` - Smart milestone guidance
- `YourTeamSection.tsx` - Team info and actions
- `YourProjectSection.tsx` - Project status and quick edit
- `EventResourcesSection.tsx` - Links and schedule
- `BrowseTeamsSection.tsx` - Team recommendations

**Props pattern:**
```tsx
interface YourTeamSectionProps {
  team: Team;
  participant: Participant;
  eventId: string;
  isLeader: boolean;
}
```

---

## Mobile Experience

### Responsive Design

**Breakpoints:**
- Mobile: < 600px
- Tablet: 600-960px
- Desktop: > 960px

**Mobile optimizations:**
- Single-column layout
- Larger touch targets (48px minimum)
- Simplified navigation
- Bottom-sheet dialogs
- Native share API

**Example (Mobile):**
```
┌─────────────────────┐
│  Event Name         │
│  ⏰ 23:45:12        │
│  [━━━━50%━━━━]     │
├─────────────────────┤
│  🎯 Next Step       │
│  Submit Project     │
│  [Submit] button    │
├─────────────────────┤
│  👥 Your Team       │
│  Data Wizards (3)   │
│  [View] button      │
├─────────────────────┤
│  🚀 Your Project    │
│  RAG Chatbot        │
│  Status: Draft      │
│  [Edit] button      │
└─────────────────────┘
```

**Touch gestures:**
- Swipe up: Scroll sections
- Pull-to-refresh: Reload hub data
- Long-press: Copy links

---

## Performance

### Loading Strategy

**Server-side:**
- All data fetched in parallel
- One MongoDB query per collection (participant, event, team, project)
- Vector search cached for 5 minutes

**Client-side:**
- Sections render immediately (no loading spinners for initial load)
- Suspense boundaries for slower sections
- Skeleton screens for dynamic content

**Metrics:**
- Time to first byte: <100ms
- First contentful paint: <500ms
- Time to interactive: <1000ms

### Caching

**Server component cache:**
```typescript
// Revalidate every 60 seconds
export const revalidate = 60;
```

**Client-side cache:**
- React Query for API calls
- SWR for real-time updates
- LocalStorage for preferences

---

## Analytics

### Tracked Events

**Page views:**
- Event Hub visited
- Section expanded/collapsed
- Resource link clicked

**Actions:**
- Team joined
- Project created/edited/submitted
- Link shared
- Quick edit used

**Engagement metrics:**
- Time spent on hub
- Sections viewed
- Actions completed
- Return visits

**Implementation:**
```typescript
// Google Analytics
gtag('event', 'hub_action', {
  action_type: 'join_team',
  team_id: teamId,
  event_id: eventId
});
```

---

## Best Practices

### For Participants

**First visit:**
1. Read next steps section
2. Browse recommended teams
3. Join team or create one
4. Check event resources

**During event:**
1. Create project early (even as draft)
2. Update frequently (auto-save helps)
3. Submit before deadline
4. Share team link to recruit members

**Mobile tips:**
- Add hub to home screen (PWA)
- Enable notifications for deadlines
- Use native share for team invites

### For Organizers

**Pre-event:**
- Fill out resources section completely
- Test team recommendations
- Verify countdown accuracy

**During event:**
- Monitor hub analytics
- Update schedule in real-time
- Add timely resources (workshop links)

**Post-event:**
- Keep hub accessible (read-only)
- Archive data for future reference

---

## Troubleshooting

### Teams Not Showing

**Problem:** "No recommended teams" despite many teams existing

**Causes:**
1. Vector search indexes missing
2. No teams with `lookingForMembers: true`
3. Participant has no skills set

**Solutions:**
1. Create Atlas Vector Search indexes (see [Vector Search Setup](/docs/ai/vector-search))
2. Tell teams to toggle "Looking for members"
3. Ask participant to add skills in profile

---

### Next Steps Not Updating

**Problem:** Still says "Submit project" after submitting

**Causes:**
1. Cache not invalidated
2. Project status not updated
3. Page needs refresh

**Solutions:**
```typescript
// Force refresh
router.refresh();

// Or clear cache
revalidatePath(`/events/${eventId}/hub`);
```

---

### Quick Edit Not Saving

**Problem:** Changes in quick edit dialog don't persist

**Causes:**
1. API error (check network tab)
2. Validation failure
3. Optimistic update not reverted on error

**Debug:**
```typescript
// Check API response
const response = await fetch('/api/projects/update', { ... });
console.log(await response.json());
```

---

## Next Steps

- [Team features in detail](/docs/features/teams)
- [Project submission guide](/docs/features/projects)
- [AI team matching](/docs/ai/team-matching)
- [Customizing the hub](/docs/admin/events)
