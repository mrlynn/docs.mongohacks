---
sidebar_position: 1
---

# AI Features Overview

MongoHacks integrates OpenAI GPT-4 and MongoDB Atlas Vector Search to enhance the hackathon experience for participants, judges, and organizers.

## Why AI?

Traditional hackathon judging is time-consuming and repetitive:

- Judges spend **3-5 minutes per project** reading descriptions and READMEs
- Teams get **inconsistent feedback** that varies by judge writing style
- Organizers manually match participants to teams based on simple tags

**With AI:**

- Judges get **2-3 sentence summaries** instantly (saves 60%+ reading time)
- Every team receives **constructive, synthesized feedback** in consistent format
- Participants find teams through **semantic skill matching**, not just keywords

## Features

### 1. Project Summaries for Judges

**What it does:** Automatically generates a 2-3 sentence project summary when a team submits their project.

**How it works:**
1. Project status changes to "submitted"
2. Fire-and-forget API call to OpenAI GPT-4 Turbo
3. Summary stored in `project.aiSummary` field
4. Displayed prominently on judging interface

**Example:**

> **Input:** 500-word project description about a RAG chatbot for MongoDB docs
>
> **AI Summary:** "This project builds a retrieval-augmented generation (RAG) chatbot using MongoDB Atlas Vector Search and OpenAI's GPT-4 to answer questions about MongoDB documentation. The system embeds documentation chunks into MongoDB and retrieves relevant context before generating responses. Built with Python, LangChain, and a Next.js frontend, it demonstrates practical AI integration with MongoDB's vector capabilities."

**Time Saved:** 3-5 minutes per project × 100 projects = **5-8 hours saved** per event

**Cost:** ~$0.01-0.02 per summary

[Learn more about Project Summaries →](/docs/ai/project-summaries)

---

### 2. Feedback Synthesis

**What it does:** Combines judge scores and comments into coherent, constructive feedback paragraphs.

**How it works:**
1. Judges score projects on 4 criteria (Innovation, Technical, Impact, Presentation)
2. After judging concludes, admin clicks "Generate All Feedback"
3. AI synthesizes average scores + judge comments into 2-3 paragraphs
4. Teams see feedback on their project detail page

**Example:**

> **Input:**
> - Judge 1: Innovation 8/10, Technical 9/10 - "Great use of vector search!"
> - Judge 2: Innovation 7/10, Technical 8/10 - "Could improve error handling"
> - Judge 3: Innovation 9/10, Technical 7/10 - "Impressive demo"
>
> **AI Feedback:** "Your project demonstrates strong technical execution, particularly in the integration of MongoDB Atlas Vector Search with the GPT-4 API, earning consistent high marks across judges (average 8.3/10 technical). The innovation in applying RAG to documentation search was widely appreciated (average 8/10), with judges noting the practical value of the solution. To take this further, consider adding more robust error handling for edge cases and expanding the dataset beyond MongoDB docs to demonstrate broader applicability. Overall, this is a well-built project with clear real-world potential—great work on the demo presentation!"

**Benefits:**
- Every team gets feedback (not just winners)
- Consistent tone and quality
- Saves organizers 10+ hours of manual synthesis

**Cost:** ~$0.03-0.05 per project

[Learn more about Feedback Synthesis →](/docs/ai/feedback-synthesis)

---

### 3. Vector-Based Team Matching

**What it does:** Uses semantic similarity to recommend teams that match a participant's skills and interests.

**How it works:**
1. On registration, participant's skills are converted to embeddings using OpenAI `text-embedding-3-small`
2. Teams' desired skills also embedded on creation
3. MongoDB Atlas Vector Search finds semantically similar teams
4. Results ranked by cosine similarity (0-100 score)
5. Fallback to simple tag-overlap if no embeddings exist

**Example:**

**Participant skills:** `["Python", "Machine Learning", "MongoDB"]`

**Recommended Teams:**
1. **Data Wizards** (Match: 87%) - Looking for: `["Python", "Data Science", "Vector Search"]`
2. **AI Builders** (Match: 82%) - Looking for: `["ML Engineering", "Databases", "Backend"]`
3. **Full Stack Crew** (Match: 65%) - Looking for: `["React", "Python", "MongoDB"]`

**Why it's better than tags:**
- "Machine Learning" matches "ML Engineering" and "Data Science" semantically
- Understands context: "MongoDB" relates to "Databases" and "Vector Search"
- Works across different naming conventions

**Infrastructure Required:**
- MongoDB Atlas M10+ cluster
- Atlas Vector Search indexes (see [Vector Search Setup](/docs/ai/vector-search))

**Cost:** ~$0.0001 per participant/team embedding

[Learn more about Team Matching →](/docs/ai/team-matching)

---

## Infrastructure

### OpenAI Integration

**Models Used:**
- `gpt-4-turbo` - Text generation (summaries, feedback)
- `text-embedding-3-small` - Vector embeddings (cheapest, 1536 dimensions)

**API Configuration:**
```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate summary
const summary = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [
    { role: "system", content: "You are summarizing hackathon projects..." },
    { role: "user", content: projectDetails }
  ],
  max_tokens: 150,
  temperature: 0.6,
});

// Generate embedding
const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: skillsText,
});
```

### MongoDB Atlas Vector Search

