---
sidebar_position: 2
---

# Team Matching

AI-powered team recommendations using semantic skill matching with MongoDB Atlas Vector Search.

## Overview

Team matching helps participants find compatible teammates by analyzing skills semantically, not just keyword matching.

**How it works:**
1. Participant registers with skills (e.g., "Python", "Machine Learning")
2. OpenAI generates 1536-dim embedding vector
3. Team specifies desired skills (e.g., "ML Engineer", "Data Science")
4. Atlas Vector Search finds semantic matches
5. Ranked recommendations displayed with match scores

**Why AI matching:**
- "MongoDB" ≈ "NoSQL" ≈ "Database" (semantic understanding)
- "Machine Learning" ≈ "ML" ≈ "AI" ≈ "Neural Networks"
- Better than exact keyword matching
- Discovers non-obvious compatibility

---

## Participant Skill Embeddings

### Generation on Registration

**When participant registers:**
```typescript
// 1. Combine skills and bio into text
const skillText = participant.skills.join(' ') + ' ' + participant.bio;
// Example: "Python MongoDB React Full-stack developer interested in AI"

// 2. Call OpenAI Embeddings API
const response = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: skillText,
  encoding_format: "float"
});

// 3. Store 1536-dimensional vector
participant.skillsEmbedding = response.data[0].embedding;
// [0.023, -0.145, 0.891, ..., 0.234] (1536 numbers)

await participant.save();
```

**Embedding properties:**
- **Dimensions:** 1536 floats
- **Model:** text-embedding-3-small (OpenAI)
- **Cost:** ~$0.0001 per participant
- **Generation time:** 100-500ms
- **Storage:** ~6KB per embedding

**Fire-and-forget:**
- Doesn't block registration
- Generated asynchronously
- Usually completes within 1-2 seconds
- Fallback to tag-overlap if fails

---

## Team Desired Skills Embeddings

### Generation on Team Creation

**When team created:**
```typescript
// 1. Combine desired skills and description
const teamText = team.desiredSkills.join(' ') + ' ' + team.description;
// Example: "Machine Learning Python APIs Building RAG chatbot with Vector Search"

// 2. Generate embedding (same model)
const response = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: teamText
});

// 3. Store in team document
team.desiredSkillsEmbedding = response.data[0].embedding;
await team.save();
```

**Why teams need embeddings:**
- Match participants to teams
- Semantic understanding of team needs
- "Looking for ML expert" matches participants with "PyTorch", "TensorFlow", "Data Science"

---

## Vector Search Query

### Finding Compatible Teams

**MongoDB Atlas Vector Search aggregation:**
```typescript
const teams = await Team.aggregate([
  {
    $vectorSearch: {
      index: "team_skills_vector",           // Vector index name
      path: "desiredSkillsEmbedding",        // Field with 1536-dim vector
      queryVector: participant.skillsEmbedding, // User's vector
      numCandidates: 100,                    // Candidates to examine
      limit: 10,                             // Top results
      filter: {
        eventId: eventId,                    // Only this event
        lookingForMembers: true,             // Team open
        $expr: {
          $lt: [{ $size: "$members" }, "$capacity"] // Not full
        }
      }
    }
  },
  {
    $addFields: {
      matchScore: {
        $multiply: [{ $meta: "vectorSearchScore" }, 100]
      }
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "members",
      foreignField: "_id",
      as: "memberDetails"
    }
  },
  {
    $project: {
      name: 1,
      description: 1,
      desiredSkills: 1,
      members: 1,
      capacity: 1,
      matchScore: 1,
      memberCount: { $size: "$members" }
    }
  }
]);
```

**Results:**
```javascript
[
  {
    _id: "team123",
    name: "Data Wizards",
    description: "Building RAG chatbot...",
    desiredSkills: ["Python", "ML", "APIs"],
    members: ["user1", "user2"],
    capacity: 5,
    memberCount: 2,
    matchScore: 87.3  // 87% match!
  },
  {
    _id: "team456",
    name: "AI Innovators",
    matchScore: 72.1  // 72% match
  }
]
```

---

## Match Score Calculation

### Cosine Similarity

**Atlas Vector Search uses cosine similarity:**
```
similarity = (A · B) / (||A|| × ||B||)

Where:
- A = participant embedding vector (1536 dims)
- B = team embedding vector (1536 dims)
- · = dot product
- ||A|| = magnitude of A
```

**Score interpretation:**
- **90-100%** - Excellent match (very compatible)
- **75-89%** - Good match (compatible)
- **60-74%** - Moderate match (some overlap)
- **40-59%** - Weak match (limited overlap)
- **0-39%** - Poor match (not compatible)

**Displayed to user:**
```
Data Wizards                    87% Match
Looking for: Python, ML, APIs
Your skills match: Python, MongoDB
Team: 3/5 members
```

---

## Match Reasoning

### Explaining Why Teams Match

