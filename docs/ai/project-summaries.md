---
sidebar_position: 3
---

# Project Summaries

AI-generated project summaries using GPT-4 to help judges quickly understand projects.

## Overview

When teams submit projects, MongoHacks automatically generates concise 2-3 sentence summaries using GPT-4 Turbo.

**Purpose:**
- Save judges 3-5 minutes per project
- Highlight key technologies and innovations
- Provide consistent overview format
- Enable faster scoring

**Example:**
> "This project builds a retrieval-augmented generation (RAG) chatbot using MongoDB Atlas Vector Search and OpenAI's GPT-4 to answer questions about MongoDB documentation. The system embeds documentation chunks and retrieves relevant context before generating responses. Built with Python, LangChain, and a Next.js frontend."

---

## How It Works

### Trigger: Project Submission

**Fire-and-forget on submit:**
```typescript
// When team submits project
async function submitProject(projectId: string) {
  const project = await Project.findByIdAndUpdate(
    projectId,
    { status: 'submitted', submittedAt: new Date() }
  );
  
  // Trigger AI summary (async, don't wait)
  generateProjectSummary(project._id)
    .catch(err => logger.error('Summary generation failed', err));
  
  // Return immediately
  return { success: true, project };
}
```

**Why fire-and-forget:**
- Don't block submission (&lt;500ms response)
- Summaries typically ready in 10-30 seconds
- Graceful degradation if fails
- Judges still have full description

---

### GPT-4 Summary Generation

**Prompt engineering:**
```typescript
async function generateProjectSummary(projectId: string) {
  const project = await Project.findById(projectId);
  
  const prompt = `
You are a hackathon judge assistant. Generate a concise 2-3 sentence 
summary of this project that highlights:
1. What the project does (core functionality)
2. Key technologies used
3. Novel or innovative aspects

Project Details:
- Name: ${project.name}
- Description: ${project.description}
- Technologies: ${project.technologies.join(', ')}
- Innovations: ${project.innovations || 'N/A'}
- Category: ${project.category}

Write a clear, factual summary that helps judges quickly understand 
the project. Focus on technical substance, not marketing language.
`.trim();

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: "You are a technical summarizer for hackathon projects." },
      { role: "user", content: prompt }
    ],
    max_tokens: 200,
    temperature: 0.3  // Lower = more factual
  });
  
  const summary = response.choices[0].message.content;
  
  // Store in project
  project.aiSummary = summary;
  await project.save();
  
  return summary;
}
```

**Prompt design principles:**
- Clear instructions (2-3 sentences)
- Specific structure (what/how/why)
- Factual tone (not marketing)
- Focus on substance (tech, innovation)

---

## Summary Display

### Judging Interface

**Green-bordered alert in scoring page:**
```tsx
{project.aiSummary && (
  <Alert severity="info" icon={<AutoAwesome />} sx={{ 
    mb: 3, 
    borderLeft: '4px solid #00ED64',  // Spring Green
    backgroundColor: 'rgba(0, 237, 100, 0.1)'
  }}>
    <AlertTitle>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesome fontSize="small" />
        <strong>AI Project Summary</strong>
      </Box>
    </AlertTitle>
    {project.aiSummary}
  </Alert>
)}

{!project.aiSummary && (
  <Alert severity="warning" sx={{ mb: 3 }}>
    <AlertTitle>Summary Generating...</AlertTitle>
    AI summary is being generated. Please review the full description below.
  </Alert>
)}
```

**Visual design:**
- 🤖 Robot icon (AI indicator)
- Green accent (Spring Green brand color)
- Subtle background tint
- Above full description

---

### Project Detail Page

**Summary shown to all viewers:**
```tsx
<Card sx={{ mb: 3 }}>
  <CardContent>
    <Typography variant="overline" color="text.secondary">
      Quick Overview
    </Typography>
    <Typography variant="body1" paragraph>
      {project.aiSummary || project.description.substring(0, 200) + '...'}
    </Typography>
    {project.aiSummary && (
      <Chip 
        icon={<AutoAwesome />} 
        label="AI-Generated" 
        size="small" 
        color="primary" 
        variant="outlined"
      />
    )}
  </CardContent>
</Card>
```

**Fallback:** If no AI summary, show first 200 chars of description

---

## Summary Quality

### Good Summary Example

✅ **High quality:**
> "This project implements a real-time collaborative code editor using WebSockets and MongoDB Change Streams for synchronization. The system uses operational transformation (OT) to handle concurrent edits and maintain consistency across clients. Built with Node.js, React, and Monaco Editor, with MongoDB storing document versions and user cursors."

**Why good:**
- States core functionality (collaborative code editor)
- Explains technical approach (OT, Change Streams)
- Lists key technologies
- Mentions novel aspects (real-time sync)

---

### Poor Summary Example

