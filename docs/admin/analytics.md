---
sidebar_position: 6
---

# Analytics & Reporting

Comprehensive event analytics, metrics, and insights for data-driven decisions.

## Overview

Analytics provide deep insights into event performance, participant engagement, and platform health.

**URL:** `/admin/analytics`

**Access:** Admin and organizer roles

---

## Dashboard Overview

![Platform Analytics dashboard with KPI cards and tabbed analytics views](/img/screenshots/SCR-20260228-hzlg.png)

### Key Metrics

**Top-level KPIs:**
```tsx
<Grid container spacing={3}>
  <Grid item xs={12} md={3}>
    <MetricCard
      title="Total Events"
      value={totalEvents}
      change="+12% vs last quarter"
      trend="up"
    />
  </Grid>
  
  <Grid item xs={12} md={3}>
    <MetricCard
      title="Total Participants"
      value={totalParticipants}
      change="+23% vs last year"
      trend="up"
    />
  </Grid>
  
  <Grid item xs={12} md={3}>
    <MetricCard
      title="Avg Submission Rate"
      value="67%"
      change="+5% vs last quarter"
      trend="up"
    />
  </Grid>
  
  <Grid item xs={12} md={3}>
    <MetricCard
      title="Platform NPS"
      value="72"
      change="+8 points"
      trend="up"
    />
  </Grid>
</Grid>
```

---

## Event Analytics

The Events analytics tab shows event lifecycle status, format distribution, team formation, capacity utilization, and geographic breakdown.

![Event analytics showing status, format, and team donut charts with capacity and country tables](/img/screenshots/admin-events.png)

### Registration Funnel

**Conversion analysis:**
```
Landing Page Views:     12,458
Registration Started:    3,742 (30%)
Registration Completed:    856 (23% of started, 7% of views)
Event Attendance:          724 (85% of registered)
Project Submission:        486 (67% of attended)

Drop-off points:
1. Landing → Start: 70% (too much friction?)
2. Start → Complete: 77% (form too long?)
3. Register → Attend: 15% (normal no-show rate)
4. Attend → Submit: 33% (consider incentives)
```

**Visualization:**
```
Registration Funnel

Landing Views      12,458 ████████████████████
Registration Start  3,742 ██████░░░░░░░░░░░░░░ 30%
Completed            856 ███░░░░░░░░░░░░░░░░░  7%
Attended             724 ██░░░░░░░░░░░░░░░░░░  6%
Submitted            486 ██░░░░░░░░░░░░░░░░░░  4%
```

**Recommendations:**
- Improve landing page CTA (increase 30% → 40%)
- Simplify registration form (reduce 23 fields → 10)
- Send reminder emails (reduce no-shows 15% → 10%)
- Add submission incentives (increase 67% → 75%)

---

### Participation Trends

**Registrations over time:**
```
Registrations by Week (MongoHacks Spring)

150 │                              ╭─
120 │                        ╭─────╯
 90 │                  ╭─────╯
 60 │          ╭───────╯
 30 │  ╭───────╯
  0 ├──┴──────────────────────────────
    Week 1  Week 2  Week 3  Week 4  Week 5

Total: 856 registrations
Peak: Week 5 (deadline pressure)
```

**Insights:**
- 68% register in final week
- Early-bird incentive only captured 12%
- Consider extending deadline 1 week

---

### Team Formation

**Team stats:**
```
Team Formation Metrics

Total Participants:    856
On Teams:              742 (87%)
Solo:                  114 (13%)

Teams Created:         186
Avg Team Size:        3.98 members
Teams at Capacity:     42 (23%)

Formation Timeline:
Week 1-2:  18 teams (10%)
Week 3-4:  67 teams (36%)
Week 5:    101 teams (54%)  ← Deadline rush
```

**Team size distribution:**
```
Size  Teams  Percentage
1     114    13%  ████
2      34     4%  █
3      56     7%  ██
4      68     8%  ██
5      28     3%  █

Sweet spot: 3-4 members (majority)
```

