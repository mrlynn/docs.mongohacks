---
sidebar_position: 4
---

# Feedback Synthesis

AI-powered synthesis of judge feedback into constructive team guidance using GPT-4.

## Overview

After judging concludes, MongoHacks uses GPT-4 to synthesize all judge scores and comments into comprehensive, actionable feedback for each team.

**Purpose:**
- Combine multiple judge perspectives
- Provide balanced, constructive feedback
- Highlight both strengths and improvements
- Encourage teams with positive tone

**Example:**
> **Strengths:**
> Your project demonstrates strong technical execution, particularly in the integration of MongoDB Atlas Vector Search with the GPT-4 API. Judges consistently praised the innovation in applying RAG to documentation search (average 8/10), noting the practical value and real-world applicability.
>
> **Areas for Improvement:**
> To strengthen this further, consider adding more robust error handling for edge cases and expanding the dataset beyond MongoDB docs to demonstrate broader applicability. The presentation was excellent overall, though one judge suggested more detailed setup instructions in the README.
>
> **Summary:**
> Overall, this is a well-built project with clear potential for real-world use. Great work on the technical implementation and demo presentation!

---

## How It Works

### Trigger: Admin Action

**Admin generates feedback for all judged projects:**
```http
POST /api/admin/events/:eventId/generate-all-feedback
```

**Why manual trigger:**
- Organizers control timing (after all judging complete)
- Avoids generating feedback while judging still ongoing
- Allows review before publishing to teams
- One-time operation per event

---

### Collecting Judge Data

**Query all scores for a project:**
```typescript
async function getJudgeFeedbackData(projectId: string) {
  const project = await Project.findById(projectId)
    .populate('teamId', 'name members');
  
  const scores = await Score.find({ projectId })
    .populate('judgeId', 'name');
  
  // Calculate averages
  const avgScores = {
    innovation: average(scores.map(s => s.scores.innovation)),
    technical: average(scores.map(s => s.scores.technical)),
    impact: average(scores.map(s => s.scores.impact)),
    presentation: average(scores.map(s => s.scores.presentation))
  };
  
  // Collect comments
  const comments = scores
    .filter(s => s.comments && s.comments.trim())
    .map(s => ({
      judge: s.judgeId.name,
      comment: s.comments,
      scores: s.scores
    }));
  
  return {
    project,
    scores: avgScores,
    comments,
    judgeCount: scores.length
  };
}
```

---

### GPT-4 Synthesis

**Prompt engineering:**
```typescript
async function synthesizeFeedback(data: FeedbackData) {
  const prompt = `
You are synthesizing judge feedback for a hackathon project. Create 
constructive, encouraging feedback in 2-3 paragraphs.

Project: ${data.project.name}
Description: ${data.project.description}

Average Scores (out of 10):
- Innovation: ${data.scores.innovation.toFixed(1)}
- Technical: ${data.scores.technical.toFixed(1)}
- Impact: ${data.scores.impact.toFixed(1)}
- Presentation: ${data.scores.presentation.toFixed(1)}

Judge Comments:
${data.comments.map((c, i) => 
  `Judge ${i + 1}: ${c.comment}`
).join('\n')}

Total Judges: ${data.judgeCount}

Structure your response as:

**Strengths:**
[1-2 sentences highlighting what the team did well, referencing 
specific scores and comments. Be specific about technical achievements.]

**Areas for Improvement:**
[1-2 sentences with constructive suggestions based on lower scores 
or judge comments. Focus on actionable advice.]

**Summary:**
[1 sentence encouraging conclusion emphasizing the team's accomplishments 
and potential.]