❌ **Low quality:**
> "This is an amazing project that revolutionizes how developers work together. It's super fast and easy to use, with cutting-edge AI technology that makes collaboration seamless. Perfect for remote teams!"

**Why bad:**
- Marketing fluff ("amazing", "revolutionizes")
- Vague claims ("cutting-edge AI")
- No technical details
- Doesn't explain what it actually does

---

### Summary Guidelines (for GPT)

**Do:**
- Focus on functionality ("does X", "enables Y")
- Mention specific technologies (MongoDB, React, Python)
- Explain technical approach (RAG, vector search, OT)
- Highlight innovation (novel use of X, first Y)
- Use concrete language

**Don't:**
- Use marketing language ("revolutionary", "game-changing")
- Make subjective claims ("best", "easiest")
- Be vague ("advanced tech", "powerful features")
- Editorialize ("impressive", "clever")
- Exceed 3 sentences

---

## Cost Analysis

### GPT-4 Turbo Pricing

**Per project:**
- Input: ~300 tokens (project details)
- Output: ~100 tokens (summary)
- Cost: ~$0.01-0.02 per summary

**Example event (100 projects):**
```
100 projects × $0.015 avg = $1.50
```

**Large event (500 projects):**
```
500 projects × $0.015 = $7.50
```

**Optimization:**
- Use GPT-4-turbo (cheaper than GPT-4)
- Set max_tokens=200 (prevent runaway)
- Cache common summaries (same project resubmitted)

---

## Performance

### Generation Time

**Typical latency:**
- API call: 5-15 seconds
- Network overhead: 1-3 seconds
- **Total: 10-30 seconds**

**Optimization:**
```typescript
// Add timeout to prevent hanging
const response = await Promise.race([
  openai.chat.completions.create({ /* ... */ }),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 30000)
  )
]);
```

**Retry logic:**
```typescript
async function generateWithRetry(projectId: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateProjectSummary(projectId);
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
}
```

---

## Error Handling

### Graceful Degradation