---

### Project Submission

**Submission patterns:**
```
Projects Submitted: 486 / 856 participants (67%)

Submission Timeline:
0-4 hours before:   124 (26%)  ← Procrastinators!
4-8 hours before:    89 (18%)
8-12 hours before:   67 (14%)
12-24 hours before: 102 (21%)
>24 hours before:   104 (21%)

On-time:  486 (100%)
Late:       0 (deadline enforced)
```

**Quality indicators:**
```
Avg Repository Stars:    12.4
Avg Demo Video Length:  2m 43s
Avg Technologies Used:   5.6
Projects with README:   98%

High-quality markers (top 10%):
- 3+ external contributors
- 100+ commits during event
- Comprehensive documentation
- Video demo &lt;3 minutes
```

---

## Judging Analytics

The Judging analytics tab shows score averages across criteria (radar chart), score distribution, and a summary of average scores.

![Judging analytics with radar chart for score averages and bar chart for score distribution](/img/screenshots/admin-judging.png)

### Judge Performance

**Scoring statistics:**
```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableCell>Judge</TableCell>
      <TableCell>Projects Scored</TableCell>
      <TableCell>Avg Time</TableCell>
      <TableCell>Score Distribution</TableCell>
      <TableCell>Comments %</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>Sarah Johnson</TableCell>
      <TableCell>12</TableCell>
      <TableCell>18 min</TableCell>
      <TableCell>▂▃▅▇█▇▅▃▂</TableCell>
      <TableCell>100%</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Mark Chen</TableCell>
      <TableCell>15</TableCell>
      <TableCell>12 min</TableCell>
      <TableCell>▁▁▁▁▁▁▁▁█</TableCell>
      <TableCell>87%</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Judge consistency:**
```
Score Variance Analysis

Sarah:   σ = 1.2  (consistent)
Mark:    σ = 3.4  (wide variance)
Lisa:    σ = 0.8  (very consistent, possibly too lenient)

Recommendation: Normalize Mark's scores
```

---

### Scoring Distribution

**Overall score distribution:**
```
Score Distribution (All Projects)

Count
 40 │         ╭─╮
 30 │       ╭─╯ ╰─╮
 20 │     ╭─╯     ╰─╮
 10 │  ╭──╯         ╰──╮
  0 ├──┴────────────────┴──
    1  2  3  4  5  6  7  8  9  10

Mean: 6.8
Median: 7.0
Mode: 7
Std Dev: 1.4

Normal distribution (good sign)
```

**Category breakdown:**
```
Average Scores by Category

Innovation:     7.2 ██████████████▍
Technical:      8.1 ████████████████▎
Impact:         6.4 ████████████▊
Presentation:   7.8 ███████████████▌

Technical scores highest (expected)
Impact scores lowest (room for improvement)
```

---

## Participant Engagement

### Activity Heatmap

**When are participants most active?**
```
Activity Heatmap (Event Day)

Time  │ Activity Level
──────┼─────────────────────────────────
00:00 │ ▁
02:00 │ ▁
04:00 │ ▁
06:00 │ ▁
08:00 │ ▂▃▅  (Check-in)
10:00 │ ▇█▇  (Peak morning)
12:00 │ ▅▆▆  (Lunch dip)
14:00 │ ▇▇█  (Peak afternoon)
16:00 │ █▇▆  (Steady work)
18:00 │ ██▇  (Submission rush)
20:00 │ ▃▂   (Post-event)

Peak hours: 10-11 AM, 2-3 PM, 5-6 PM
```

---

### Skill Distribution

**Most common skills:**
```
Participant Skills (Top 20)

JavaScript    247 ████████████████████
Python        189 ███████████████
MongoDB       156 ████████████▌
React         134 ███████████
Node.js       112 █████████
TypeScript     98 ████████
AI/ML          87 ███████
Docker         76 ██████▎
AWS            67 █████▌
PostgreSQL     54 ████▌

