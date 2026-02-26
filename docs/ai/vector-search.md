---
sidebar_position: 4
---

# Vector Search Setup

Configure MongoDB Atlas Vector Search to enable AI-powered team matching and semantic search features.

## Prerequisites

- MongoDB Atlas cluster **M10 or higher** (M0/M2/M5 free tiers do NOT support vector search)
- OpenAI API key configured
- Platform installed and running

**Why Atlas M10+?**
Vector Search is an Atlas-only feature that requires dedicated resources. Free tier clusters lack the compute power for vector operations.

---

## Overview

MongoHacks uses vector embeddings to power:

1. **Team Matching** - Semantic skill similarity (not just keyword matching)
2. **Project Discovery** (future) - Find similar projects
3. **Event Recommendations** (future) - Suggest relevant events

**How it works:**

```
User registers → Skills text → OpenAI embedding → 1536-dim vector → MongoDB
Team created → Desired skills → OpenAI embedding → 1536-dim vector → MongoDB
Search query → Atlas Vector Search → Cosine similarity → Ranked results
```

---

## Step 1: Verify Cluster Tier

### Check Current Tier

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your cluster
3. Check tier badge (top-right)

**If M0/M2/M5 (Free Tier):**
- Vector Search: ❌ Not available
- Action: Upgrade to M10

**If M10+ (Paid):**
- Vector Search: ✅ Available
- Continue to Step 2

### Upgrade to M10 (If Needed)

1. Click **"..."** menu on cluster
2. Select **"Edit Configuration"**
3. Change tier to **M10** (2GB RAM)
4. Click **"Review Changes"**
5. Confirm and apply

**Cost:** ~$0.08/hour = ~$60/month

**Tips:**
- M10 sufficient for 100-500 participants
- M30 recommended for 1000+ participants
- Use paused cluster ($0/hour) when not in use

---

## Step 2: Create Vector Search Indexes

You need **2 indexes** for full AI functionality:

1. `participant_skills_vector` - Match participants to teams
2. `team_skills_vector` - Match teams to participants

### Option A: Atlas UI (Recommended)

#### Create Participant Skills Index

1. Go to Atlas → **Search** tab
2. Click **"Create Search Index"**
3. Select **"JSON Editor"**
4. Choose database: `mongohacks`
5. Choose collection: `participants`
6. Paste this definition:

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

7. Click **"Create Search Index"**
8. Wait 1-2 minutes for build

**Status indicators:**
- 🟡 Building... (wait)
- 🟢 Active (ready!)

---

#### Create Team Skills Index

**Repeat same process** with different settings:

1. Create Search Index
2. JSON Editor
3. Database: `mongohacks`
4. Collection: `teams`
5. Paste:

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

6. Create and wait for Active status

---

### Option B: Atlas CLI

**Install Atlas CLI:**
```bash
# macOS
brew install mongodb-atlas-cli

# Linux/Windows
curl -LO https://fastdl.mongodb.org/mongocli/mongodb-atlas-cli_latest_linux_x86_64.tar.gz
tar -zxvf mongodb-atlas-cli_*.tar.gz
```

**Authenticate:**
```bash
atlas auth login
```

**Create indexes:**

```bash
# Participant skills index
cat > participant-skills-index.json << 'EOF'
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
EOF

atlas clusters search indexes create \
  --clusterName mongohacks-cluster \
  --db mongohacks \
  --collection participants \
  --file participant-skills-index.json

# Team skills index
cat > team-skills-index.json << 'EOF'
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
EOF

atlas clusters search indexes create \
  --clusterName mongohacks-cluster \
  --db mongohacks \
  --collection teams \
  --file team-skills-index.json
```

---

## Step 3: Verify Indexes

### Via Atlas UI

1. Go to Search tab
2. Check both indexes show **Active** status
3. Note index sizes (should be > 0 KB once data exists)

### Via MongoDB Shell

```javascript
// Connect to your cluster
mongosh "mongodb+srv://cluster.mongodb.net/mongohacks"

// List indexes on participants
db.participants.getIndexes().forEach(idx => {
  if (idx.name === 'participant_skills_vector') {
    print('✓ Participant skills index exists');
  }
});

// List indexes on teams
db.teams.getIndexes().forEach(idx => {
  if (idx.name === 'team_skills_vector') {
    print('✓ Team skills index exists');
  }
});
```

### Via Application Code

**Test file:** `scripts/test-vector-search.ts`

```typescript
import { connectToDatabase } from '@/lib/db/connection';
import { ParticipantModel } from '@/lib/db/models/Participant';

async function testVectorSearch() {
  await connectToDatabase();
  
  // Try a vector search query
  const results = await ParticipantModel.aggregate([
    {
      $vectorSearch: {
        index: "participant_skills_vector",
        path: "skillsEmbedding",
        queryVector: new Array(1536).fill(0.1), // Dummy vector
        numCandidates: 10,
        limit: 5
      }
    }
  ]);
  
  console.log(`✓ Vector search working! Found ${results.length} results`);
}

testVectorSearch();
```

