---
sidebar_position: 1
---

# Admin Dashboard

Centralized control panel for event organizers and administrators.

## Overview

The admin dashboard provides a comprehensive view of event health, participant engagement, and system status.

**URL:** `/admin`

**Access:** Admin and organizer roles only

---

## Dashboard Layout

### At-a-Glance Metrics

**Four key metrics (top cards):**

```tsx
┌─────────────────────┐  ┌─────────────────────┐
│ Total Events        │  │ Active Events       │
│      12             │  │       3             │
│ ↑ 2 from last month │  │ 🟢 Live now         │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│ Total Participants  │  │ Projects Submitted  │
│      1,247          │  │       89            │
│ Across all events   │  │ Awaiting judging    │
└─────────────────────┘  └─────────────────────┘
```

**Real-time updates:**
- Refreshes every 30 seconds
- Green pulse indicator when live
- Click to view details

---

### Active Events List

**Currently running events:**

| Event | Status | Participants | Projects | Judging | Actions |
|-------|--------|--------------|----------|---------|---------|
| MongoHacks Spring | 🟢 Active | 142/150 | 38 | 12 assigned | [Manage] |
| AI/ML Hackathon | 🟡 Judging | 89/100 | 67 | 24 assigned | [View Results] |
| Student Hackathon | 🔴 Concluded | 56/75 | 42 | Complete | [Publish Results] |

**Status indicators:**
- 🟢 Active - Event in progress
- 🟡 Judging - Projects submitted, judging underway
- 🔴 Concluded - Event finished, results pending

**Quick actions:**
- Manage - Jump to event admin page
- View Results - See current standings
- Publish Results - Make results public

---

### Recent Activity Feed

**Live updates (last 24 hours):**

```
🎉 Jane Doe registered for MongoHacks Spring
   2 minutes ago

📊 Team "Data Wizards" submitted project "RAG Chatbot"
   15 minutes ago

👨‍⚖️ Judge Sarah assigned to review 5 projects
   1 hour ago

✅ AI/ML Hackathon judging completed (67/67 projects scored)
   3 hours ago

📧 Welcome emails sent to 142 participants
   Yesterday at 10:42 AM
```

**Filter options:**
- All events
- Specific event
- Activity type (registrations, submissions, judging)
- Time range (today, week, month)

---

## System Health

### Platform Status

**Infrastructure monitoring:**

```
┌─────────────────────────────────┐
│ Platform Health        🟢 Good  │
├─────────────────────────────────┤
│ API Response Time      42ms     │
│ Database Queries       &lt;50ms    │
│ Error Rate             0.02%    │
│ Uptime (30 days)       99.98%   │
└─────────────────────────────────┘
```

**Alerts:**
```
⚠️ Warning: AI Summary generation failed for 3 projects
   Action: Check OpenAI API key

❌ Critical: MongoDB connection slow (>500ms)
   Action: Upgrade cluster tier
```

---

### AI Features Status

**OpenAI integration:**

```
┌──────────────────────────────────┐
│ AI Features          🟢 Active   │
├──────────────────────────────────┤
│ API Key               Valid      │
│ Daily Quota           24% used   │
│ This Month            $47.23     │
│ Embeddings            1,247      │
│ Summaries             89         │
│ Feedback              67         │
└──────────────────────────────────┘
```

**Vector Search:**

```
┌──────────────────────────────────┐
│ Vector Search        🟢 Active   │
├──────────────────────────────────┤
│ Atlas Cluster         M10        │
│ Indexes               2/2 ready  │
│ Avg Query Time        38ms       │
│ Match Quality         87%        │
└──────────────────────────────────┘
```

---

## Analytics Overview

### Event Performance

**Participation trends:**

```
Registrations Over Time (Last 30 Days)

 50 │                              ╭─╮
 40 │                        ╭─────╯ │
 30 │                  ╭─────╯       │
 20 │          ╭───────╯             │
 10 │  ╭───────╯                     │
  0 ├──┴──────────────────────────────
    Day 1            Day 15         Day 30
```

**Submission rates:**
- MongoHacks Spring: 27% (38/142 registered)
- AI/ML Hackathon: 75% (67/89 registered)
- Student Hackathon: 75% (42/56 registered)

