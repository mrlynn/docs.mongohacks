---
sidebar_position: 2
---

# Managing Events

Administrative controls for creating, editing, and managing hackathon events.

## Overview

Event management provides complete lifecycle control from creation through archival.

**URL:** `/admin/events`

**Access:** Admin and organizer roles

---

## Event List View

### All Events Table

**Filterable list:**

| Event | Status | Dates | Participants | Projects | Actions |
|-------|--------|-------|--------------|----------|---------|
| MongoHacks Spring | 🟢 Active | Mar 18, 2026 | 142/150 (95%) | 38 | [View] [Edit] [Delete] |
| AI/ML Hackathon | 🟡 Judging | Mar 15, 2026 | 89/100 (89%) | 67 | [View] [Edit] [Results] |
| Student Hack | 🔴 Concluded | Feb 20, 2026 | 56/75 (75%) | 42 | [View] [Archive] |
| Summer 2026 | ⚪ Draft | Jun 1, 2026 | 0/200 (0%) | 0 | [Edit] [Publish] |

**Status filters:**
- All events
- Draft
- Published (upcoming)
- Active (ongoing)
- Concluded (past)
- Archived

**Sort options:**
- Start date (soonest first)
- Name (A-Z)
- Participants (most first)
- Status

---

## Creating Events

### Step 1: Basic Information

**Required fields:**
```tsx
<TextField
  label="Event Name"
  value={name}
  onChange={e => setName(e.target.value)}
  fullWidth
  required
  helperText="E.g., MongoHacks Spring 2026"
/>

<TextField
  label="Slug"
  value={slug}
  onChange={e => setSlug(e.target.value)}
  fullWidth
  required
  helperText="URL: /events/{slug}"
  InputProps={{
    startAdornment: <InputAdornment>/events/</InputAdornment>
  }}
/>

<TextField
  label="Description"
  value={description}
  onChange={e => setDescription(e.target.value)}
  fullWidth
  multiline
  rows={4}
  required
  helperText="Event overview and goals"
/>
```

---

### Step 2: Dates & Times

**Date configuration:**
```tsx
<DateTimePicker
  label="Event Start"
  value={startDate}
  onChange={setStartDate}
  minDateTime={new Date()}
  required
/>

<DateTimePicker
  label="Event End"
  value={endDate}
  onChange={setEndDate}
  minDateTime={startDate}
  required
/>

<DateTimePicker
  label="Registration Deadline (Optional)"
  value={registrationDeadline}
  onChange={setRegistrationDeadline}
  maxDateTime={startDate}
/>

<DateTimePicker
  label="Submission Deadline (Optional)"
  value={submissionDeadline}
  onChange={setSubmissionDeadline}
  minDateTime={startDate}
  maxDateTime={endDate}
/>
```

**Timeline validation:**
```
Registration deadline  ≤  Event start  ≤  Submission deadline  ≤  Event end
    (optional)                             (optional)
```

---

### Step 3: Capacity & Settings

**Participant limits:**
```tsx
<TextField
  label="Maximum Participants"
  type="number"
  value={capacity}
  onChange={e => setCapacity(parseInt(e.target.value))}
  required
  inputProps={{ min: 1, max: 10000 }}
/>

<FormControlLabel
  control={
    <Checkbox 
      checked={enableWaitlist}
      onChange={e => setEnableWaitlist(e.target.checked)}
    />
  }
  label="Enable waitlist when full"
/>
```

**Team settings:**
```tsx
<FormControlLabel
  control={<Checkbox checked={requireTeams} />}
  label="Require teams (no solo projects)"
/>

<TextField
  label="Minimum Team Size"
  type="number"
  value={minTeamSize}
  inputProps={{ min: 1, max: maxTeamSize }}
/>

<TextField
  label="Maximum Team Size"
  type="number"
  value={maxTeamSize}
  inputProps={{ min: minTeamSize, max: 20 }}
/>
```

---

### Step 4: Features