**Run test:**
```bash
npx ts-node scripts/test-vector-search.ts
```

**Expected output:**
```
✓ Vector search working! Found 5 results
```

---

## Step 4: Generate Embeddings

Embeddings are automatically generated when:
- Participant registers (skills → embedding)
- Team is created (desired skills → embedding)

### Manual Backfill (If Needed)

If you have existing participants/teams without embeddings:

**Script:** `scripts/backfill-embeddings.ts`

```typescript
import { connectToDatabase } from '@/lib/db/connection';
import { ParticipantModel } from '@/lib/db/models/Participant';
import { TeamModel } from '@/lib/db/models/Team';
import { generateEmbedding } from '@/lib/ai/embedding-service';

async function backfillParticipantEmbeddings() {
  await connectToDatabase();
  
  const participants = await ParticipantModel.find({
    skillsEmbedding: { $exists: false },
    skills: { $ne: [] }
  });
  
  console.log(`Found ${participants.length} participants without embeddings`);
  
  for (const p of participants) {
    const skillText = p.skills.join(' ') + ' ' + (p.bio || '');
    const embedding = await generateEmbedding(skillText);
    
    p.skillsEmbedding = embedding;
    await p.save();
    
    console.log(`✓ ${p.userId} embedded`);
  }
  
  console.log('Participant embeddings complete!');
}

async function backfillTeamEmbeddings() {
  await connectToDatabase();
  
  const teams = await TeamModel.find({
    desiredSkillsEmbedding: { $exists: false },
    desiredSkills: { $ne: [] }
  });
  
  console.log(`Found ${teams.length} teams without embeddings`);
  
  for (const t of teams) {
    const skillText = (t.desiredSkills || []).join(' ') + ' ' + t.description;
    const embedding = await generateEmbedding(skillText);
    
    t.desiredSkillsEmbedding = embedding;
    await t.save();
    
    console.log(`✓ ${t.name} embedded`);
  }
  
  console.log('Team embeddings complete!');
}

// Run both
async function main() {
  await backfillParticipantEmbeddings();
  await backfillTeamEmbeddings();
  process.exit(0);
}

main();
```

**Run backfill:**
```bash
npx ts-node scripts/backfill-embeddings.ts
```

**Cost:** ~$0.0001 per embedding (negligible)

---

## Step 5: Test Team Matching

### Register Test Participant

1. Go to your event registration page
2. Register with skills: `["Python", "MongoDB", "Machine Learning"]`
3. Check database:

```javascript
db.participants.findOne({ skills: "Python" }, { skillsEmbedding: 1 })
// Should return document with skillsEmbedding: [array of 1536 numbers]
```

### Create Test Team

1. Create team looking for: `["Python", "Data Science", "APIs"]`
2. Check database:

```javascript
db.teams.findOne({ desiredSkills: "Python" }, { desiredSkillsEmbedding: 1 })
// Should return document with desiredSkillsEmbedding: [array of 1536 numbers]
```

### Verify Matching

1. Go to Event Hub as test participant
2. Check "Recommended Teams" section
3. Should see test team with high match score (>70%)

**Expected:**
```
🎯 Test Team (Match: 87%)
Looking for: Python, Data Science, APIs
✓ Your skills match: Python
• They need: Data Science, APIs
```

---

## Understanding Vector Search

### How Embeddings Work

**Text → Vector:**
```
"Python MongoDB Machine Learning"
     ↓ (OpenAI API)
[0.023, -0.145, 0.891, ..., 0.234]  // 1536 numbers
```

**Why it's better than keywords:**
- "Machine Learning" ≈ "ML" ≈ "Data Science" (semantically similar)
- "MongoDB" ≈ "Databases" ≈ "NoSQL" (related concepts)
- Works across languages, synonyms, related terms

### Similarity Calculation

**Cosine similarity:**
```
similarity = (A · B) / (||A|| × ||B||)
```

**Range:** -1 to 1
- 1.0 = Identical
- 0.5 = Somewhat similar
- 0.0 = Unrelated
- -1.0 = Opposite

**Match score (%):**
```
matchScore = (similarity + 1) / 2 * 100
```

So:
- Similarity 1.0 → 100%
- Similarity 0.5 → 75%
- Similarity 0.0 → 50%

### Query Example

```typescript
// Find teams matching participant skills
const results = await TeamModel.aggregate([
  {
    $vectorSearch: {
      index: "team_skills_vector",          // Index name
      path: "desiredSkillsEmbedding",       // Field with vector
      queryVector: participant.skillsEmbedding,  // 1536-dim array
      numCandidates: 100,                   // Consider top 100
      limit: 6,                             // Return top 6
      filter: {                             // Pre-filter (optional)
        eventId: new ObjectId(eventId),
        lookingForMembers: true
      }
    }
  },
  {
    $addFields: {
      matchScore: {
        $multiply: [
          { $meta: "vectorSearchScore" },   // Similarity score
          100                                // Convert to percentage
        ]
      }
    }
  }
]);
```