Tone: Professional, constructive, encouraging. Avoid generic praise. 
Be specific and reference actual scores/comments.
`.trim();

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { 
        role: "system", 
        content: "You are a constructive feedback synthesizer for hackathon projects."
      },
      { role: "user", content: prompt }
    ],
    max_tokens: 400,
    temperature: 0.5  // Balanced creativity/consistency
  });
  
  const feedback = response.choices[0].message.content;
  
  // Store in project
  await Project.findByIdAndUpdate(data.project._id, {
    aiFeedback: feedback,
    feedbackGeneratedAt: new Date()
  });
  
  return feedback;
}
```

---

## Feedback Structure

### Three-Part Format

**1. Strengths (1-2 sentences):**
- What they did well
- Reference specific high scores
- Mention judge praise
- Technical achievements

**Example:**
> "Your project demonstrates strong technical execution, particularly in the integration of MongoDB Atlas Vector Search with the GPT-4 API, earning consistent high marks across judges (average 8.3/10 technical). The innovation in applying RAG to documentation search was widely appreciated (average 8/10), with judges noting the practical value of the solution."

---

**2. Areas for Improvement (1-2 sentences):**
- Constructive suggestions
- Based on lower scores or comments
- Actionable advice (not vague)
- Specific technical points

**Example:**
> "To strengthen this further, consider adding more robust error handling for edge cases and expanding the dataset beyond MongoDB docs to demonstrate broader applicability. The presentation was excellent overall, though one judge suggested more detailed setup instructions in the README."

---

**3. Summary (1 sentence):**
- Encouraging conclusion
- Emphasize accomplishment
- Positive forward-looking

**Example:**
> "Overall, this is a well-built project with clear potential for real-world use. Great work on the technical implementation and demo presentation!"

---

## Feedback Quality

### Good Feedback Example

✅ **High quality:**
> **Strengths:**
> The judges were impressed by your creative use of WebSockets and MongoDB Change Streams for real-time collaboration (technical: 9.2/10). Your operational transformation algorithm demonstrates deep understanding of distributed systems, and the demo was well-executed with clear documentation.
>
> **Areas for Improvement:**
> Consider adding conflict resolution for simultaneous edits to the same line, which one judge noted as a potential edge case. The impact score (6.8/10) could be increased by demonstrating use cases beyond code editing, such as collaborative document editing or whiteboarding.
>
> **Summary:**
> This is a technically sophisticated project with strong foundations—excellent work on tackling a challenging problem in distributed systems!

**Why good:**
- Specific praise (Change Streams, OT algorithm)
- References actual scores (9.2/10, 6.8/10)
- Actionable improvements (conflict resolution, use cases)
- Encouraging tone without being generic

---

### Poor Feedback Example

❌ **Low quality:**
> **Strengths:**
> Great job on your project! The judges really liked it and thought you did well. Keep up the good work!
>
> **Areas for Improvement:**
> Maybe try to make it even better next time. Some judges had a few suggestions but overall it was good.
>
> **Summary:**
> Nice work, keep building cool stuff!

**Why bad:**
- Generic praise ("great job", "did well")
- No specific references to scores or comments
- Vague improvements ("make it better")
- Doesn't help team understand what to improve

---

## Batch Generation

### Admin Endpoint

**Generate feedback for all projects:**
```typescript
// POST /api/admin/events/:eventId/generate-all-feedback
async function generateAllFeedback(eventId: string) {
  // Find all judged projects without feedback
  const projects = await Project.find({
    eventId,
    status: { $in: ['submitted', 'under_review', 'judged'] }
  });
  
  // Filter: must have at least 1 score
  const scoreCounts = await Score.aggregate([
    { $match: { projectId: { $in: projects.map(p => p._id) } } },
    { $group: { _id: '$projectId', count: { $sum: 1 } } }
  ]);
  
  const projectsWithScores = projects.filter(p =>
    scoreCounts.some(s => 
      s._id.equals(p._id) && s.count > 0
    )
  );
  
  const results = {
    total: projectsWithScores.length,
    success: 0,
    skipped: 0,
    failed: 0,
    errors: []
  };
  
  for (const project of projectsWithScores) {
    try {
      // Skip if already has feedback
      if (project.aiFeedback) {
        results.skipped++;
        continue;
      }
      
      const data = await getJudgeFeedbackData(project._id);
      
      // Skip if no comments (nothing to synthesize)
      if (data.comments.length === 0) {
        results.skipped++;
        continue;
      }
      
      await synthesizeFeedback(data);
      results.success++;
      
      // Rate limit: 1 per second
      await new Promise(r => setTimeout(r, 1000));
      
    } catch (err) {
      results.failed++;
      results.errors.push({
        projectId: project._id,
        projectName: project.name,
        error: err.message
      });
    }
  }
  
  return results;
}
```

