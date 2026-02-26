---
sidebar_position: 3
---

# Judge Management

Assign judges, manage assignments, and track judging progress.

## Overview

The judging system enables fair, distributed project evaluation with automated assignment and progress tracking.

**URL:** `/admin/events/[eventId]/judges`

**Access:** Admin and organizer roles

---

## Judge Roles

### Who Can Judge

**Three paths to becoming a judge:**

**1. Invited judges (most common):**
- Organizer invites via email
- Receives invitation link
- Creates account with judge role
- No participant access

**2. Promoted participants:**
- Existing user upgraded to judge
- Can both participate AND judge
- Useful for peer review
- Cannot judge own team's project

**3. Admin override:**
- Super admin assigns judge role
- Instant access
- No email confirmation needed

---

### Judge Account Creation

**Invitation flow:**
```tsx
<Dialog open={invitingJudge}>
  <DialogTitle>Invite Judge</DialogTitle>
  <DialogContent>
    <TextField
      label="Name"
      value={judgeName}
      onChange={e => setJudgeName(e.target.value)}
      fullWidth
      required
    />
    
    <TextField
      label="Email"
      type="email"
      value={judgeEmail}
      onChange={e => setJudgeEmail(e.target.value)}
      fullWidth
      required
    />
    
    <TextField
      label="Expertise"
      value={expertise}
      onChange={e => setExpertise(e.target.value)}
      fullWidth
      helperText="E.g., AI/ML, Frontend Development, Product Design"
    />
    
    <TextField
      label="Suggested Projects per Judge"
      type="number"
      value={projectsPerJudge}
      onChange={e => setProjectsPerJudge(parseInt(e.target.value))}
      inputProps={{ min: 1, max: 20 }}
      helperText="Recommended: 3-5 projects"
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setInvitingJudge(false)}>Cancel</Button>
    <Button onClick={handleSendInvitation} variant="contained">
      Send Invitation
    </Button>
  </DialogActions>
</Dialog>
```

**Invitation email:**
```html
Subject: You're invited to judge MongoHacks Spring 2026

Hi [Judge Name],

You've been invited to judge projects at MongoHacks Spring 2026.

Event: MongoHacks Spring 2026
Date: March 18, 2026
Projects to review: ~5 projects
Time commitment: ~1-2 hours

[Accept Invitation] button → Creates account + assigns judge role

Questions? Reply to this email.

Thanks,
MongoHacks Team
```

---

## Judge List

### All Judges View

**Judge roster:**

| Name | Email | Expertise | Assigned | Scored | Progress | Status | Actions |
|------|-------|-----------|----------|--------|----------|--------|---------|
| Sarah Johnson | sarah@example.com | AI/ML | 5 | 5 | ██████ 100% | ✅ Complete | [View] |
| Mark Chen | mark@example.com | Frontend | 5 | 3 | ████░░ 60% | 🟡 In Progress | [Remind] |
| Lisa Wong | lisa@example.com | Full-Stack | 5 | 0 | ░░░░░░ 0% | ⚪ Not Started | [Email] |

**Status indicators:**
- ✅ Complete (100%)
- 🟡 In Progress (1-99%)
- ⚪ Not Started (0%)
- 🔴 Overdue (deadline passed)

**Filters:**
- All judges
- Complete / Incomplete
- By expertise area
- By assignment count

---

### Judge Details

**Click judge name for details:**

```
Sarah Johnson (sarah@example.com)
Expertise: AI/ML, Machine Learning
Joined: March 1, 2026
Status: ✅ All projects scored

Assigned Projects (5):
1. RAG Chatbot (Team: Data Wizards) - Scored ✓
2. ML Pipeline (Team: AI Innovators) - Scored ✓
3. Computer Vision (Team: Vision Squad) - Scored ✓
4. NLP Tool (Team: Text Miners) - Scored ✓
5. Recommendation Engine (Team: RecSys) - Scored ✓

Average Scores Given:
- Innovation: 8.2/10
- Technical: 8.6/10
- Impact: 7.8/10
- Presentation: 8.4/10

Total Time Spent: 1h 42m
Avg per Project: 20 minutes
```