**Performance:**
- Search time: 20-50ms (M10), <10ms (M30+)
- Scales to millions of vectors
- No impact on regular queries

---

## Monitoring & Optimization

### Check Index Health

**Atlas UI:**
1. Search tab → Index name
2. Monitor:
   - Index size (grows with data)
   - Query count (usage)
   - Avg query time (performance)

**Metrics to track:**
- Queries per day
- P95 latency (<100ms good)
- Index size vs collection size
- Error rate (should be 0%)

### Cost Analysis

**Vector Search costs:**
- **Storage:** Included in cluster tier
- **Compute:** Included in cluster tier
- **No per-query charges**

**Only pay for:**
- OpenAI embedding generation (~$0.0001 per embedding)
- Atlas cluster tier (M10 = $60/month)

**For 200 participants + 50 teams:**
- Embeddings: $0.025 total (one-time)
- Storage: ~5MB (negligible)
- Queries: Unlimited (no extra cost)

### Optimization Tips

1. **Cache embeddings** - Don't regenerate on every profile update
2. **Batch generation** - Use OpenAI batch API for 50% discount
3. **Lazy loading** - Generate embeddings async after registration
4. **Pre-filter** - Use `filter` in $vectorSearch to reduce candidates
5. **Tune numCandidates** - Balance accuracy vs speed (100-500 good)

---

## Troubleshooting

### Index Creation Fails

**Error:** "Vector Search is not available for this cluster"

**Cause:** Cluster tier too low (M0/M2/M5)

**Solution:** Upgrade to M10 or higher

---

**Error:** "Index build failed"

**Possible causes:**
1. Incorrect field path (typo in `path`)
2. Wrong number of dimensions (must be 1536 for text-embedding-3-small)
3. Collection doesn't exist yet

**Debug:**
```javascript
// Check if collection exists
db.getCollectionNames()

// Check if any documents have the field
db.participants.findOne({}, { skillsEmbedding: 1 })
```

---

### Vector Search Returns No Results

**Cause 1:** No documents have embeddings yet

**Solution:** Register a participant or run backfill script

---

**Cause 2:** Index not Active

**Solution:** Wait for index to finish building (check Atlas UI)

---

**Cause 3:** Wrong index name in query

**Debug:**
```typescript
// Should match index name exactly
$vectorSearch: {
  index: "participant_skills_vector",  // Case-sensitive!
  // ...
}
```

---

### Embeddings Not Generating

**Error:** `401 Unauthorized` from OpenAI

**Solution:** Check `OPENAI_API_KEY` is set and valid

---

**Error:** Embedding request times out

**Cause:** OpenAI API slow or rate-limited

**Solution:**
1. Retry with exponential backoff
2. Check OpenAI status page
3. Reduce embedding request rate

---

### Low Match Scores

**Problem:** All teams show <30% match scores

**Causes:**
1. Skills too generic ("Software Development", "Coding")
2. Not enough skill overlap
3. Embedding quality issue

**Solutions:**
1. Encourage specific skills ("React", "MongoDB", "Python")
2. Show more teams (increase limit)
3. Add bio text to embedding input for context

---

## Advanced Configuration

### Custom Similarity Function

**Default:** Cosine similarity (good for most cases)

**Alternatives:**
- `euclidean` - Distance-based (use for clustering)
- `dotProduct` - Inner product (use for recommendations)

```json
{
  "similarity": "euclidean"  // Instead of "cosine"
}
```

### Multiple Vector Fields

**Use case:** Search by both skills AND project interests

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "skillsEmbedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "vector",
      "path": "interestsEmbedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

**Query both:**
```typescript
$vectorSearch: {
  index: "participant_multi_vector",
  queryVector: skillsVector,
  path: "skillsEmbedding",
  // ...
}

// Or combine results from separate queries
```

### Filtered Vector Search

**Add filters to narrow candidates:**

```typescript
$vectorSearch: {
  index: "team_skills_vector",
  path: "desiredSkillsEmbedding",
  queryVector: participantVector,
  numCandidates: 100,
  limit: 6,
  filter: {
    eventId: eventIdObj,
    lookingForMembers: true,
    teamSize: { $lt: 5 },          // Not full
    category: "AI/ML"               // Specific category
  }
}
```

**Performance:** Pre-filtering reduces search space, speeds up queries

---

## Next Steps

- [Test team matching](/docs/features/teams#team-matching)
- [Optimize embedding generation](/docs/ai/team-matching#optimization)
- [Monitor vector search performance](/docs/admin/analytics)
- [Scale to larger events](/docs/development/deployment)

## Further Reading

- [MongoDB Atlas Vector Search Docs](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Cosine Similarity Explained](https://en.wikipedia.org/wiki/Cosine_similarity)