**Collections with Embeddings:**
- `participants` - `skillsEmbedding` (1536 dimensions)
- `teams` - `desiredSkillsEmbedding` (1536 dimensions)
- `projects` - `descriptionEmbedding` (1536 dimensions) - optional

**Vector Search Indexes Required:**

```javascript
// Index 1: participant_skills_vector
{
  "type": "vectorSearch",
  "fields": [{
    "type": "vector",
    "path": "skillsEmbedding",
    "numDimensions": 1536,
    "similarity": "cosine"
  }]
}

// Index 2: team_skills_vector
{
  "type": "vectorSearch",
  "fields": [{
    "type": "vector",
    "path": "desiredSkillsEmbedding",
    "numDimensions": 1536,
    "similarity": "cosine"
  }]
}
```

[Learn how to create vector indexes →](/docs/ai/vector-search)

---

## Cost Analysis

### Per 100-Project Hackathon

| Feature | API Calls | Cost |
|---------|-----------|------|
| Project Summaries | 100 | $1-2 |
| Feedback Synthesis | 100 | $3-5 |
| Team Embeddings | 50 teams | $0.001 |
| Participant Embeddings | 200 people | $0.004 |
| **Total** | | **$5-10** |

**Compared to manual work:**
- Judge time saved: 5-8 hours ($500-800 value at $100/hr)
- Organizer time saved: 10+ hours ($1,000+ value)
- **ROI: 100-200x**

### Cost Optimization Tips

1. **Cache embeddings** - Don't regenerate if skills don't change
2. **Batch API calls** - Use OpenAI batch endpoints when possible
3. **Set token limits** - 150 tokens for summaries, 500 for feedback
4. **Monitor usage** - Set OpenAI billing alerts at $20 soft limit

---

## Monitoring & Alerts

### OpenAI Usage Dashboard

Monitor API usage:
1. Go to [OpenAI Platform](https://platform.openai.com/usage)
2. Check daily usage graph
3. Set billing limits

**Recommended limits:**
- Soft limit: $20/month
- Hard limit: $50/month

### Application Logs

Check AI feature health:

```bash
# View AI service logs
tail -f logs/ai-service.log

# Check for errors
grep "OpenAI" logs/error.log | tail -20

# Monitor summary generation rate
grep "generateProjectSummary" logs/app.log | wc -l
```

### Database Monitoring

Verify embeddings are being generated:

```javascript
// Check embedding coverage
db.participants.countDocuments({ skillsEmbedding: { $exists: true } })
db.teams.countDocuments({ desiredSkillsEmbedding: { $exists: true } })
db.projects.countDocuments({ aiSummary: { $exists: true } })
```

---

## Troubleshooting

### AI Summary Not Generating

**Symptom:** Project submitted but `aiSummary` field is null after 60 seconds

**Possible causes:**
1. Invalid OpenAI API key
2. Rate limit exceeded
3. Network/timeout error
4. Insufficient tokens on OpenAI account

**Debug steps:**
```bash
# Check API key is set
echo $OPENAI_API_KEY

# Test OpenAI connectivity
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check application logs
grep "generateProjectSummary" logs/app.log | tail -5
```

**Solution:**
- Verify API key in `.env.local`
- Check OpenAI usage limits
- Retry: Click "Regenerate Summary" (admin only)

---

### Vector Search Not Finding Teams

**Symptom:** "No recommended teams" despite many teams existing

**Possible causes:**
1. Atlas Vector Search indexes not created
2. Embeddings not generated
3. Cluster tier too low (requires M10+)

**Debug steps:**
```javascript
// Check if embeddings exist
db.participants.findOne({ skillsEmbedding: { $exists: true } })
db.teams.findOne({ desiredSkillsEmbedding: { $exists: true } })

// Test vector search query
db.teams.aggregate([{
  $vectorSearch: {
    index: "team_skills_vector",
    path: "desiredSkillsEmbedding",
    queryVector: [...], // 1536-dimension array
    numCandidates: 100,
    limit: 10
  }
}])
```

**Solution:**
1. Create vector indexes (see [Vector Search Setup](/docs/ai/vector-search))
2. Verify M10+ cluster
3. Regenerate embeddings if needed

---

### High OpenAI Costs

**Symptom:** Monthly bill higher than expected

**Causes:**
- Regenerating summaries unnecessarily
- Large token limits on summaries/feedback
- Too many embedding regenerations

**Solutions:**
1. Check for duplicate API calls in logs
2. Reduce `max_tokens` (150 for summaries is sufficient)
3. Cache embeddings (don't regenerate on every update)
4. Set billing alerts on OpenAI dashboard

---

## Future AI Features (Roadmap)

### Tier 3: Advanced Features

- **RAG-powered judging context** - Pull in event rules, past winners as context
- **Award recommendations** - Suggest creative award categories beyond 1st/2nd/3rd
- **Real-time chat moderation** - AI-powered suggestions for team blockers
- **Project similarity detection** - Find duplicates or overly similar ideas
- **Automated tech stack extraction** - Parse GitHub repos to detect technologies

### Model Upgrades

- GPT-4o for faster, cheaper summaries
- Custom fine-tuned models for feedback generation
- Multimodal analysis (screenshots, demo videos)

---

## Next Steps

- [Set up Vector Search indexes](/docs/ai/vector-search)
- [Configure project summary generation](/docs/ai/project-summaries)
- [Enable feedback synthesis](/docs/ai/feedback-synthesis)
- [Test team matching](/docs/ai/team-matching)