**Enable/disable features:**
```tsx
<FormGroup>
  <FormControlLabel
    control={<Switch checked={enableAI} />}
    label="Enable AI Features (team matching, summaries, feedback)"
  />
  
  <FormControlLabel
    control={<Switch checked={enableJudging} />}
    label="Enable Judging Workflow"
  />
  
  <FormControlLabel
    control={<Switch checked={requireVideoDemo} />}
    label="Require Video Demo URL"
  />
  
  <FormControlLabel
    control={<Switch checked={allowSoloProjects} />}
    label="Allow Solo Projects"
  />
</FormGroup>
```

**AI feature requirements:**
```tsx
{enableAI && (
  <Alert severity="warning" sx={{ mt: 2 }}>
    <AlertTitle>AI Features Require:</AlertTitle>
    <ul>
      <li>OpenAI API key configured</li>
      <li>MongoDB Atlas M10+ cluster</li>
      <li>Vector Search indexes created</li>
    </ul>
    <Button size="small" href="/docs/ai/vector-search">
      Setup Guide →
    </Button>
  </Alert>
)}
```

---

### Step 5: Branding

**Visual identity:**
```tsx
<TextField
  label="Banner Image URL"
  value={bannerUrl}
  onChange={e => setBannerUrl(e.target.value)}
  fullWidth
  helperText="1920x600px recommended"
/>

{bannerUrl && (
  <Box sx={{ mt: 2, border: '1px solid #ccc', borderRadius: 2 }}>
    <img src={bannerUrl} alt="Banner preview" style={{ width: '100%' }} />
  </Box>
)}

<TextField
  label="Logo URL"
  value={logoUrl}
  onChange={e => setLogoUrl(e.target.value)}
  fullWidth
  helperText="500x500px transparent PNG"
/>

<Box>
  <Typography variant="subtitle2">Primary Color</Typography>
  <input 
    type="color"
    value={primaryColor}
    onChange={e => setPrimaryColor(e.target.value)}
  />
</Box>
```

---

### Step 6: Categories & Prizes

**Project categories:**
```tsx
<Autocomplete
  multiple
  freeSolo
  options={DEFAULT_CATEGORIES}
  value={categories}
  onChange={(_, newValue) => setCategories(newValue)}
  renderInput={params => (
    <TextField {...params} label="Categories" placeholder="Add category" />
  )}
/>
```

**Default categories:**
- AI/ML
- Web Application
- Mobile App
- Developer Tools
- Data Visualization
- Social Impact
- Gaming
- Hardware/IoT

**Add custom:**
```tsx
<Chip
  label="FinTech"
  onDelete={() => removeCategory('FinTech')}
  color="primary"
/>
```

---

### Step 7: Review & Create

**Summary card:**
```
Event: MongoHacks Spring 2026
Slug: mongohacks-spring-2026

Dates:
  Start: March 18, 2026 9:00 AM EST
  End: March 18, 2026 8:00 PM EST
  Submission: March 18, 2026 6:00 PM EST

Capacity: 150 participants
Team Size: 1-5 members
Categories: AI/ML, Web App, Mobile (3 total)

Features:
  ✅ AI-powered team matching
  ✅ Judging workflow
  ✅ Waitlist enabled
  ❌ Video demo required

Status: Draft (not yet published)

[Save as Draft]  [Publish Event]
```

---

## Editing Events

### Edit Form

**Same form as creation, pre-filled:**
```tsx
const EditEventPage = ({ eventId }) => {
  const [event, setEvent] = useState(null);
  
  useEffect(() => {
    fetch(`/api/admin/events/${eventId}`)
      .then(res => res.json())
      .then(data => setEvent(data.data));
  }, [eventId]);
  
  if (!event) return <CircularProgress />;
  
  return (
    <EventForm 
      event={event} 
      mode="edit"
      onSubmit={handleUpdate}
    />
  );
};
```

**Field restrictions:**
```tsx
{event.currentParticipants > 0 && (
  <Alert severity="warning">
    <AlertTitle>Active Event</AlertTitle>
    Some fields cannot be changed after participants register:
    <ul>
      <li>Slug (would break links)</li>
      <li>Start date (can only extend)</li>
    </ul>
  </Alert>
)}
```

---

### Quick Edits

