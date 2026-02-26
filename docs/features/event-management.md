---
sidebar_position: 2
---

# Event Management

Create, configure, and manage hackathon events from start to finish.

## Overview

Event management provides organizers with complete control over hackathon lifecycle:
- Create and configure events
- Set capacity and deadlines
- Manage registration and teams
- Control judging and results
- Monitor analytics

**Access:** Admin and organizer roles only

---

## Creating Events

### Event Creation Form

**URL:** `/admin/events/create`

**Required fields:**
- **Name** - Event title (e.g., "MongoHacks Spring 2026")
- **Slug** - URL-friendly identifier (auto-generated from name)
- **Description** - Event overview and goals
- **Start Date** - When event begins
- **End Date** - When event concludes
- **Capacity** - Maximum participants

**Optional fields:**
- **Submission Deadline** - When projects must be submitted
- **Location** - Venue address or "Virtual"
- **Banner Image** - Event hero image URL
- **Categories** - Project categories (AI/ML, Web, Mobile, etc.)
- **Prizes** - Prize information
- **Partners** - Sponsor list

---

### Event Configuration

```typescript
interface Event {
  name: string;
  slug: string;  // URL: /events/[slug]
  description: string;
  
  // Dates
  startDate: Date;
  endDate: Date;
  submissionDeadline?: Date;
  registrationDeadline?: Date;
  
  // Capacity
  capacity: number;
  currentParticipants: number;
  
  // Status
  status: 'draft' | 'published' | 'active' | 'concluded';
  
  // Results
  resultsPublished: boolean;
  resultsPublishedAt?: Date;
  
  // Branding
  bannerUrl?: string;
  logoUrl?: string;
  primaryColor?: string;
  
  // Features
  categories: string[];
  requireTeams: boolean;
  allowSoloProjects: boolean;
  maxTeamSize: number;
  minTeamSize: number;
  
  // Location
  location?: string;
  venue?: string;
  isVirtual: boolean;
  timezone: string;
  
  // Settings
  enableAI: boolean;
  enableVectorSearch: boolean;
  requireVideoDemo: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Slug Generation

**Auto-generated from name:**
```typescript
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with dash
    .replace(/^-+|-+$/g, '')      // Trim dashes
    .substring(0, 60);             // Limit length
}

// Examples:
generateSlug("MongoHacks Spring 2026") 
// → "mongohacks-spring-2026"

generateSlug("AI/ML Hackathon @ MongoDB")
// → "ai-ml-hackathon-mongodb"
```

**Uniqueness check:**
```typescript
async function ensureUniqueSlug(slug: string): Promise<string> {
  let finalSlug = slug;
  let counter = 1;
  
  while (await Event.findOne({ slug: finalSlug })) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }
  
  return finalSlug;
}

// If "mongohacks-spring-2026" exists:
// → "mongohacks-spring-2026-1"
```

---

## Event Lifecycle

### Status Transitions

**1. Draft → Published:**
- Event created but not live
- Visible only to admins
- Can edit all fields
- No registration open

**Publish action:**
```typescript
await Event.findByIdAndUpdate(eventId, { 
  status: 'published',
  publishedAt: new Date()
});
```

**UI:** Landing page becomes public at `/events/[slug]`

---

**2. Published → Active:**
- Auto-transitions at `startDate`
- Registration may still be open
- Event officially underway
- Teams can submit projects

**Auto-trigger (cron job):**
```typescript
// Run every hour
cron.schedule('0 * * * *', async () => {
  const now = new Date();
  
  await Event.updateMany(
    { 
      status: 'published',
      startDate: { $lte: now }
    },
    { 
      status: 'active',
      activatedAt: now
    }
  );
});
```

---

**3. Active → Concluded:**
- Auto-transitions at `endDate`
- Project submission closes
- Judging begins
- Event archived

**Auto-trigger:**
```typescript
cron.schedule('0 * * * *', async () => {
  const now = new Date();
  
  await Event.updateMany(
    { 
      status: 'active',
      endDate: { $lte: now }
    },
    { 
      status: 'concluded',
      concludedAt: now
    }
  );
});
```

---

### Manual Status Override

**Admin can manually change status:**
```tsx
<Select
  value={event.status}
  onChange={handleStatusChange}
  disabled={saving}
>
  <MenuItem value="draft">Draft</MenuItem>
  <MenuItem value="published">Published</MenuItem>
  <MenuItem value="active">Active</MenuItem>
  <MenuItem value="concluded">Concluded</MenuItem>