**Display skill overlap:**
```typescript
function getMatchReasons(participant, team) {
  const yourSkills = participant.skills;
  const theirNeeds = team.desiredSkills;
  
  // Find overlaps (case-insensitive, partial match)
  const matches = yourSkills.filter(skill =>
    theirNeeds.some(need => 
      skill.toLowerCase().includes(need.toLowerCase()) ||
      need.toLowerCase().includes(skill.toLowerCase())
    )
  );
  
  const gaps = theirNeeds.filter(need =>
    !yourSkills.some(skill =>
      skill.toLowerCase().includes(need.toLowerCase())
    )
  );
  
  return {
    matches,  // ["Python", "MongoDB"]
    gaps      // ["Docker", "CI/CD"]
  };
}
```

**UI display:**
```
✓ Your skills match: Python, MongoDB
• They also need: Docker, CI/CD
📊 Team size: 3/5 (2 spots available)
```

**Why helpful:**
- Transparency (why this team?)
- Shows gaps (where you could learn)
- Builds confidence in AI recommendations

---

## Fallback: Tag-Overlap Matching

### When Vector Search Unavailable

**Graceful degradation:**
```typescript
// If no skillsEmbedding or vector index missing
function tagOverlapMatch(participant, teams) {
  return teams
    .filter(team => team.lookingForMembers)
    .map(team => {
      // Count skill overlaps
      const matches = participant.skills.filter(skill =>
        team.desiredSkills.some(need =>
          skill.toLowerCase() === need.toLowerCase()
        )
      );
      
      // Simple percentage
      const score = (matches.length / team.desiredSkills.length) * 100;
      
      return { ...team, matchScore: score, matches };
    })
    .filter(team => team.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}
```

**Tag-overlap limitations:**
- Exact match only (no semantic understanding)
- "ML" ≠ "Machine Learning"
- "MongoDB" ≠ "NoSQL"
- Lower quality recommendations

**When to use:**
- Development/testing (no OpenAI key)
- Small events (&lt;50 participants)
- Vector Search indexes not set up
- Temporary fallback if API down

---

## Atlas Vector Search Setup

### Index Configuration