**Response:**
```json
{
  "success": true,
  "message": "Generated feedback for 42 projects",
  "data": {
    "total": 50,
    "success": 42,
    "skipped": 6,
    "failed": 2,
    "errors": [
      {
        "projectId": "abc123",
        "projectName": "Project X",
        "error": "OpenAI rate limit exceeded"
      }
    ]
  }
}
```

---

### Admin UI

**Trigger from admin results page:**
```tsx
const [generating, setGenerating] = useState(false);
const [results, setResults] = useState(null);

const handleGenerateFeedback = async () => {
  setGenerating(true);
  
  const response = await fetch(
    `/api/admin/events/${eventId}/generate-all-feedback`,
    { method: 'POST' }
  );
  
  const data = await response.json();
  setResults(data.data);
  setGenerating(false);
  
  // Show success message
  enqueueSnackbar(
    `Generated feedback for ${data.data.success} projects!`,
    { variant: 'success' }
  );
};

return (
  <Button
    variant="contained"
    onClick={handleGenerateFeedback}
    disabled={generating}
    startIcon={generating ? <CircularProgress size={20} /> : <AutoAwesome />}
  >
    {generating ? 'Generating Feedback...' : 'Generate AI Feedback'}
  </Button>
);
```

**Results display:**
```tsx
{results && (
  <Alert severity="success" sx={{ mt: 2 }}>
    <AlertTitle>Feedback Generation Complete</AlertTitle>
    <Typography variant="body2">
      ✓ Success: {results.success} projects<br />
      ⊘ Skipped: {results.skipped} projects (already had feedback)<br />
      ✗ Failed: {results.failed} projects
    </Typography>
    
    {results.errors.length > 0 && (
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="error">
          Errors:
        </Typography>
        <ul>
          {results.errors.map(err => (
            <li key={err.projectId}>
              {err.projectName}: {err.error}
            </li>
          ))}
        </ul>
      </Box>
    )}
  </Alert>
)}
```

---

## Team View

### Display on Project Page

**Feedback visible to team members:**
```tsx
{project.aiFeedback && (
  <Card sx={{ mt: 3, border: '1px solid #00ED64' }}>
    <CardHeader
      avatar={<AutoAwesome sx={{ color: '#00ED64' }} />}
      title="Judge Feedback"
      subheader="AI-synthesized from all judge comments"
    />
    <CardContent>
      <ReactMarkdown>
        {project.aiFeedback}
      </ReactMarkdown>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Based on {project.judgeCount} judge evaluations
      </Typography>
    </CardContent>
  </Card>
)}

{!project.aiFeedback && project.status === 'judged' && (
  <Alert severity="info" sx={{ mt: 3 }}>
    <AlertTitle>Feedback Coming Soon</AlertTitle>
    AI-synthesized feedback will be available shortly after judging concludes.
  </Alert>
)}
```

---

### Email Notification (Optional)