**Average:** 59% submission rate

---

### User Growth

**Registration trends:**

```
Month          New Users    Total Users
January 2026        247         1,000
February 2026       312         1,312
March 2026          189         1,501 (as of today)

Growth: +50% YTD
```

**Retention:**
- 1-time participants: 62%
- 2-3 events: 28%
- 4+ events: 10%

**Goal:** Increase 4+ event participants to 20%

---

## Quick Actions

### Common Tasks

**Event management:**
```tsx
<Stack spacing={2}>
  <Button 
    variant="contained" 
    startIcon={<Add />}
    href="/admin/events/create"
  >
    Create New Event
  </Button>
  
  <Button 
    variant="outlined"
    startIcon={<AssignmentInd />}
    href="/admin/judges"
  >
    Manage Judges
  </Button>
  
  <Button
    variant="outlined"
    startIcon={<People />}
    href="/admin/users"
  >
    View All Users
  </Button>
  
  <Button
    variant="outlined"
    startIcon={<Settings />}
    href="/admin/settings"
  >
    Platform Settings
  </Button>
</Stack>
```

---

### Bulk Operations

**Batch actions:**
- Export all event data (CSV)
- Send announcement emails
- Generate AI feedback for all projects
- Publish/unpublish results
- Archive concluded events

**Example:**
```tsx
<Button 
  variant="outlined" 
  color="warning"
  onClick={handleBulkEmailSend}
  disabled={sending}
>
  {sending ? 'Sending...' : 'Send Announcement to All Participants'}
</Button>
```

---

## Event-Specific Dashboard

### Event Deep Dive

**URL:** `/admin/events/[eventId]`

**Tabs:**
1. Overview - Key metrics
2. Participants - Registration list
3. Teams - Team formation
4. Projects - Submission status
5. Judging - Assignment and progress
6. Results - Scores and rankings
7. Settings - Event configuration

---

**Overview tab:**

```
MongoHacks Spring 2026
Status: 🟢 Active

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Participants    │  │ Teams           │  │ Projects        │
│ 142 / 150 (95%) │  │ 38 teams        │  │ 38 submitted    │
│ [Manage]        │  │ [View All]      │  │ [Review]        │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Judges          │  │ Scores          │  │ Results         │
│ 12 assigned     │  │ 38/38 complete  │  │ ○ Not Published │
│ [Assign More]   │  │ [View Scores]   │  │ [Publish]       │
└─────────────────┘  └─────────────────┘  └─────────────────┘

Timeline:
  Started:     March 18, 2026 9:00 AM
  Ends:        March 18, 2026 8:00 PM
  Time left:   3h 42m
  
  Registration: Closed (at capacity)
  Submissions:  Open (closes 6:00 PM)
  Judging:      In progress (12/12 judges active)
```

---

## Alerts & Notifications

### Alert Types

**Critical (red):**
- Platform down or degraded
- Database connection lost
- OpenAI API key invalid
- Event capacity exceeded without waitlist

**Warning (yellow):**
- AI generation failures
- Slow database queries
- Low disk space
- Approaching API rate limits

**Info (blue):**
- Event starting soon
- Submission deadline approaching
- Judging complete
- New feature available

---

### Notification Center

**Bell icon (top right):**

```
🔔 Notifications (3 unread)

● MongoHacks Spring starts in 1 hour
  Sent 1 hour ago

● AI feedback generation complete (42/42 projects)
  Sent 3 hours ago

○ Student Hackathon results published
  Sent yesterday
```

**Settings:**
- Email notifications on/off
- Alert types to receive
- Digest frequency (real-time, hourly, daily)

---

## Permissions & Roles

### Role-Based Access

**Super Admin:**
- Full platform access
- Create/delete events
- Manage admins
- System settings
- Billing

**Event Organizer:**
- Manage assigned events
- Create events (requires approval)
- View analytics
- Assign judges
- Publish results

**Judge:**
- View assigned projects
- Submit scores
- Leave comments
- No admin access

**Participant:**
- Register for events
- Create teams/projects
- View own data
- No admin access

---

### Permission Matrix