**Create index via Atlas UI or CLI:**
```json
{
  "name": "team_skills_vector",
  "type": "vectorSearch",
  "fields": [
    {
      "type": "vector",
      "path": "desiredSkillsEmbedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

**Also create participant index:**
```json
{
  "name": "participant_skills_vector",
  "type": "vectorSearch",
  "fields": [
    {
      "type": "vector",
      "path": "skillsEmbedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

**Requirements:**
- MongoDB Atlas M10+ cluster
- Atlas Search enabled
- ~5-10 minutes for index build

**See:** [Vector Search Setup Guide](/docs/ai/vector-search)

---

## Performance & Scalability

### Query Performance

**Typical query times:**
- **&lt;20ms** - Warm query (100 teams)
- **&lt;50ms** - Cold query (100 teams)
- **&lt;100ms** - Large dataset (1000+ teams)

**Optimization tips:**
1. **Use numCandidates wisely**
   - 10x limit is good baseline (limit=10, candidates=100)
   - Higher = better quality, slower
   - Lower = faster, may miss best matches

2. **Filter early**
   - Add eventId filter
   - Add lookingForMembers filter
   - Reduces candidates examined

3. **Cache results**
   - Recommendations don't change often
   - Cache for 5-10 minutes
   - Refresh on team changes

---

### Embedding Generation Performance

**Bottleneck:** OpenAI API latency

**Optimization strategies:**

**1. Async generation (current):**
```typescript
// Don't await (fire-and-forget)
generateEmbedding(participant).catch(err => {
  logger.error('Embedding generation failed', err);
});

// Registration completes immediately
return res.json({ success: true });
```

**2. Batch processing:**
```typescript
// Generate in batches every 5 minutes
const participants = await Participant.find({
  skillsEmbedding: { $exists: false }
}).limit(50);

const embeddings = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: participants.map(p => p.skills.join(' '))
});

// Update all at once
```

**3. Pre-compute common skills:**
```typescript
// Cache embeddings for common skill combinations
const commonSkills = {
  "Python MongoDB": [0.023, -0.145, ...],
  "React Node.js": [0.156, 0.234, ...],
  // ...
};

// Lookup instead of API call
if (commonSkills[skillText]) {
  return commonSkills[skillText];
}
```

---

## Cost Analysis

### OpenAI Embedding Costs

**Pricing (text-embedding-3-small):**
- $0.02 per 1M tokens
- Average skill text: 10-30 tokens
- **~$0.0001 per participant**

**Example event (200 participants):**
```
200 participants × $0.0001 = $0.02
50 teams × $0.0001 = $0.005

Total: $0.025 (2.5 cents)
```

**For 1000-person event:**
- Participants: $0.10
- Teams: $0.02
- **Total: $0.12** (negligible)

**Takeaway:** Embedding costs are extremely low, not a concern even for large events.

---

### MongoDB Atlas Costs

**M10 cluster:** ~$60/month base

**Vector Search overhead:**
- Minimal RAM increase (~5-10%)
- Minimal disk increase (~1GB per 10K participants)
- No per-query charges

**ROI:** Better team formation = better projects = better event

---

## Match Quality Metrics

### Measuring Success

**Track:**
1. **Match acceptance rate**
   - % of recommended teams joined
   - Goal: >40% join from top 3 recommendations

2. **Team completion rate**
   - % of teams that reach capacity
   - Goal: >70% of teams fill up

3. **Participant satisfaction**
   - Post-event survey: "Did you find good teammates?"
   - Goal: >80% satisfied

4. **Match score distribution**
   - Histogram of match scores
   - Goal: Majority >60% match

**Example query:**
```javascript
// Calculate average match score of joined teams
db.participants.aggregate([
  { $match: { teamId: { $exists: true } } },
  { $lookup: { from: "teams", localField: "teamId", foreignField: "_id", as: "team" } },
  { $unwind: "$team" },
  {
    $project: {
      matchScore: {
        $let: {
          vars: {
            dotProduct: { $reduce: {
              input: { $range: [0, 1536] },
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  { $multiply: [
                    { $arrayElemAt: ["$skillsEmbedding", "$$this"] },
                    { $arrayElemAt: ["$team.desiredSkillsEmbedding", "$$this"] }
                  ]}
                ]
              }
            }}
          },
          in: { $multiply: ["$$dotProduct", 100] }
        }
      }
    }
  },
  { $group: { _id: null, avgMatch: { $avg: "$matchScore" } } }
]);
```

---

## User Experience

### Event Hub Display

**Recommended Teams section:**
```
Recommended for You

┌──────────────────────────────┐
│ Data Wizards         87% ⭐  │
│                              │
│ Looking for: Python, ML      │
│ ✓ Match: Python, MongoDB     │
│ Team: 3/5                    │
│                              │
│ [Join Team]                  │
└──────────────────────────────┘

┌──────────────────────────────┐
│ AI Innovators        72% ⭐  │
│                              │
│ Looking for: React, APIs     │
│ ✓ Match: React               │
│ • Need: Docker, Kubernetes   │
│ Team: 2/5                    │
│                              │
│ [Join Team]                  │
└──────────────────────────────┘
```

**Visual cues:**
- ⭐ Star rating (87% = 4.3 stars)
- Green checkmark for matches
- Bullet for gaps
- Team size progress

---

### Browse Teams Page

**Filter + Sort:**
```
Sort by: [Best Match ▼]

Filters:
☑ Looking for members
☐ Has availability
☐ Category: AI/ML

[Apply]
```

**Sort options:**
- Best match (default with embeddings)
- Newest first
- Alphabetical
- Most members

---

## Troubleshooting

### Low Match Scores

**Symptom:** All recommendations &lt;50% match

**Causes:**
1. Participant skills too generic ("coding", "programming")
2. Participant skills too specific ("React 18.2.0")
3. Teams not specifying skills
4. Embedding generation failed

**Solutions:**
- Encourage specific but not overly narrow skills
- Prompt teams to list 3-5 desired skills
- Verify embeddings exist in database
- Check OpenAI API logs for errors

---

### No Recommendations

**Symptom:** "No teams match your skills"

**Causes:**
1. All teams full
2. No teams looking for members
3. Embedding missing (generation failed)
4. Vector index not working

**Debug:**
```javascript
// Check participant embedding
db.participants.findOne({ _id: participantId }, { skillsEmbedding: 1 });
// Should return array of 1536 numbers

// Check teams available
db.teams.countDocuments({
  eventId: eventId,
  lookingForMembers: true,
  $expr: { $lt: [{ $size: "$members" }, "$capacity"] }
});
// Should be > 0

// Test vector search manually
db.teams.aggregate([
  { $vectorSearch: { /* ... */ } },
  { $limit: 1 }
]);
// Should return at least 1 result
```

---

### Embedding Generation Failures

**Symptom:** `skillsEmbedding` field is null or missing

**Causes:**
- OpenAI API key invalid
- OpenAI rate limit hit
- Network timeout
- Skill text empty

**Check logs:**
```bash
grep "generateEmbedding" logs/app.log | grep -i error
```

**Manual regeneration:**
```javascript
// Admin script
const participants = await Participant.find({ skillsEmbedding: null });

for (const p of participants) {
  const text = p.skills.join(' ') + ' ' + (p.bio || '');
  const embedding = await generateEmbedding(text);
  p.skillsEmbedding = embedding;
  await p.save();
  console.log(`✓ ${p._id}`);
}
```

---

## Future Enhancements

### Planned Features

**1. Bi-directional matching:**
- Show participants which teams want them
- "3 teams are looking for your skills"

**2. Learning from outcomes:**
- Track which matches lead to successful projects
- Adjust scoring based on past success
- "Teams with similar members won 3 awards"

**3. Skill gap analysis:**
- "Your team has strong backend, weak frontend"
- Recommend members to fill gaps

**4. Time-based matching:**
- Match based on availability/timezone
- "Both available 6-10 PM EST"

**5. Personality matching:**
- Add personality dimensions (Myers-Briggs, etc.)
- "You both prefer structured planning"

---

## Next Steps

- [Set up Vector Search indexes](/docs/ai/vector-search)
- [Configure OpenAI API key](/docs/getting-started/configuration#openai-api-key)
- [Test team matching](/docs/features/teams#ai-powered-matching)
- [Monitor match quality](/docs/admin/analytics)