</Select>
```

**Use cases:**
- Early activation (testing, VIP preview)
- Extend deadline (more time for projects)
- Emergency pause (technical issues)
- Archive old events

---

## Capacity Management

### Setting Capacity

**During creation:**
```tsx
<TextField
  label="Maximum Participants"
  type="number"
  value={capacity}
  onChange={e => setCapacity(parseInt(e.target.value))}
  helperText="Total number of participants allowed"
/>
```

**Recommended capacities:**
- Small event: 25-50 people
- Medium event: 50-150 people
- Large event: 150-500 people
- Mega event: 500+ people

---

### Current Participant Count

**Auto-calculated:**
```typescript
// Update on every registration
await Event.findByIdAndUpdate(eventId, {
  $inc: { currentParticipants: 1 }
});

// Calculate from Participant collection
const count = await Participant.countDocuments({ 
  'registeredEvents.eventId': eventId 
});

await Event.findByIdAndUpdate(eventId, {
  currentParticipants: count
});
```

**Display:**
```
Participants: 142 / 150 (95%)

Progress bar: [████████████████░░] 
```

---

### Capacity Full Handling

**When `currentParticipants >= capacity`:**
```typescript
if (event.currentParticipants >= event.capacity) {
  return res.status(400).json({
    success: false,
    error: 'Event has reached capacity',
    code: 'EVENT_FULL',
    waitlistAvailable: true
  });
}
```

**Landing page shows:**
```
Event Full
150 / 150 participants registered