Tech stack trends:
- Full-stack JS dominates
- MongoDB popularity growing
- AI/ML interest increasing
```

---

## Technology Insights

The Projects analytics tab shows project status pipeline, category distribution, submission trends, top technologies, and team size distribution.

![Project analytics with status, category, and technology charts](/img/screenshots/admin-projects.png)

### Tech Stack Analysis

**Most used technologies (projects):**
```
Technology Usage in Projects

1.  MongoDB        342 (70%)  ██████████████
2.  JavaScript     298 (61%)  ████████████▎
3.  Python         234 (48%)  █████████▋
4.  React          201 (41%)  ████████▎
5.  OpenAI         189 (39%)  ███████▊
6.  Node.js        167 (34%)  ██████▊
7.  Next.js        145 (30%)  ██████
8.  Docker         123 (25%)  █████
9.  AWS            112 (23%)  ████▋
10. TensorFlow      98 (20%)  ████

Growing: OpenAI (+45% vs last event)
Declining: jQuery (-23% vs last event)
```

**Tech combinations:**
```
Popular Stacks

MongoDB + Express + React + Node:     67 projects
Python + MongoDB + OpenAI:            54 projects
Next.js + MongoDB + TypeScript:       43 projects
React Native + MongoDB + Node:        32 projects
```

---

## AI Feature Usage

The AI Usage analytics tab tracks all AI API calls across providers (OpenAI and Voyage AI), showing calls by category, model distribution, daily usage, cost trends, and token consumption.

![AI Usage analytics showing calls by category, model distribution donut chart, and daily trends](/img/screenshots/admin-ai-usage.png)

### AI Metrics

**Feature adoption:**
```tsx
<Grid container spacing={2}>
  <Grid item xs={12} md={4}>
    <Card>
      <CardContent>
        <Typography variant="h6">Team Matching</Typography>
        <Typography variant="h4">87%</Typography>
        <Typography variant="caption">
          Participants used AI recommendations
        </Typography>
      </CardContent>
    </Card>
  </Grid>
  
  <Grid item xs={12} md={4}>
    <Card>
      <CardContent>
        <Typography variant="h6">Project Summaries</Typography>
        <Typography variant="h4">486/486</Typography>
        <Typography variant="caption">
          100% generation success rate
        </Typography>
      </CardContent>
    </Card>
  </Grid>
  
  <Grid item xs={12} md={4}>
    <Card>
      <CardContent>
        <Typography variant="h6">Feedback Synthesis</Typography>
        <Typography variant="h4">4.7/5</Typography>
        <Typography variant="caption">
          Avg team satisfaction rating
        </Typography>
      </CardContent>
    </Card>
  </Grid>
</Grid>
```

---

### AI Cost Analysis

**OpenAI spending:**
```
AI Cost Breakdown (MongoHacks Spring)

Embeddings (team matching):    $2.34
Project summaries (GPT-4):    $14.67
Feedback synthesis (GPT-4):   $19.23

Total AI Cost:                $36.24
Cost per Participant:          $0.04
Cost per Project:              $0.07

ROI: High (saves 15+ hours of manual work)
```

**Cost trends:**
```
AI Spending Over Time

$50  │                 ╭─
$40  │           ╭─────╯
$30  │     ╭─────╯
$20  │ ╭───╯
$10  │ ╯
 $0  ├─────────────────────
     Event 1  Event 2  Event 3

Growing but sustainable
Avg: $30-40 per 500-person event
```

---

## Financial Analytics

The Partners analytics tab shows sponsorship tier distribution, partner status, engagement levels, industry breakdown, and prize pool categories.

![Partner analytics with tier, status, and engagement donut charts plus industry and prize breakdowns](/img/screenshots/admin-partners.png)

### Revenue & Costs

**Event budget overview:**
```
MongoHacks Spring 2026 - Budget