**Inline editing for common changes:**
```tsx
<TableRow>
  <TableCell>{event.name}</TableCell>
  <TableCell>
    <Chip 
      label={event.status}
      onClick={() => handleStatusEdit(event._id)}
    />
  </TableCell>
  <TableCell>
    <TextField
      type="number"
      value={event.capacity}
      onChange={e => handleCapacityUpdate(event._id, e.target.value)}
      variant="standard"
      sx={{ width: 80 }}
    />
  </TableCell>
</TableRow>
```

---

## Status Management

### Status Transitions

**Manual controls:**
```tsx
<FormControl fullWidth>
  <InputLabel>Event Status</InputLabel>
  <Select value={status} onChange={handleStatusChange}>
    <MenuItem value="draft">Draft (hidden from public)</MenuItem>
    <MenuItem value="published">Published (visible, registration open)</MenuItem>
    <MenuItem value="active">Active (event in progress)</MenuItem>
    <MenuItem value="concluded">Concluded (event finished)</MenuItem>
  </Select>
</FormControl>
```

**Status workflows:**

**Draft → Published:**
```
Checklist before publishing:
☑ Event name and description complete
☑ Dates and times set correctly
☑ Capacity configured
☑ Categories added
☐ Banner image uploaded (optional)
☐ Prizes configured (optional)

[Publish Event] button enabled when ☑ all required
```

**Published → Active:**
```
Triggers automatically at startDate

Manual activation:
⚠️ Event starts in 2 days. Activate early?
[Activate Now] [Wait Until Start Date]
```

**Active → Concluded:**
```
Auto-concludes at endDate

Manual conclusion:
⚠️ Event ends in 3 hours. Conclude early?
Reason: [text input]
[Conclude Now] [Wait Until End Time]
```

---

## Participant Management

### Participant List

**View all registered participants:**

| Name | Email | Registered | Team | Project | Actions |
|------|-------|------------|------|---------|---------|
| Alice Smith | alice@example.com | Mar 1, 2026 | Data Wizards | RAG Chatbot | [View] [Remove] |
| Bob Jones | bob@example.com | Mar 2, 2026 | (none) | - | [View] [Email] |
| Carol Lee | carol@example.com | Mar 3, 2026 | AI Innovators | Mobile App | [View] |

**Filters:**
- Has team / No team
- Submitted project / No project
- Registration date range
- Search by name/email

**Bulk actions:**
```tsx
<Button onClick={() => bulkEmail(selectedParticipants)}>
  Email Selected ({selectedCount})
</Button>

<Button onClick={() => bulkExport(selectedParticipants)} color="secondary">
  Export CSV ({selectedCount})
</Button>
```

---

### Manual Registration

**Add participant manually:**
```tsx
<Dialog open={addingParticipant}>
  <DialogTitle>Add Participant</DialogTitle>
  <DialogContent>
    <TextField
      label="Name"
      value={name}
      onChange={e => setName(e.target.value)}
      fullWidth
    />
    <TextField
      label="Email"
      type="email"
      value={email}
      onChange={e => setEmail(e.target.value)}
      fullWidth
    />
    <Autocomplete
      multiple
      options={SKILL_OPTIONS}
      value={skills}
      onChange={(_, newValue) => setSkills(newValue)}
      renderInput={params => <TextField {...params} label="Skills" />}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setAddingParticipant(false)}>Cancel</Button>
    <Button onClick={handleAddParticipant} variant="contained">Add</Button>
  </DialogActions>
</Dialog>
```

**Use cases:**
- VIP attendees
- Late registrations (after deadline)
- Fixing registration errors
- Organizer team members

---

### Remove Participant

**Confirmation dialog:**
```tsx
<Dialog open={confirmingRemoval}>
  <DialogTitle>Remove Participant?</DialogTitle>
  <DialogContent>
    <Alert severity="warning">
      <AlertTitle>This action cannot be undone</AlertTitle>
      Removing {participant.name} will:
      <ul>
        <li>Remove them from their team</li>
        <li>Delete their project (if sole member)</li>
        <li>Free up 1 capacity slot</li>
      </ul>
    </Alert>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmingRemoval(false)}>Cancel</Button>
    <Button onClick={handleConfirmRemoval} color="error" variant="contained">
      Remove Participant
    </Button>
  </DialogActions>
</Dialog>
```

---

## Judge Management