---

## Assignment Strategies

### Manual Assignment

**Assign individual projects:**
```tsx
<Card>
  <CardHeader title="Assign Projects to Sarah Johnson" />
  <CardContent>
    <Autocomplete
      multiple
      options={availableProjects}
      getOptionLabel={project => `${project.name} (${project.team.name})`}
      value={selectedProjects}
      onChange={(_, newValue) => setSelectedProjects(newValue)}
      renderInput={params => (
        <TextField {...params} label="Select Projects" />
      )}
    />
    
    <Button 
      variant="contained"
      onClick={handleAssign}
      sx={{ mt: 2 }}
    >
      Assign {selectedProjects.length} Projects
    </Button>
  </CardContent>
</Card>
```

**Use cases:**
- Expertise matching (AI judge → AI projects)
- Conflict avoidance (judge can't score own team)
- Workload balancing (some judges want more/less)

---

### Auto-Assignment

**Batch assign all judges:**
```tsx
<Card>
  <CardHeader title="Auto-Assign All Judges" />
  <CardContent>
    <Typography variant="body2" paragraph>
      Automatically distribute {projectCount} projects among {judgeCount} judges.
    </Typography>
    
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Projects per Judge</InputLabel>
      <Select 
        value={projectsPerJudge}
        onChange={e => setProjectsPerJudge(e.target.value)}
      >
        <MenuItem value={3}>3 projects each</MenuItem>
        <MenuItem value={5}>5 projects each (recommended)</MenuItem>
        <MenuItem value={10}>10 projects each</MenuItem>
        <MenuItem value="auto">Auto-calculate</MenuItem>
      </Select>
    </FormControl>
    
    <FormControlLabel
      control={
        <Checkbox 
          checked={expertiseMatch}
          onChange={e => setExpertiseMatch(e.target.checked)}
        />
      }
      label="Match judges to project categories"
    />
    
    <FormControlLabel
      control={
        <Checkbox 
          checked={avoidConflicts}
          onChange={e => setAvoidConflicts(e.target.checked)}
        />
      }
      label="Avoid judge-team conflicts"
    />
    
    <Button
      variant="contained"
      onClick={handleAutoAssign}
      disabled={assigning}
      fullWidth
    >
      {assigning ? 'Assigning...' : 'Auto-Assign All Projects'}
    </Button>
  </CardContent>
</Card>
```

---

### Auto-Assignment Algorithm

**Round-robin with constraints:**
```typescript
async function autoAssignJudges(eventId: string, options: AssignmentOptions) {
  const projects = await Project.find({ eventId, status: 'submitted' });
  const judges = await User.find({ role: 'judge' });
  
  const { projectsPerJudge, expertiseMatch, avoidConflicts } = options;
  
  // Calculate distribution
  const totalSlots = judges.length * projectsPerJudge;
  const duplicatesPerProject = Math.ceil(totalSlots / projects.length);
  
  // Shuffle projects for randomness
  const shuffled = shuffle(projects);
  
  const assignments = [];
  
  for (const project of shuffled) {
    let assignedCount = 0;
    
    for (const judge of judges) {
      // Check constraints
      if (avoidConflicts && hasConflict(judge, project)) continue;
      if (expertiseMatch && !matchesExpertise(judge, project)) continue;
      
      // Check capacity
      const currentLoad = await JudgeAssignment.countDocuments({
        judgeId: judge._id,
        eventId
      });
      
      if (currentLoad >= projectsPerJudge) continue;
      
      // Assign
      await JudgeAssignment.create({
        judgeId: judge._id,
        projectId: project._id,
        eventId,
        status: 'pending'
      });
      
      assignedCount++;
      if (assignedCount >= duplicatesPerProject) break;
    }
  }
  
  return { success: true, assigned: assignments.length };
}
```

**Conflict detection:**
```typescript
function hasConflict(judge: User, project: Project): boolean {
  // Judge is on the team
  if (project.team.members.includes(judge._id)) return true;
  
  // Judge is team leader
  if (project.team.leaderId.equals(judge._id)) return true;
  
  // Custom conflicts (organizer-defined)
  if (judge.conflictProjects?.includes(project._id)) return true;
  
  return false;
}
```

---

## Progress Tracking

### Assignment Status

**JudgeAssignment model:**
```typescript
interface JudgeAssignment {
  _id: ObjectId;
  judgeId: ObjectId → User;
  projectId: ObjectId → Project;
  eventId: ObjectId → Event;
  status: 'pending' | 'in_progress' | 'completed';
  assignedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number;  // minutes
}
```

**Status transitions:**
```
pending → Judge assigned, not yet viewed
  ↓
in_progress → Judge opened project detail
  ↓
completed → Judge submitted scores
```

---

### Progress Dashboard

**Real-time overview:**
```tsx
<Grid container spacing={3}>
  <Grid item xs={12} md={4}>
    <Card>
      <CardContent>
        <Typography color="text.secondary">Total Assignments</Typography>
        <Typography variant="h4">{totalAssignments}</Typography>
        <Typography variant="caption">
          {projectCount} projects × {judgeCount} judges
        </Typography>
      </CardContent>
    </Card>
  </Grid>
  
  <Grid item xs={12} md={4}>
    <Card>
      <CardContent>
        <Typography color="text.secondary">Completed</Typography>
        <Typography variant="h4">{completedCount}</Typography>
        <LinearProgress 
          variant="determinate"
          value={(completedCount / totalAssignments) * 100}
        />
      </CardContent>
    </Card>
  </Grid>
  
  <Grid item xs={12} md={4}>
    <Card>
      <CardContent>
        <Typography color="text.secondary">In Progress</Typography>
        <Typography variant="h4">{inProgressCount}</Typography>
        <Chip 
          label={`${pendingCount} pending`}
          size="small"
          variant="outlined"
        />
      </CardContent>
    </Card>
  </Grid>
</Grid>
```

---

### Per-Project Coverage

**How many judges per project:**

| Project | Team | Category | Judges Assigned | Scored | Coverage |
|---------|------|----------|-----------------|--------|----------|
| RAG Chatbot | Data Wizards | AI/ML | 4 | 4 | ████ 100% |
| Mobile App | Team Alpha | Mobile | 3 | 2 | ██░░ 67% |
| Data Viz | Team Beta | Web | 4 | 4 | ████ 100% |
| API Tool | Gamma | DevTools | 3 | 0 | ░░░░ 0% |

**Goal:** 3-5 judges per project for reliability

**Alert when:**
```tsx
{coverage < 3 && (
  <Alert severity="warning">
    Only {coverage} judges assigned. Recommended: 3-5 for fair scoring.
  </Alert>
)}
```

---

## Judge Communication

### Reminder Emails

**Send reminder to incomplete judges:**
```tsx
<Button
  variant="outlined"
  onClick={() => sendReminder(judge._id)}
  disabled={judge.progress === 100}
>
  Send Reminder
</Button>
```

**Reminder template:**
```html
Subject: Reminder: Please complete judging for MongoHacks

Hi [Judge Name],

You still have {pendingCount} projects to score for MongoHacks Spring 2026.

Your Assigned Projects:
✓ RAG Chatbot (scored)
✓ Mobile App (scored)
□ Data Viz Tool (pending)
□ API Gateway (pending)
□ ML Pipeline (pending)

Judging deadline: March 18, 2026 11:59 PM

[Go to Judging Dashboard]

Thank you for your time!
```

**Bulk reminder:**
```tsx
<Button
  variant="contained"
  onClick={handleBulkReminder}
  disabled={noIncompleteJudges}
>
  Remind All Incomplete Judges ({incompleteCount})
</Button>
```

---

### Thank You Messages

**After completion:**
```html
Subject: Thank you for judging MongoHacks!

Hi [Judge Name],

Thank you for completing all your assigned project reviews!

You scored 5 projects in 1h 42m. Your feedback will help teams improve and grow.

Results will be published on March 19, 2026.

[View Results] (when published)

We appreciate your contribution!

MongoHacks Team
```

---

## Scoring Metrics

### Judge Consistency

**Detect outlier judges:**
```typescript
// Calculate score distribution
const avgInnovation = allScores.reduce((sum, s) => sum + s.innovation, 0) / allScores.length;
const stdDevInnovation = calculateStdDev(allScores.map(s => s.innovation));

// Flag judges >2 standard deviations
for (const judge of judges) {
  const judgeAvg = calculateAverage(judge.scores);
  const deviation = Math.abs(judgeAvg - avgInnovation) / stdDevInnovation;
  
  if (deviation > 2) {
    console.warn(`Judge ${judge.name} is outlier: ${deviation.toFixed(2)} std devs`);
  }
}
```

**Visualization:**
```
Score Distribution by Judge

Sarah:    ▂▃▅▇█▇▅▃▂     (normal distribution)
Mark:     ▁▁▁▁▁▁▁▁█     (all high scores - inflate)
Lisa:     █▁▁▁▁▁▁▁▁     (all low scores - harsh)
          1 2 3 4 5 6 7 8 9 10
```

**Normalization (optional):**
```typescript
// Z-score normalization
function normalizeScores(scores: Score[], judgeId: ObjectId) {
  const judgeScores = scores.filter(s => s.judgeId.equals(judgeId));
  const mean = average(judgeScores.map(s => s.totalScore));
  const stdDev = calculateStdDev(judgeScores.map(s => s.totalScore));
  
  return judgeScores.map(s => ({
    ...s,
    normalizedScore: (s.totalScore - mean) / stdDev
  }));
}
```

---

### Time Tracking

**How long judges spend:**
```tsx
<Card>
  <CardHeader title="Judging Time Analysis" />
  <CardContent>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Judge</TableCell>
          <TableCell>Total Time</TableCell>
          <TableCell>Avg per Project</TableCell>
          <TableCell>Fastest</TableCell>
          <TableCell>Slowest</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Sarah</TableCell>
          <TableCell>1h 42m</TableCell>
          <TableCell>20 min</TableCell>
          <TableCell>12 min</TableCell>
          <TableCell>28 min</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Mark</TableCell>
          <TableCell>2h 15m</TableCell>
          <TableCell>27 min</TableCell>
          <TableCell>18 min</TableCell>
          <TableCell>35 min</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    
    <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
      Recommended: 15-25 minutes per project
    </Typography>
  </CardContent>
</Card>
```

**Alert on suspicious patterns:**
```tsx
{avgTime < 5 && (
  <Alert severity="warning">
    Judge completed scoring very quickly ({avgTime} min avg). 
    Review for quality.
  </Alert>
)}
```

---

## Conflict of Interest

### Declaring Conflicts

**Judge can self-report:**
```tsx
<Dialog open={declaringConflict}>
  <DialogTitle>Declare Conflict of Interest</DialogTitle>
  <DialogContent>
    <Typography variant="body2" paragraph>
      If you have a personal or professional relationship with a team,
      please declare it to ensure fair judging.
    </Typography>
    
    <Autocomplete
      options={assignedProjects}
      getOptionLabel={p => `${p.name} (${p.team.name})`}
      value={conflictProject}
      onChange={(_, newValue) => setConflictProject(newValue)}
      renderInput={params => <TextField {...params} label="Project" />}
    />
    
    <TextField
      label="Reason for Conflict"
      value={conflictReason}
      onChange={e => setConflictReason(e.target.value)}
      fullWidth
      multiline
      rows={3}
      placeholder="E.g., I work with a team member at my company"
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setDeclaringConflict(false)}>Cancel</Button>
    <Button onClick={handleDeclareConflict} variant="contained">
      Declare Conflict
    </Button>
  </DialogActions>
</Dialog>
```

**Admin reassignment:**
```typescript
// When conflict declared
async function handleConflict(assignmentId: string, reason: string) {
  const assignment = await JudgeAssignment.findById(assignmentId);
  
  // Mark as conflicted
  assignment.status = 'conflicted';
  assignment.conflictReason = reason;
  await assignment.save();
  
  // Find replacement judge
  const replacement = await findReplacementJudge(
    assignment.projectId,
    assignment.judgeId
  );
  
  if (replacement) {
    await JudgeAssignment.create({
      judgeId: replacement._id,
      projectId: assignment.projectId,
      eventId: assignment.eventId,
      status: 'pending'
    });
  }
  
  // Notify admin
  await notifyAdmin('Conflict declared, reassigned to replacement judge');
}
```

---

## Judge Performance

### Feedback Quality

**Track comment completeness:**
```typescript
interface JudgePerformance {
  judgeId: ObjectId;
  projectsScored: number;
  avgCommentLength: number;  // characters
  commentsProvided: number;  // count
  avgScoresGiven: {
    innovation: number;
    technical: number;
    impact: number;
    presentation: number;
  };
  timeSpent: number;  // minutes
  consistency: number;  // 0-1 score
}
```

**Quality score:**
```typescript
function calculateJudgeQuality(judge: JudgePerformance): number {
  let score = 0;
  
  // Comments provided (max 40 points)
  score += Math.min((judge.commentsProvided / judge.projectsScored) * 40, 40);
  
  // Comment length (max 30 points)
  const avgLength = judge.avgCommentLength;
  if (avgLength > 200) score += 30;
  else if (avgLength > 100) score += 20;
  else if (avgLength > 50) score += 10;
  
  // Time spent (max 30 points)
  const avgTime = judge.timeSpent / judge.projectsScored;
  if (avgTime >= 15 && avgTime <= 30) score += 30;
  else if (avgTime < 15) score += 10;  // too fast
  else score += 20;  // took long time
  
  return score;  // 0-100
}
```

---

## Best Practices

### Recruitment

**Judge sourcing:**
- Industry professionals (CTOs, senior engineers)
- University faculty (CS professors)
- MongoDB employees (Developer Advocates)
- Previous hackathon winners
- Startup founders

**Ideal judge count:**
```
Small event (<50 projects):  10-15 judges
Medium event (50-150):       20-30 judges
Large event (150+):          40+ judges

Projects per judge: 3-5 (optimal balance)
```

---

### Training

**Judge orientation:**
1. Send scoring rubric before event
2. Host 30-min training session
3. Explain what to look for
4. Practice scoring 1-2 sample projects
5. Q&A session

**Rubric clarity:**
```markdown
Innovation (1-10):
- 9-10: Novel approach, never seen before
- 7-8: Creative use of existing tech
- 5-6: Standard implementation
- 3-4: Derivative work
- 1-2: No innovation

Technical (1-10):
- Code quality, architecture, difficulty
...
```

---

### Deadline Management

**Set realistic timelines:**
- Projects due: 6:00 PM
- Judging window: 6:00 PM - 11:00 PM (5 hours)
- Results: Next morning

**Send reminders:**
- Start of judging: "Projects ready to score!"
- Halfway: "2.5 hours left"
- 1 hour left: "Final reminder"

---

## Troubleshooting

### Judge Can't Access Dashboard

**Check:**
1. Role = 'judge' in database?
2. Logged in correctly?
3. Projects assigned to them?

**Debug:**
```javascript
db.users.findOne({ email: 'judge@example.com' }, { role: 1 });
// Should show: { role: 'judge' }

db.judgeassignments.countDocuments({ judgeId: judgeId });
// Should be > 0
```

---

### Auto-Assignment Failed

**Common causes:**
- Not enough judges
- Too many conflicts
- Projects per judge too high

**Solution:**
```tsx
{autoAssignError && (
  <Alert severity="error">
    Auto-assignment failed: {autoAssignError}
    
    Suggestions:
    - Reduce projects per judge
    - Invite more judges
    - Disable conflict avoidance
  </Alert>
)}
```

---

## Next Steps

- [Understand judging criteria](/docs/features/judging)
- [View results and rankings](/docs/admin/events#results-management)
- [Generate AI feedback](/docs/ai/feedback-synthesis)
- [Export judge scores](/docs/admin/analytics)