| Action | Super Admin | Organizer | Judge | Participant |
|--------|-------------|-----------|-------|-------------|
| Create event | ✅ | ✅* | ❌ | ❌ |
| Edit event | ✅ | ✅ (own) | ❌ | ❌ |
| Delete event | ✅ | ❌ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ |
| Assign judges | ✅ | ✅ | ❌ | ❌ |
| View analytics | ✅ | ✅ | ❌ | ❌ |
| Publish results | ✅ | ✅ | ❌ | ❌ |
| Score projects | ✅ | ✅ | ✅ | ❌ |

*Requires approval for first event

---

## Customization

### Dashboard Widgets

**Customize dashboard layout:**
```tsx
<DashboardGrid>
  <Widget id="events" size="large" position={1} />
  <Widget id="participants" size="medium" position={2} />
  <Widget id="activity" size="medium" position={3} />
  <Widget id="analytics" size="large" position={4} />
</DashboardGrid>
```

**Available widgets:**
- Event list (active, upcoming, past)
- Participant stats
- Project submissions
- Judging progress
- AI feature usage
- System health
- Recent activity
- Quick actions

**Drag-and-drop reordering:**
- Rearrange widgets
- Resize widgets
- Hide unused widgets
- Save preferences per user

---

## Export & Reporting

### Data Export

**CSV exports:**
```tsx
<Menu>
  <MenuItem onClick={() => exportCSV('participants')}>
    Export All Participants
  </MenuItem>
  <MenuItem onClick={() => exportCSV('projects')}>
    Export All Projects
  </MenuItem>
  <MenuItem onClick={() => exportCSV('scores')}>
    Export Judge Scores
  </MenuItem>
  <MenuItem onClick={() => exportCSV('analytics')}>
    Export Analytics Data
  </MenuItem>
</Menu>
```

**Generated files:**
- `participants-2026-03-18.csv`
- `projects-mongohacks-spring-2026.csv`
- `scores-event-abc123.csv`
- `analytics-monthly-2026-03.csv`

---

### Automated Reports

**Scheduled reports:**
- Daily event summaries (email)
- Weekly participation trends
- Monthly analytics digest
- Quarterly growth report

**Configuration:**
```tsx
<FormGroup>
  <FormControlLabel
    control={<Checkbox checked={dailySummary} />}
    label="Daily event summary email (8 AM)"
  />
  <FormControlLabel
    control={<Checkbox checked={weeklyTrends} />}
    label="Weekly trends report (Mondays)"
  />
  <FormControlLabel
    control={<Checkbox checked={monthlyDigest} />}
    label="Monthly analytics digest (1st of month)"
  />
</FormGroup>
```

---

## Best Practices

### Daily Monitoring

**Morning routine:**
1. Check platform health (green status?)
2. Review active events (any alerts?)
3. Check recent activity (unusual patterns?)
4. Respond to critical notifications

**Event day:**
1. Monitor registration rate
2. Watch submission progress
3. Check judge assignment coverage
4. Support participants in real-time

**Post-event:**
1. Review judging completion
2. Generate AI feedback
3. Publish results
4. Send thank-you emails

---

### Performance Tips

**Keep dashboard fast:**
- Cache metrics (5-minute refresh)
- Paginate large lists
- Load widgets on-demand
- Use database indexes

**Optimize queries:**
```javascript
// Bad: Load all events
const events = await Event.find({});

// Good: Load only active events with essential fields
const events = await Event.find({ 
  status: { $in: ['published', 'active'] }
}).select('name status currentParticipants capacity startDate');
```

---

## Troubleshooting

### Dashboard Loading Slowly

**Causes:**
- Too many events loaded
- Complex analytics queries
- No database indexes
- Large activity feed

**Solutions:**
- Limit events to active only
- Add pagination
- Cache query results
- Reduce activity feed size

---

### Metrics Not Updating

**Check:**
1. Browser cache cleared?
2. WebSocket connection active?
3. Database queries working?
4. Background jobs running?

**Force refresh:**
```tsx
<IconButton onClick={handleForceRefresh}>
  <Refresh />
</IconButton>
```

---

## Next Steps

- [Create your first event](/docs/admin/events)
- [Manage participants](/docs/admin/users)
- [Assign judges](/docs/admin/judges)
- [View analytics](/docs/admin/analytics)