[Join Waitlist] button
```

---

### Increase Capacity

**Admin action:**
```tsx
const handleIncreaseCapacity = async () => {
  const newCapacity = window.prompt(
    `Current capacity: ${event.capacity}. Enter new capacity:`,
    event.capacity + 50
  );
  
  if (newCapacity && parseInt(newCapacity) > event.capacity) {
    await fetch(`/api/admin/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify({ capacity: parseInt(newCapacity) })
    });
    
    enqueueSnackbar('Capacity increased!', { variant: 'success' });
  }
};
```

**Common scenarios:**
- Larger venue secured
- Virtual event (no physical limit)
- Higher demand than expected
- Sponsor support increased

---

## Deadline Management

### Registration Deadline

**Close registration before event:**
```typescript
{
  registrationDeadline: new Date('2026-03-15T23:59:59Z'),
  startDate: new Date('2026-03-18T09:00:00Z')
}
```

**Auto-enforcement:**
```typescript
if (event.registrationDeadline && new Date() > event.registrationDeadline) {
  return res.status(400).json({
    success: false,
    error: 'Registration deadline has passed',
    code: 'REGISTRATION_CLOSED'
  });
}
```

**Why useful:**
- Finalize attendee count
- Prepare materials (badges, food, swag)
- Stop last-minute signups
- Time to review registrations

---

### Submission Deadline

**Close project submissions before event ends:**
```typescript
{
  submissionDeadline: new Date('2026-03-18T18:00:00Z'),
  endDate: new Date('2026-03-18T20:00:00Z')
}
```

**Buffer for judging:**
- Event ends: 8:00 PM
- Submissions due: 6:00 PM
- **2 hours** for judging prep

**Enforcement:**
```typescript
if (event.submissionDeadline && new Date() > event.submissionDeadline) {
  return res.status(400).json({
    success: false,
    error: 'Submission deadline has passed',
    code: 'SUBMISSION_CLOSED'
  });
}
```

---

### Extend Deadline

**Admin override:**
```tsx
<DateTimePicker
  label="Submission Deadline"
  value={submissionDeadline}
  onChange={setSubmissionDeadline}
  minDateTime={new Date()}
/>

<Button 
  onClick={handleExtendDeadline}
  color="warning"
>
  Extend Deadline by 1 Hour
</Button>
```

**Use cases:**
- Technical issues (platform down)
- Participant requests (common issue blocking multiple teams)
- Organizer decision (more time = better projects)

---

## Categories & Prizes

### Project Categories

**Define during event creation:**
```typescript
const DEFAULT_CATEGORIES = [
  'AI/ML',
  'Web Application',
  'Mobile App',
  'Developer Tools',
  'Data Visualization',
  'Social Impact',
  'Gaming',
  'Hardware/IoT'
];
```

**Custom categories:**
```tsx
<Autocomplete
  multiple
  freeSolo
  options={DEFAULT_CATEGORIES}
  value={categories}
  onChange={(_, newValue) => setCategories(newValue)}
  renderInput={(params) => (
    <TextField {...params} label="Categories" placeholder="Add category" />
  )}
/>
```

**Why categories matter:**
- Organize project browsing
- Category-specific prizes
- Judging assignments
- Analytics

---

### Prize Configuration

**Prize model:**
```typescript
interface Prize {
  _id: ObjectId;
  eventId: ObjectId;
  name: string;          // "Best AI/ML Project"
  description: string;   // "Awarded for most innovative use of AI"
  value: number;         // 5000 (USD)
  category?: string;     // "AI/ML"
  partnerId?: ObjectId;  // Sponsored by Partner X
  position?: number;     // 1st, 2nd, 3rd place
  quantity: number;      // Number of winners (usually 1)
  createdAt: Date;
}
```

**Common prizes:**
- Overall Winner (1st, 2nd, 3rd)
- Best Use of MongoDB
- Best AI/ML Project
- Best Mobile App
- People's Choice
- Most Creative
- Best First-Time Hackers

---

## Partner Management

### Adding Partners

**Partner model:**
```typescript
interface Partner {
  _id: ObjectId;
  name: string;
  logoUrl: string;
  websiteUrl: string;
  description: string;
  tier: 'title' | 'platinum' | 'gold' | 'silver' | 'bronze';
  benefits: string[];
  contactEmail: string;
  contactName: string;
}
```

**Display tiers:**
- **Title:** Largest logo, top billing
- **Platinum:** Large logo, prominent placement
- **Gold:** Medium logo
- **Silver:** Small logo
- **Bronze:** Smallest logo

**Landing page display:**
```tsx
<Box sx={{ mt: 6 }}>
  <Typography variant="h4" align="center" gutterBottom>
    Our Partners
  </Typography>
  
  {/* Title sponsors */}
  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 4 }}>
    {partners.filter(p => p.tier === 'title').map(partner => (
      <img 
        src={partner.logoUrl} 
        alt={partner.name}
        style={{ height: 120 }}
      />
    ))}
  </Box>
  
  {/* Platinum sponsors */}
  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
    {partners.filter(p => p.tier === 'platinum').map(partner => (
      <img src={partner.logoUrl} alt={partner.name} style={{ height: 80 }} />
    ))}
  </Box>
  
  {/* Gold/Silver/Bronze */}
  {/* ... */}
</Box>
```

---

## Team Settings

### Team Requirements

**Configure team rules:**
```typescript
{
  requireTeams: boolean,        // Teams mandatory vs optional
  allowSoloProjects: boolean,   // Solo submissions allowed?
  minTeamSize: number,          // Minimum members (default: 1)
  maxTeamSize: number,          // Maximum members (default: 5)
  lockTeamsAfterSubmission: boolean  // Freeze team after project submitted
}
```

**Scenarios:**

**1. Team-only hackathon:**
```typescript
{
  requireTeams: true,
  allowSoloProjects: false,
  minTeamSize: 2,
  maxTeamSize: 5
}
```

**2. Flexible (team or solo):**
```typescript
{
  requireTeams: false,
  allowSoloProjects: true,
  minTeamSize: 1,
  maxTeamSize: 5
}
```

**3. Large teams:**
```typescript
{
  minTeamSize: 3,
  maxTeamSize: 10  // Enterprise hackathons
}
```

---

## Feature Toggles

### Enable/Disable Features

**AI features:**
```typescript
{
  enableAI: boolean,              // All AI features
  enableVectorSearch: boolean,    // Team matching
  enableProjectSummaries: boolean, // GPT-4 summaries
  enableFeedbackSynthesis: boolean // GPT-4 feedback
}
```

**Requirements:**
```tsx
{enableAI && (
  <Alert severity="warning" sx={{ mb: 2 }}>
    <AlertTitle>AI Features Enabled</AlertTitle>
    Requires:
    <ul>
      <li>OpenAI API key configured</li>
      <li>MongoDB Atlas M10+ cluster</li>
      <li>Vector Search indexes created</li>
    </ul>
  </Alert>
)}
```

---

**Other features:**
```typescript
{
  enableJudging: boolean,           // Enable judging workflow
  enableResults: boolean,           // Show results page
  enableEventHub: boolean,          // Participant dashboard
  requireVideoDemo: boolean,        // Video URL required
  enableWaitlist: boolean,          // Waitlist when full
  enableNotifications: boolean,     // Email notifications
  enableDiscordIntegration: boolean // Discord bot
}
```

---

## Branding & Customization

### Event Branding

**Custom colors:**
```tsx
<Box sx={{ mb: 3 }}>
  <Typography variant="subtitle2" gutterBottom>
    Primary Color
  </Typography>
  <input 
    type="color" 
    value={primaryColor}
    onChange={e => setPrimaryColor(e.target.value)}
  />
  <Typography variant="caption" display="block">
    Used for buttons, links, and accents
  </Typography>
</Box>
```

**Custom images:**
```tsx
<TextField
  label="Banner Image URL"
  value={bannerUrl}
  onChange={e => setBannerUrl(e.target.value)}
  fullWidth
  helperText="1920x600px recommended, PNG or JPG"
/>

<TextField
  label="Logo URL"
  value={logoUrl}
  onChange={e => setLogoUrl(e.target.value)}
  fullWidth
  helperText="500x500px recommended, transparent PNG"
/>
```

**Preview:**
```tsx
{bannerUrl && (
  <Box sx={{ mt: 2, border: '1px solid #ccc', borderRadius: 2 }}>
    <img 
      src={bannerUrl} 
      alt="Banner preview"
      style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }}
    />
  </Box>
)}
```

---

## Admin Dashboard

### Event Overview

**Key metrics:**
```tsx
<Grid container spacing={3}>
  <Grid item xs={12} md={3}>
    <Card>
      <CardContent>
        <Typography color="text.secondary">Participants</Typography>
        <Typography variant="h4">
          {event.currentParticipants} / {event.capacity}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={(event.currentParticipants / event.capacity) * 100}
        />
      </CardContent>
    </Card>
  </Grid>
  
  <Grid item xs={12} md={3}>
    <Card>
      <CardContent>
        <Typography color="text.secondary">Teams</Typography>
        <Typography variant="h4">{teamCount}</Typography>
      </CardContent>
    </Card>
  </Grid>
  
  <Grid item xs={12} md={3}>
    <Card>
      <CardContent>
        <Typography color="text.secondary">Projects</Typography>
        <Typography variant="h4">{projectCount}</Typography>
      </CardContent>
    </Card>
  </Grid>
  
  <Grid item xs={12} md={3}>
    <Card>
      <CardContent>
        <Typography color="text.secondary">Status</Typography>
        <Chip 
          label={event.status.toUpperCase()} 
          color={getStatusColor(event.status)}
        />
      </CardContent>
    </Card>
  </Grid>
</Grid>
```

---

### Quick Actions

**Admin shortcuts:**
```tsx
<Stack direction="row" spacing={2} sx={{ mt: 3 }}>
  <Button variant="contained" href={`/events/${event.slug}`}>
    View Landing Page
  </Button>
  
  <Button variant="outlined" href={`/admin/events/${event._id}/edit`}>
    Edit Event
  </Button>
  
  <Button variant="outlined" href={`/admin/events/${event._id}/participants`}>
    Manage Participants
  </Button>
  
  <Button variant="outlined" href={`/admin/events/${event._id}/judges`}>
    Assign Judges
  </Button>
  
  <Button variant="outlined" href={`/admin/events/${event._id}/results`}>
    View Results
  </Button>
</Stack>
```

---

## Best Practices

### Event Planning

**Timeline:**
- **3 months out:** Create event, open registration
- **1 month out:** Close registration, finalize logistics
- **1 week out:** Send reminder emails, confirm judges
- **Event day:** Monitor submissions, support participants
- **Post-event:** Publish results, collect feedback

**Capacity planning:**
- Set realistic limits based on venue/resources
- Leave 10-20% buffer for no-shows
- Monitor registration rate
- Increase capacity early if needed

**Deadlines:**
- Registration: 1-2 days before event
- Submission: 2-4 hours before event end
- Allows buffer for judging

---

### Communication

**Pre-event:**
- Confirmation email (immediate)
- Reminder 1 week before
- Logistics email 2 days before
- Day-of instructions (morning of)

**During event:**
- Welcome announcement
- Milestone reminders (50% time, 1 hour left)
- Submission deadline warning

**Post-event:**
- Thank you email
- Results announcement
- Feedback survey
- Winner recognition

---

## Troubleshooting

### Event Not Showing on Landing Page

**Check:**
1. Status = 'published' or 'active'?
2. Slug unique and valid?
3. Start/end dates set correctly?
4. No errors in event data?

**Debug:**
```javascript
db.events.findOne({ slug: 'mongohacks-spring-2026' }, {
  status: 1,
  startDate: 1,
  endDate: 1,
  capacity: 1
});

// Should show:
// { status: 'published', startDate: ISODate(...), ... }
```

---

### Registration Not Working

**Check:**
1. Registration deadline not passed?
2. Capacity not full?
3. Status = 'published' or 'active'?
4. Registration endpoint working?

**Test:**
```bash
curl -X POST http://localhost:3002/api/events/EVENT_ID/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","skills":["Python"]}'
```

---

## Next Steps

- [Create your first event](/docs/getting-started/first-event)
- [Configure AI features](/docs/ai/overview)
- [Set up judging](/docs/features/judging)
- [Manage participants](/docs/admin/users)