**Send feedback via email:**
```typescript
async function notifyTeamOfFeedback(projectId: string) {
  const project = await Project.findById(projectId)
    .populate({
      path: 'teamId',
      populate: { path: 'members', select: 'email name' }
    });
  
  const team = project.teamId;
  const emails = team.members.map(m => m.email);
  
  await sendEmail({
    to: emails,
    subject: `Feedback for ${project.name} - MongoHacks`,
    html: `
      <h2>Judge Feedback for ${project.name}</h2>
      <p>Hi ${team.name},</p>
      <p>Your project has been evaluated! Here's feedback from our judges:</p>
      
      <div style="border-left: 4px solid #00ED64; padding-left: 16px; margin: 20px 0;">
        ${marked(project.aiFeedback)}
      </div>
      
      <p>
        <a href="${process.env.NEXT_PUBLIC_URL}/events/${project.eventId}/projects/${project._id}">
          View full project details →
        </a>
      </p>
      
      <p>Thank you for participating!</p>
    `
  });
}
```

---

## Cost Analysis

### GPT-4 Turbo Pricing

**Per project:**
- Input: ~500-800 tokens (scores + comments)
- Output: ~300 tokens (feedback)
- **Cost: ~$0.03-0.05 per project**

**Example event (100 projects):**
```
100 projects × $0.04 avg = $4.00
```

**Large event (500 projects):**
```
500 projects × $0.04 = $20.00
```

**Compared to manual:**
- Manual: 5-10 min per project × 100 = 8-16 hours
- AI: ~2 minutes total
- **Time savings:** ~97%

---

## Performance

### Generation Time

**Typical workflow:**
```
1. Query scores/comments: 100-500ms
2. GPT-4 API call: 10-20 seconds
3. Store feedback: 50-100ms
Total: ~15 seconds per project
```

**Batch processing (100 projects):**
- Sequential: ~25 minutes (15s × 100)
- With 1s rate limit: ~28 minutes
- Parallel (batches of 5): ~8 minutes

**Admin sees:**
```
Generating feedback...
Progress: 42 / 100 (42%)
Estimated time remaining: 12 minutes
```

---

## Error Handling

### Graceful Degradation

