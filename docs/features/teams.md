---
sidebar_position: 4
---

# Teams

Team formation, management, and collaboration features for hackathon participants.

## Overview

Teams are the core social unit in MongoHacks. Participants can:
- Browse and join existing teams
- Create new teams and recruit members
- Manage team composition and details
- Collaborate on project submissions

**Team size:** 1-5 members (configurable per event)

---

## Team Formation Flow

### Option 1: Join Existing Team

**From Event Hub:**
1. View "Recommended Teams" section (AI-powered matching)
2. Click "Join Team" on a team card
3. Instant join (no approval required)
4. Hub updates to show "Your Team" section

**From Browse Teams Page:**
1. Navigate to Teams tab
2. Filter by category, skills, or search
3. Click team to view details
4. Click "Join Team"

**Team card shows:**
- Team name and member count (3/5)
- Skills they're looking for
- Match score (if AI matching enabled)
- Quick join button

---

### Option 2: Create New Team

**From Event Hub:**
1. Click "Create Team" button
2. Fill team creation form
3. Submit and become team leader
4. Share invite link with others

**Required fields:**
- Team name (unique per event)
- Description (what you're building)

**Optional fields:**
- Desired skills (for matching)
- Category (AI/ML, Web Dev, Mobile, etc.)
- Looking for members (toggle)
- Capacity (1-5, default 5)

---

## Team Management

### Team Leader Powers

As team leader, you can:
- Edit team name and description
- Add/remove members
- Transfer leadership to another member
- Delete team (if no project submitted)
- Toggle "looking for members" status

**Transfer leadership:**
1. Go to Team Details
2. Click "Manage Team"
3. Select new leader from dropdown
4. Confirm transfer

**Remove member:**
1. Go to Manage Team
2. Click "Remove" next to member name
3. Confirm removal

**Note:** Cannot remove leader (transfer leadership first)

---

### Team Member Actions

All team members can:
- View team details
- Share team invite link
- Create team project
- Edit team project
- Leave team (if project not submitted)

**Leave team:**
1. Go to Team Details
2. Click "Leave Team" button
3. Confirm (warning: can't undo)

**Restrictions:**
- Cannot leave after project submitted
- Cannot leave if you're the leader (transfer first)

---

## Team Discovery

### AI-Powered Matching

**How it works:**
1. You register with skills (e.g., "Python", "MongoDB", "React")
2. OpenAI generates embedding (1536-dim vector)
3. Teams specify desired skills
4. Atlas Vector Search finds semantic matches
5. Results ranked by similarity (0-100%)

**Match score breakdown:**
```
87% match = High compatibility
65% match = Good compatibility  
40% match = Some overlap
<30% match = Low compatibility
```

**Match reasons displayed:**
- "✓ Your skills match: Python, MongoDB"
- "• They need: APIs, Docker"
- "Team size: 3/5 (2 spots available)"

**Fallback:** If vector search unavailable, uses simple tag-overlap matching.

---

### Browse & Filter

**Filters available:**
- Looking for members (yes/no)
- Category (AI/ML, Web, Mobile, etc.)
- Skills needed
- Team size (spots available)
- Search by name

**Sort options:**
- Best match (default with AI)
- Newest first
- Alphabetical
- Most members

---

## Team Communication

### Built-in Features

**Team invite link:**
```
https://yoursite.com/events/[eventId]/teams/[teamId]/join?token=abc123
```

**Share via:**
- Copy to clipboard button
- Native share (mobile)
- Direct link

**Team details page shows:**
- All member names and emails
- Team leader badge
- Project status
- Communication links

---

### External Integration

**Recommended approach:** Link to external tools

**Discord/Slack setup:**
1. Create channel for your team
2. Add link to team description
3. Members click to join

**Why external chat:**
- Better UX than building in-app
- Real-time messaging
- File sharing
- Voice/video calls
- Screen sharing

**Alternative:** Could build chat (future feature)

---

## Team Lifecycle

### Pre-Event Phase

**Team formation period:**
- Browse teams before event starts
- Recruit members early
- Plan project ideas
- No project submission yet

**Best practices:**
- Form teams 1-2 weeks before event
- Diversity of skills preferred
- 3-5 members optimal (solo allowed)
- Clear vision in team description

---

### During Event

**Active collaboration:**
- Create project (one per team)
- Work together on implementation
- Update project details
- Submit before deadline

**Team changes:**
- New members can join anytime
- Members can leave before submission
- Leader can remove inactive members
- After submission: locked (no changes)

---

### After Event

**Read-only mode:**
- View team and project
- See results and rankings
- Receive judge feedback
- Team structure frozen

**Cannot change:**
- Team name or members
- Project details (after judging)
- Team description

---

## Technical Implementation

### Team Model

```typescript
{
  _id: ObjectId,
  eventId: ObjectId → Event,
  name: string (unique per event),
  description: string,
  leaderId: ObjectId → User,
  members: ObjectId[] → User,
  desiredSkills: string[],
  desiredSkillsEmbedding: number[] (1536-dim),
  lookingForMembers: boolean,
  capacity: number (default 5),
  category?: string,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
{ eventId: 1, lookingForMembers: 1 }  // Browse teams
{ leaderId: 1 }                        // Leader's teams
{ members: 1 }                         // Member lookups
```

**Vector Search index:**
```javascript
{
  name: "team_skills_vector",
  type: "vectorSearch",
  fields: [{
    type: "vector",
    path: "desiredSkillsEmbedding",
    numDimensions: 1536,
    similarity: "cosine"
  }]
}
```

---

### API Endpoints

#### List Teams

```http
GET /api/events/:eventId/teams?lookingForMembers=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "team123",
      "name": "Data Wizards",
      "description": "Building RAG chatbot...",
      "members": [
        { "_id": "user1", "name": "Alice" },
        { "_id": "user2", "name": "Bob" }
      ],
      "desiredSkills": ["Python", "ML"],
      "lookingForMembers": true,
      "capacity": 5
    }
  ]
}
```

---

#### Create Team

```http
POST /api/events/:eventId/teams
```

**Request:**
```json
{
  "name": "Data Wizards",
  "description": "Building a RAG chatbot with Vector Search",
  "desiredSkills": ["Python", "Machine Learning", "APIs"],
  "category": "AI/ML",
  "lookingForMembers": true,
  "capacity": 5
}
```

**Validations:**
- User must be registered for event
- User cannot already be on a team
- Team name must be unique
- Desired skills: 1-10 items

---

#### Join Team

```http
POST /api/events/:eventId/teams/:teamId/join
```

**Checks:**
- User registered for event?
- User not already on a team?
- Team not at capacity?
- Team still looking for members?

**On success:**
- Add user to team.members
- Update participant.teamId
- Return updated team

---

#### Leave Team

```http
POST /api/events/:eventId/teams/:teamId/leave
```

**Checks:**
- User is team member?
- User is not leader? (transfer first)
- Team has no submitted project?

**On success:**
- Remove user from team.members
- Clear participant.teamId
- If team empty: delete team

---

### Embedding Generation

**When team created:**
```typescript
// Combine desired skills into text
const skillText = desiredSkills.join(' ') + ' ' + description;

// Generate embedding
const embedding = await generateEmbedding(skillText);

// Store in team
team.desiredSkillsEmbedding = embedding;
await team.save();
```

**Cost:** ~$0.0001 per team (negligible)

---

## Best Practices

### For Participants

**Team selection:**
- Look for complementary skills (not duplicates)
- Check team activity (when created, member count)
- Read description carefully
- Join teams with clear vision

**Creating teams:**
- Write clear, specific description
- List 3-5 desired skills (specific > generic)
- Set realistic capacity (3-5 optimal)
- Toggle "looking for members" on
- Share invite link in event Discord

**Team dynamics:**
- Assign roles early (frontend, backend, ML, etc.)
- Use external chat (Discord/Slack)
- Daily check-ins
- Clear task division

---

### For Organizers

**Team formation window:**
- Open 2 weeks before event
- Close at event start (optional)
- Allow changes until submission

**Capacity limits:**
- Minimum: 1 (allow solo)
- Maximum: 5 (default)
- Adjust based on event size

**Matchmaking:**
- Enable vector search for 100+ participants
- Encourage specific skills (not "coding")
- Show match scores in UI
- Highlight high-match teams

**Moderation:**
- Monitor team names (profanity filter)
- Can delete inappropriate teams
- Can merge duplicate teams
- Can reassign members if needed

---

## Troubleshooting

### "Team full" Error

**Cause:** Team at capacity (e.g., 5/5 members)

**Solutions:**
- Find another team
- Ask team leader to increase capacity
- Create your own team

---

### "Already on a team" Error

**Cause:** You're already a member of another team

**Solutions:**
- Leave current team first
- Complete your current team's project
- Wait until after event to join new team

---

### Team Not Showing in Recommendations

**Causes:**
1. Team not "looking for members"
2. Low skill match
3. Team at capacity
4. Vector search indexes missing

**Debug:**
```javascript
// Check team status
db.teams.findOne({ _id: teamId }, { 
  lookingForMembers: 1, 
  members: 1, 
  capacity: 1,
  desiredSkillsEmbedding: 1
});

// Should show:
// lookingForMembers: true
// members.length < capacity
// desiredSkillsEmbedding: [array of 1536 numbers]
```

---

### Cannot Leave Team

**Error:** "Cannot leave team after project submission"

**Cause:** Team has submitted project (locked)

**Solution:** This is intentional. Teams are frozen after submission to maintain project attribution.

---

## Analytics

### Team Metrics

**Track:**
- Teams created vs participants registered
- Average team size
- Team formation velocity (teams/day)
- Abandon rate (teams created but empty at event start)
- Match score distribution

**Goals:**
- 70%+ participants on teams
- Average team size: 3-4
- <10% abandoned teams

---

## Future Enhancements

**Planned features:**
- Team chat (built-in messaging)
- Team voice/video calls
- Shared file storage
- Task management
- Team analytics dashboard
- Historical team performance

**Community requests:**
- Team templates (pre-defined roles)
- Mentor assignment per team
- Team achievements/badges
- Cross-event team history

---

## Next Steps

- [Create your first team](/docs/getting-started/first-event#team-formation)
- [Set up vector search for matching](/docs/ai/vector-search)
- [Submit team project](/docs/features/projects)
- [View team in Event Hub](/docs/features/event-hub#your-team-section)