Revenue:
  Sponsorships:           $150,000
  Ticket Sales:                $0  (free event)
  ───────────────────────────────
  Total Revenue:          $150,000

Costs:
  Venue:                  $15,000
  Food & Beverages:       $25,000
  Swag (t-shirts, etc):   $12,000
  Platform (MongoDB):      $2,400
  AI Features (OpenAI):       $36
  Staff:                  $10,000
  Prizes:                 $50,000
  ───────────────────────────────
  Total Costs:           $114,436

Net:                      $35,564

ROI: 31% margin
```

---

### Sponsorship ROI

**Partner value analysis:**
```
Sponsor ROI Metrics

MongoDB (Title Sponsor - $50k):
  Logo views:         12,458
  Website clicks:      1,247 (10% CTR)
  Booth visits:          487
  Resumes collected:      89
  Brand mentions:        234

Cost per interaction:   $40
Estimated brand value: $75k+
ROI: 150%

Verdict: Strong value, likely to renew
```

---

## Participant Feedback

The Feedback analytics tab shows response rates, NPS scores, response trends over time, and average ratings by question.

![Feedback analytics showing NPS distribution, response trends, and rating breakdowns](/img/screenshots/admin-feedback.png)

### Post-Event Survey

**Net Promoter Score (NPS):**
```
How likely are you to recommend MongoHacks?

Promoters (9-10):    487 (68%) ████████████████▊
Passives (7-8):      189 (26%) ███████▊
Detractors (0-6):     42 (6%)  █▌

NPS: 62 (68% - 6% = 62)

Benchmark: 50+ is excellent for events
```

**Satisfaction ratings:**
```
Event Satisfaction (1-5 scale)

Overall Experience:      4.3 ████▎
Event Organization:      4.6 ████▌
Venue/Facilities:        4.1 ████
Food Quality:            3.8 ███▊
Judging Fairness:        4.4 ████▍
AI Features:             4.7 ████▋
Project Support:         4.2 ████▎

Highest: AI Features (loved team matching!)
Lowest: Food Quality (consider upgrade)
```

---

### Verbatim Feedback

**Sentiment analysis:**
```
Feedback Sentiment

Positive:   542 (76%) 😊
Neutral:    134 (19%) 😐
Negative:    42 (5%)  😞

Common positive themes:
- "AI team matching was incredibly helpful"
- "Well-organized event"
- "Great networking opportunities"
- "Learned so much!"

Common complaints:
- "Food ran out early"
- "Needed more power outlets"
- "Wifi was slow at peak times"
```

---

## Benchmarking

### Event Comparisons

**Compare events:**
```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableCell>Event</TableCell>
      <TableCell>Participants</TableCell>
      <TableCell>Submission %</TableCell>
      <TableCell>NPS</TableCell>
      <TableCell>Cost/Person</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>MongoHacks Spring</TableCell>
      <TableCell>856</TableCell>
      <TableCell>67%</TableCell>
      <TableCell>62</TableCell>
      <TableCell>$134</TableCell>
    </TableRow>
    <TableRow sx={{ backgroundColor: 'success.light' }}>
      <TableCell>AI/ML Hackathon</TableCell>
      <TableCell>489</TableCell>
      <TableCell>78% ⬆</TableCell>
      <TableCell>68 ⬆</TableCell>
      <TableCell>$98 ⬇</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Student Hackathon</TableCell>
      <TableCell>342</TableCell>
      <TableCell>54% ⬇</TableCell>
      <TableCell>59 ⬇</TableCell>
      <TableCell>$87 ⬇</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Best practices from top performers:**
- AI/ML event had better submission rate → smaller, focused scope
- Lower cost/person → in-kind sponsor contributions
- Higher NPS → better food, stronger swag

---

## Predictive Analytics

### Forecasting

**Predict future event performance:**
```
Registration Forecast (Next Event)

Based on trends + seasonality:
Expected Registrations: 950 ± 120
Confidence: 85%

Recommended capacity: 1,000
Recommended early-bird: 200 slots
Expected submission rate: 72%
Expected projects: 684
```