**If summary generation fails:**
1. Log error (don't alert user)
2. Project stays in `submitted` state
3. Judges see "Summary Generating..." message
4. Full description still available
5. Doesn't block judging

**Error types:**

**OpenAI API down:**
```typescript
catch (err) {
  if (err.status === 503) {
    logger.warn('OpenAI API unavailable, will retry');
    // Queue for retry in 5 minutes
    scheduleRetry(projectId, Date.now() + 300000);
  }
}
```

**Rate limit hit:**
```typescript
catch (err) {
  if (err.status === 429) {
    logger.warn('OpenAI rate limit, backing off');
    // Exponential backoff
    await new Promise(r => setTimeout(r, 60000));
    return generateProjectSummary(projectId);
  }
}
```

**Invalid API key:**
```typescript
catch (err) {
  if (err.status === 401) {
    logger.error('OpenAI API key invalid!');
    // Alert admin, disable feature
    await sendAdminAlert('OpenAI API key invalid');
  }
}
```

---

## Manual Regeneration

### Admin Control

**Trigger regeneration:**
```typescript
// POST /api/admin/projects/:projectId/regenerate-summary
async function regenerateSummary(projectId: string) {
  const project = await Project.findById(projectId);
  
  // Clear old summary
  project.aiSummary = null;
  await project.save();
  
  // Generate new one
  const summary = await generateProjectSummary(projectId);
  
  return { success: true, summary };
}
```

**Use cases:**
- Poor quality summary
- Project updated significantly
- Testing prompt changes
- Recovering from initial failure

**UI:**
```tsx
<Button 
  variant="outlined" 
  onClick={handleRegenerate}
  disabled={loading}
>
  {loading ? 'Regenerating...' : 'Regenerate Summary'}
</Button>
```

---

## Batch Generation

### For All Projects

**Admin endpoint:**
```http
POST /api/admin/events/:eventId/generate-all-summaries
```

**Implementation:**
```typescript
async function generateAllSummaries(eventId: string) {
  const projects = await Project.find({
    eventId,
    status: 'submitted',
    aiSummary: { $exists: false }
  });
  
  const results = {
    total: projects.length,
    success: 0,
    failed: 0,
    errors: []
  };
  
  // Process in batches of 5 (avoid rate limits)
  for (let i = 0; i < projects.length; i += 5) {
    const batch = projects.slice(i, i + 5);
    
    await Promise.allSettled(
      batch.map(async (project) => {
        try {
          await generateProjectSummary(project._id.toString());
          results.success++;
        } catch (err) {
          results.failed++;
          results.errors.push({ 
            projectId: project._id, 
            error: err.message 
          });
        }
      })
    );
    
    // Rate limit backoff (5 per minute)
    if (i + 5 < projects.length) {
      await new Promise(r => setTimeout(r, 12000));
    }
  }
  
  return results;
}
```

**Use when:**
- Event just concluded (submissions closed)
- Many projects missing summaries
- Recovering from API outage
- Testing new prompt

---

## Monitoring

### Track Summary Quality

**Metrics:**
1. **Generation success rate** - % of projects with summaries
2. **Average generation time** - median latency
3. **Error rate** - failures per 100 requests
4. **Judge feedback** - do summaries help?

**Dashboard query:**
```javascript
// Summary coverage by event
db.projects.aggregate([
  { $match: { status: 'submitted' } },
  {
    $group: {
      _id: "$eventId",
      total: { $sum: 1 },
      withSummary: {
        $sum: { $cond: [{ $gt: ["$aiSummary", null] }, 1, 0] }
      }
    }
  },
  {
    $project: {
      total: 1,
      withSummary: 1,
      coverage: { 
        $multiply: [
          { $divide: ["$withSummary", "$total"] }, 
          100
        ]
      }
    }
  }
]);

// Expected output:
// { _id: eventId, total: 50, withSummary: 48, coverage: 96.0 }
```

---

## Prompt Tuning

### A/B Testing Prompts

**Test different prompts:**
```typescript
const PROMPTS = {
  v1: "Generate a 2-3 sentence summary...",
  v2: "Write a technical overview in 2-3 sentences focusing on architecture...",
  v3: "Summarize this hackathon project emphasizing innovation..."
};

async function generateWithPromptVersion(project, version = 'v1') {
  const prompt = PROMPTS[version].replace(
    '{{project}}', 
    JSON.stringify(project, null, 2)
  );
  
  // ... rest of generation
}
```

**Track which produces better results:**
- Judge feedback scores
- Summary length distribution
- Technical depth rating

---

## Future Enhancements

### Planned Features

**1. Multi-lingual summaries:**
```typescript
// Generate summary in event's primary language
const language = event.language || 'en';
const prompt = `Generate summary in ${language}...`;
```

**2. Category-specific prompts:**
```typescript
const categoryPrompts = {
  'AI/ML': 'Focus on model architecture and training approach...',
  'Web App': 'Emphasize user experience and technical stack...',
  'Mobile': 'Highlight cross-platform approach and native features...'
};
```

**3. Comparative summaries:**
> "Similar to project X, but uses Y instead of Z. Novel approach to ABC."

**4. Judge-specific summaries:**
- Technical judge: deep dive on architecture
- Business judge: focus on impact and market
- Design judge: emphasize UX and accessibility

**5. Video transcript summarization:**
```typescript
// Extract transcript from video URL
const transcript = await extractYouTubeTranscript(project.videoUrl);
// Generate summary from both description + transcript
```

---

## Best Practices

### For Organizers

**Configuration:**
- Enable summaries for events >50 projects
- Disable for small events (not worth cost)
- Monitor generation success rate
- Review quality periodically

**Prompt maintenance:**
- Update prompts quarterly
- A/B test changes
- Collect judge feedback
- Document prompt versions

---

### For Teams

**To get better summaries:**
- Write clear, technical descriptions
- Fill "innovations" field
- List specific technologies
- Explain how it works, not just what it does

**Poor description:**
> "We built a cool app that helps people. It's really fast and uses AI."

**Good description:**
> "We built a real-time collaborative code editor using MongoDB Change Streams for synchronization. The system uses operational transformation to handle concurrent edits. Built with Node.js, React, and Monaco Editor."

---

## Troubleshooting

### Summary Not Appearing

**Check:**
1. Project status = "submitted"?
2. Time since submission (<5 min = still generating)
3. OpenAI API key configured?
4. Check logs for errors

**Debug:**
```javascript
// Check project
db.projects.findOne({ _id: projectId }, { aiSummary: 1, status: 1, submittedAt: 1 });

// Should show:
// { aiSummary: "...", status: "submitted", submittedAt: ISODate(...) }

// If aiSummary is null and submittedAt is >10 min ago, generation failed
```

**Manual fix:**
```bash
# Admin panel: click "Regenerate Summary"
# Or via API:
curl -X POST http://localhost:3002/api/admin/projects/PROJECT_ID/regenerate-summary \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

### Summary Quality Issues

**Symptoms:**
- Too vague ("This project uses cutting-edge technology...")
- Too long (>5 sentences)
- Marketing language ("revolutionary", "game-changing")
- Missing key technologies

**Solutions:**
1. **Improve project description** - more technical detail
2. **Tune prompt** - emphasize factual, concise language
3. **Regenerate** - sometimes GPT produces better output on retry
4. **Manual edit** - admin can override aiSummary field

---

## Next Steps

- [Configure OpenAI API key](/docs/getting-started/configuration#openai-api-key)
- [Test summary generation](/docs/features/projects#ai-summary-generation)
- [View summaries in judging interface](/docs/features/judging#ai-project-summary)
- [Monitor generation success](/docs/admin/analytics)