### Assign Judges

**Judge selection:**
```tsx
<Autocomplete
  options={availableJudges}
  getOptionLabel={judge => `${judge.name} (${judge.email})`}
  value={selectedJudge}
  onChange={(_, newValue) => setSelectedJudge(newValue)}
  renderInput={params => <TextField {...params} label="Select Judge" />}
/>
```

**Batch assignment:**
```tsx
<FormControl fullWidth>
  <InputLabel>Projects per Judge</InputLabel>
  <Select value={projectsPerJudge} onChange={e => setProjectsPerJudge(e.target.value)}>
    <MenuItem value={3}>3 projects each</MenuItem>
    <MenuItem value={5}>5 projects each</MenuItem>
    <MenuItem value={10}>10 projects each</MenuItem>
  </Select>
</FormControl>

<Button 
  variant="contained"
  onClick={handleAutoAssign}
  disabled={assigning}
>
  {assigning ? 'Assigning...' : 'Auto-Assign All Judges'}
</Button>
```

**Auto-assignment algorithm:**
1. Count total projects
2. Divide by number of judges
3. Randomly assign projects
4. Balance workload (±1 project variance)
5. Avoid conflicts (judge can't score own team)

**See:** [Judge Assignment Guide](/docs/admin/judges)

---

## Results Management

### View Results

**Rankings table:**

| Rank | Project | Team | Innovation | Technical | Impact | Presentation | Total | Actions |
|------|---------|------|------------|-----------|--------|--------------|-------|---------|
| 🥇 1 | RAG Chatbot | Wizards | 9.2 | 9.5 | 9.0 | 9.8 | 38.5 | [Details] |
| 🥈 2 | Mobile App | Alpha | 8.8 | 9.0 | 8.5 | 9.9 | 36.2 | [Details] |
| 🥉 3 | Data Viz | Beta | 9.0 | 8.5 | 8.8 | 9.5 | 35.8 | [Details] |

**Publish control:**
```tsx
<FormControlLabel
  control={
    <Switch 
      checked={resultsPublished}
      onChange={handleTogglePublish}
    />
  }
  label={resultsPublished ? "Results Published (Public)" : "Results Hidden (Admin Only)"}
/>

{resultsPublished && (
  <Alert severity="success" sx={{ mt: 2 }}>
    Results are now public at:
    <Link href={`/events/${event.slug}/results`}>
      /events/{event.slug}/results
    </Link>
  </Alert>
)}
```

---

### Generate AI Feedback

**Batch feedback generation:**
```tsx
<Card sx={{ mt: 3 }}>
  <CardHeader title="AI Feedback" />
  <CardContent>
    <Typography variant="body2" paragraph>
      Generate AI-synthesized feedback for all judged projects.
    </Typography>
    
    <Button
      variant="contained"
      startIcon={generating ? <CircularProgress size={20} /> : <AutoAwesome />}
      onClick={handleGenerateFeedback}
      disabled={generating}
    >
      {generating ? 'Generating...' : 'Generate Feedback for All Projects'}
    </Button>
    
    {results && (
      <Alert severity="success" sx={{ mt: 2 }}>
        Generated feedback for {results.success} projects
        ({results.skipped} skipped, {results.failed} failed)
      </Alert>
    )}
  </CardContent>
</Card>
```

**See:** [AI Feedback Synthesis](/docs/ai/feedback-synthesis)

---

## Communication

### Email Participants

**Compose announcement:**
```tsx
<Dialog open={composing} fullWidth maxWidth="md">
  <DialogTitle>Send Announcement</DialogTitle>
  <DialogContent>
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Recipients</InputLabel>
      <Select value={recipients} onChange={e => setRecipients(e.target.value)}>
        <MenuItem value="all">All Participants ({participantCount})</MenuItem>
        <MenuItem value="teams">Participants with Teams</MenuItem>
        <MenuItem value="solo">Participants without Teams</MenuItem>
        <MenuItem value="submitted">Teams with Submitted Projects</MenuItem>
      </Select>
    </FormControl>
    
    <TextField
      label="Subject"
      value={subject}
      onChange={e => setSubject(e.target.value)}
      fullWidth
      sx={{ mb: 2 }}
    />
    
    <TextField
      label="Message"
      value={message}
      onChange={e => setMessage(e.target.value)}
      fullWidth
      multiline
      rows={10}
      helperText="Supports Markdown"
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setComposing(false)}>Cancel</Button>
    <Button onClick={handleSendEmail} variant="contained">
      Send to {getRecipientCount()} participants
    </Button>
  </DialogActions>
</Dialog>
```

**Common announcements:**
- Event reminder (1 week before)
- Day-of logistics (morning of event)
- Halfway point update
- Submission deadline warning
- Results published

---

## Analytics

### Event Metrics

**Registration funnel:**
```
Landing Page Views:     1,247
Registration Started:     523 (42%)
Registration Completed:   142 (27% of started, 11% of views)

Conversion Rate: 11.4%
```

**Team formation:**
```
Total Participants: 142
On Teams:           128 (90%)
Solo:                14 (10%)

Teams Created:       38
Avg Team Size:      3.4 members
Teams Full:         12 (32%)
```

**Project submission:**
```
Teams:              38
Projects Submitted: 38 (100%)
On Time:            35 (92%)
Late:                3 (8%)

Avg Submission Time: 4.2 hours before deadline
```

**Judging completion:**
```
Judges Assigned:    12
Projects to Judge:  38
Total Scores:       152 (38 projects × 4 judges avg)
Completion Rate:    100%

Avg Time per Score: 8.3 minutes
```

---

## Export & Reports

### CSV Exports

**Export options:**
```tsx
<Menu>
  <MenuItem onClick={() => exportData('participants')}>
    Export Participants
  </MenuItem>
  <MenuItem onClick={() => exportData('teams')}>
    Export Teams
  </MenuItem>
  <MenuItem onClick={() => exportData('projects')}>
    Export Projects
  </MenuItem>
  <MenuItem onClick={() => exportData('scores')}>
    Export Judge Scores
  </MenuItem>
  <MenuItem onClick={() => exportData('full')}>
    Export Full Event Data
  </MenuItem>
</Menu>
```

**Generated files:**
- `mongohacks-spring-2026-participants.csv`
- `mongohacks-spring-2026-teams.csv`
- `mongohacks-spring-2026-projects.csv`
- `mongohacks-spring-2026-scores.csv`
- `mongohacks-spring-2026-full.zip` (all CSVs)

---

## Archiving Events

### Archive Old Events

**Archive criteria:**
- Status = concluded
- End date > 90 days ago
- Results published
- No pending actions

**Archive action:**
```tsx
<Button 
  color="warning"
  onClick={handleArchive}
>
  Archive Event
</Button>

<Dialog open={confirmArchive}>
  <DialogTitle>Archive Event?</DialogTitle>
  <DialogContent>
    <Alert severity="info">
      Archiving will:
      <ul>
        <li>Hide event from main list (view archived separately)</li>
        <li>Make event read-only</li>
        <li>Preserve all data (participants, projects, scores)</li>
        <li>Free up landing page visibility</li>
      </ul>
      This action can be reversed.
    </Alert>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmArchive(false)}>Cancel</Button>
    <Button onClick={handleConfirmArchive} variant="contained" color="warning">
      Archive Event
    </Button>
  </DialogActions>
</Dialog>
```

---

## Troubleshooting

### Event Not Appearing on Landing

**Check:**
1. Status = 'published' or 'active'?
2. Start date in future or present?
3. Slug valid and unique?

**Debug:**
```javascript
db.events.findOne({ slug: 'mongohacks-spring-2026' }, {
  status: 1,
  startDate: 1,
  endDate: 1
});
```

---

### Cannot Edit Event

**Possible causes:**
- Event concluded (status locked)
- Not an admin/organizer
- Browser cache issue

**Solution:**
```tsx
{event.status === 'concluded' && (
  <Alert severity="warning">
    This event has concluded. Edit mode restricted.
    Contact super admin to make changes.
  </Alert>
)}
```

---

## Next Steps

- [Assign judges](/docs/admin/judges)
- [View analytics](/docs/admin/analytics)
- [Manage participants](/docs/admin/users)
- [Configure AI features](/docs/ai/overview)