**Churn prediction:**
```
Participant Retention Risk

High risk (won't return):    127 (15%)
Medium risk:                 234 (27%)
Low risk (likely return):    495 (58%)

Top churn factors:
- Poor experience (NPS &lt;7)
- Solo participant (no team)
- Didn't submit project
- Negative feedback

Action: Send re-engagement campaign to high-risk
```

---

## Export & Reporting

### Report Generation

**Export options:**
```tsx
<Menu>
  <MenuItem onClick={() => generateReport('executive-summary')}>
    Executive Summary (PDF)
  </MenuItem>
  <MenuItem onClick={() => generateReport('full-analytics')}>
    Full Analytics Report (PDF)
  </MenuItem>
  <MenuItem onClick={() => generateReport('sponsor-roi')}>
    Sponsor ROI Report (PDF)
  </MenuItem>
  <MenuItem onClick={() => generateReport('raw-data')}>
    Raw Data (CSV Bundle)
  </MenuItem>
</Menu>
```

**Executive summary:**
```
MongoHacks Spring 2026
Executive Summary

Event Performance
✅ 856 participants (target: 800)
✅ 67% submission rate (target: 60%)
✅ 62 NPS (target: 50+)
✅ $35k net revenue (budget: break-even)

Key Wins
- AI team matching adoption: 87%
- Sponsorship revenue: +23% vs last year
- Zero technical incidents
- Strong partner satisfaction

Areas for Improvement
- Food quality (3.8/5, target 4.5+)
- Wifi capacity (slow during peak)
- Increase early registrations (only 12%)

Recommendations
1. Upgrade venue wifi (add 2x bandwidth)
2. Partner with better caterer
3. Launch early-bird campaign 6 weeks out
4. Expand AI features (positive feedback)

ROI: 31% margin, strong foundation for growth
```

---

## Data Warehouse

### MongoDB Analytics

**Aggregation queries:**
```javascript
// Participant growth month-over-month
db.users.aggregate([
  {
    $match: {
      createdAt: { $gte: new Date('2026-01-01') }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      },
      count: { $sum: 1 }
    }
  },
  { $sort: { '_id.year': 1, '_id.month': 1 } }
]);

// Top technologies by event
db.projects.aggregate([
  { $unwind: '$technologies' },
  {
    $group: {
      _id: '$technologies',
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1 } },
  { $limit: 20 }
]);
```

---

## Best Practices

### Analytics Strategy

**What to track:**
1. Acquisition (where participants come from)
2. Activation (registration completion)
3. Retention (multi-event participation)
4. Referral (brought friends?)
5. Revenue (sponsorships, tickets)

**KPI framework:**
- Leading indicators (registrations, early engagement)
- Lagging indicators (NPS, submission rate)
- Actionable metrics (can influence outcomes)

**Cadence:**
- Real-time: Event day monitoring
- Daily: Registration tracking
- Weekly: Engagement trends
- Monthly: Strategic review
- Quarterly: Benchmarking

---

## Troubleshooting

### Data Discrepancies

**Common issues:**
```
Participant count mismatch:
  Users table: 856
  Participants table: 842

Cause: Some users registered but haven't created participant profile

Solution: Sync nightly via cron job
```

**Debugging:**
```javascript
// Find orphaned users
db.users.aggregate([
  {
    $lookup: {
      from: 'participants',
      localField: '_id',
      foreignField: 'userId',
      as: 'participant'
    }
  },
  {
    $match: { participant: { $size: 0 } }
  }
]);
```

---

## Next Steps

- [Create custom reports](/docs/admin/dashboard#export--reporting)
- [Set up automated alerts](/docs/admin/dashboard#alerts--notifications)
- [Export data for BI tools](/docs/admin/events#export--reports)
- [Configure event tracking](/docs/admin/events#analytics-overview)