**If feedback generation fails:**
1. Log error (don't block results)
2. Project shows "Feedback not available"
3. Teams can still see scores
4. Admin can retry manually

**Common errors:**

**No judge comments:**
```typescript
if (data.comments.length === 0) {
  // Skip synthesis, just use scores
  const feedback = `
**Scores:**
- Innovation: ${data.scores.innovation}/10
- Technical: ${data.scores.technical}/10
- Impact: ${data.scores.impact}/10
- Presentation: ${data.scores.presentation}/10

Your project received solid scores across all criteria. 
Keep building and refining your skills!
  `.trim();
  
  return feedback;
}
```

**OpenAI API error:**
```typescript
catch (err) {
  logger.error('Feedback synthesis failed', { projectId, err });
  
  // Store placeholder
  await Project.findByIdAndUpdate(projectId, {
    aiFeedback: 'Feedback synthesis failed. Please contact organizers.',
    feedbackError: err.message
  });
}
```

---

## Manual Override

### Admin Edit Feedback

**Admin can edit AI-generated feedback:**
```tsx
const [editing, setEditing] = useState(false);
const [feedback, setFeedback] = useState(project.aiFeedback);

const handleSave = async () => {
  await fetch(`/api/admin/projects/${projectId}/feedback`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aiFeedback: feedback })
  });
  
  setEditing(false);
  enqueueSnackbar('Feedback updated', { variant: 'success' });
};

return (
  <>
    {editing ? (
      <TextField
        fullWidth
        multiline
        rows={8}
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
      />
    ) : (
      <ReactMarkdown>{feedback}</ReactMarkdown>
    )}
    
    <Box sx={{ mt: 2 }}>
      {editing ? (
        <>
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={() => setEditing(false)}>Cancel</Button>
        </>
      ) : (
        <Button onClick={() => setEditing(true)}>Edit Feedback</Button>
      )}
    </Box>
  </>
);
```

**Use cases:**
- Fix AI hallucinations
- Add context AI missed
- Tone down harsh criticism
- Emphasize specific achievements

---

## Monitoring

### Track Feedback Quality

**Metrics:**
1. **Generation success rate** - % projects with feedback
2. **Team satisfaction** - post-event survey rating
3. **Actionability** - did teams understand what to improve?
4. **Length** - average word count (target: 100-200 words)

**Query:**
```javascript
// Feedback coverage
db.projects.aggregate([
  { $match: { status: 'judged' } },
  {
    $group: {
      _id: "$eventId",
      total: { $sum: 1 },
      withFeedback: {
        $sum: { $cond: [{ $gt: ["$aiFeedback", null] }, 1, 0] }
      }
    }
  },
  {
    $project: {
      coverage: { 
        $multiply: [
          { $divide: ["$withFeedback", "$total"] }, 
          100
        ]
      }
    }
  }
]);
```

**Expected:** 90%+ coverage (some projects may have no scores/comments)

---

## Prompt Tuning

### Iterative Improvement

**Track feedback quality issues:**
```typescript
// Log feedback for review
await logFeedback({
  projectId,
  feedback,
  scores: data.scores,
  commentCount: data.comments.length,
  timestamp: new Date()
});
```

**A/B test prompts:**
```typescript
const FEEDBACK_PROMPTS = {
  v1: standardPrompt,
  v2: emphasizeTechnicalPrompt,
  v3: encouragingPrompt
};

// Randomly assign version
const version = Math.random() < 0.5 ? 'v1' : 'v2';
const prompt = FEEDBACK_PROMPTS[version];
```

**Measure:**
- Team satisfaction scores
- Feedback helpfulness rating
- Re-read rate (do teams come back?)

---

## Best Practices

### For Organizers

**Timing:**
- Generate after all judging complete
- Review sample before sending to teams
- Allow 1-2 days for manual edits
- Send notification email

**Quality control:**
- Spot-check 5-10 feedbacks
- Edit any harsh/unhelpful comments
- Ensure tone is constructive
- Verify technical accuracy

**Communication:**
- Announce when feedback available
- Link to project pages
- Encourage teams to apply learnings

---

### For Judges

**Writing good comments:**
- Be specific ("improve error handling" not "fix bugs")
- Reference code/demo ("the React state management...")
- Suggest concrete next steps
- Balance criticism with praise

**What AI uses:**
- Your written comments
- Your scores (which areas scored low?)
- Overall tone

**Impact:**
- Good comments → good AI synthesis
- Vague comments → generic AI feedback

---

## Troubleshooting

### Feedback Not Generated

**Symptoms:**
- `aiFeedback` field is null
- Admin sees "0 success" after batch generation

**Causes:**
1. No judge scores for project
2. No judge comments (only scores)
3. OpenAI API error
4. Project status not "judged"

**Debug:**
```javascript
// Check project has scores
db.scores.countDocuments({ projectId: ObjectId('...') });
// Should be > 0

// Check for comments
db.scores.find({ projectId: ObjectId('...') }, { comments: 1 });
// At least one should have comments

// Check project status
db.projects.findOne({ _id: ObjectId('...') }, { status: 1 });
// Should be 'submitted' or 'judged'
```

---

### Poor Quality Feedback

**Symptoms:**
- Generic/vague praise
- Missing specific technical points
- Doesn't reference judge comments

**Causes:**
- Judge comments were vague
- Prompt doesn't emphasize specificity
- GPT-4 temperature too high

**Solutions:**
1. **Improve judge comments** - train judges to be specific
2. **Tune prompt** - emphasize technical detail
3. **Regenerate** - sometimes retry produces better output
4. **Manual edit** - admin override for critical projects

---

## Next Steps

- [Configure OpenAI API key](/docs/getting-started/configuration#openai-api-key)
- [Understand judging workflow](/docs/features/judging)
- [Generate batch feedback](/docs/admin/events#generate-feedback)
- [View team feedback](/docs/features/projects#judge-feedback)
