# Administrator Getting Started

Welcome to MongoDB Hackathons! This guide will walk you through the essential steps to set up and manage your first hackathon event.

## Prerequisites

- Administrator or Super Admin account access
- MongoDB Atlas cluster (for production)
- OpenAI API key (for AI features - optional but recommended)

## Quick Start Overview

As an administrator, you'll follow this workflow:

1. **Create an Event** - Set up your hackathon details
2. **Configure Settings** - Define teams, categories, and rules
3. **Set Up Judging** - Create criteria and assign judges
4. **Monitor Progress** - Track registrations and submissions
5. **Manage Results** - Review scores and publish winners

---

## Step 1: Access the Admin Dashboard

1. Log in to your account at `/login`
2. Click the **Admin** button in the navigation bar (top right)
3. You'll see the Admin Dashboard with key sections:
   - **Events** - Create and manage hackathons
   - **Users** - Manage participants and permissions
   - **Analytics** - View platform statistics
   - **Settings** - Configure platform-wide options

---

## Step 2: Create Your First Event

### Navigate to Events

1. From the Admin Dashboard, click **Events** in the sidebar
2. Click the **Create Event** button

### Fill Out Event Details

**Basic Information:**
- **Event Name** - Give your hackathon a clear, memorable name
  - Example: "MongoDB AI Hackathon 2026"
- **Slug** - URL-friendly identifier (auto-generated from name)
  - Example: `mongodb-ai-hackathon-2026`
- **Description** - Brief overview of the event (supports Markdown)
- **Tagline** - Short catchphrase for promotional materials

**Event Dates:**
- **Registration Opens** - When participants can start signing up
- **Registration Closes** - Last day to register
- **Event Start** - Hackathon kick-off date/time
- **Event End** - Submission deadline
- **Timezone** - Event timezone (important for deadlines)

**Location:**
- **Type** - In-person, Virtual, or Hybrid
- **Venue/Platform** - Physical address or virtual meeting link
- **City/Region** - For map display and search

**Event Settings:**
- **Max Participants** - Capacity limit (optional)
- **Team Size** - Min and max members per team
  - Example: Min 2, Max 5
- **Registration Required** - Require approval for participants
- **Public** - Visible on public event listing

**Categories & Tracks:**
Add project categories for participants to choose:
- Example: "AI/ML", "Web3", "Social Impact", "Mobile"

### Save and Publish

1. Click **Save Draft** to save without publishing
2. Click **Publish Event** when ready to go live
3. Event appears on the public events page at `/events`

---

## Step 3: Configure Event Settings

After creating your event, configure additional settings:

### Access Event Settings

1. Go to **Admin → Events**
2. Click on your event name
3. Click **Settings** tab

### Configure Registration

**Registration Form:**
- **Required Fields** - What info to collect from participants
  - Name, Email, GitHub profile, LinkedIn, etc.
- **Custom Questions** - Add event-specific questions
  - Example: "What's your experience level with AI?"

**Team Formation:**
- **Auto-matching** - Enable AI-powered team suggestions
- **Team Creation** - Allow participants to create teams
- **Join Codes** - Generate codes for private team invites

### Set Up Categories

**Project Categories:**
Define the tracks or themes participants can submit to:
- Name: "Artificial Intelligence"
- Description: "Projects using AI/ML technologies"
- Prizes: Optional category-specific awards

**Judging Criteria:**
Create scoring rubrics for judges:
- **Criteria Name** - Example: "Innovation"
- **Weight** - Importance (1-10)
- **Description** - What judges should evaluate

Example criteria:
- Innovation (10) - Originality and creativity
- Technical Complexity (8) - Implementation quality
- Impact (9) - Real-world usefulness
- Presentation (7) - Demo quality

---

## Step 4: Invite and Assign Judges

### Add Judges

1. Go to **Admin → Judges**
2. Click **Invite Judge**
3. Enter email addresses (comma-separated for bulk)
4. Judges receive invitation emails with login links

### Assign Judges to Projects

**Manual Assignment:**
1. Go to **Admin → Events → [Your Event] → Judging**
2. Click **Manage Assignments**
3. Assign judges to projects (aim for 3-5 judges per project)

**Auto-Assignment:**
1. Click **Auto-Assign** button
2. System distributes projects evenly across judges
3. Considers judge expertise and availability

### Configure Judging Settings

- **Judging Opens** - When judges can start scoring
- **Judging Closes** - Deadline for score submission
- **Anonymous Judging** - Hide team names from judges
- **Rubric** - Select scoring criteria

---

## Step 5: Monitor Registrations

### Track Sign-ups

1. Go to **Admin → Events → [Your Event] → Participants**
2. View real-time registration list:
   - Total registered
   - Teams formed
   - Solo participants
   - Registration status (pending/approved)

### Manage Participants

**Approve Registrations** (if required):
1. Click **Pending** tab
2. Review participant profiles
3. Click **Approve** or **Reject**

**Communicate with Participants:**
1. Click **Send Announcement**
2. Compose message (supports Markdown)
3. Select recipients (All / Teams / Individuals)
4. Schedule or send immediately

---

## Step 6: AI Features Setup (Optional)

Enable AI-powered features for enhanced event management:

### Project Summaries

**Setup:**
1. Add `OPENAI_API_KEY` to environment variables
2. Go to **Admin → Events → [Your Event] → AI Settings**
3. Enable **Project Summaries**

**What it does:**
- Automatically generates concise summaries of project submissions
- Helps judges quickly understand projects
- Uses GPT-4 for quality summaries

### Feedback Synthesis

**Setup:**
1. Go to **Admin → Settings → Feedback Forms**
2. Create feedback templates
3. Enable **AI Feedback Synthesis**

**What it does:**
- Aggregates judge feedback into actionable insights
- Identifies common themes and suggestions
- Provides participants with comprehensive feedback

### Team Matching

**Setup:**
1. Enable **AI Team Matching** in event settings
2. Configure matching criteria (skills, interests, experience)

**What it does:**
- Suggests compatible team members for solo participants
- Uses vector similarity on profiles
- Increases team formation success rate

---

## Step 7: During the Event

### Monitor Project Submissions

1. Go to **Admin → Events → [Your Event] → Projects**
2. View all submitted projects in real-time
3. Check for:
   - Demo links working
   - GitHub repos accessible
   - Required information complete

### Manage Issues

**Handle Submission Problems:**
- Edit project details if needed
- Contact teams for missing information
- Grant deadline extensions for technical issues

**Support Judges:**
- Monitor judging progress
- Answer judge questions
- Resolve scoring disputes

---

## Step 8: Results and Winners

### Review Scores

1. Go to **Admin → Events → [Your Event] → Judging → Results**
2. View leaderboard with aggregated scores
3. Check for:
   - All projects scored
   - No missing judge submissions
   - Score consistency (no outliers)

### Generate AI Feedback (Optional)

1. Click **Generate Feedback** button
2. AI synthesizes judge comments into comprehensive feedback
3. Review and edit generated feedback
4. Approve for sending to teams

### Publish Results

1. Go to **Results** tab
2. Review final rankings
3. Click **Publish Results**
4. Results appear on public results page
5. Participants receive notification emails

### Announce Winners

**On Platform:**
- Results automatically display at `/events/[slug]/results`
- Leaderboard shows top projects
- Category winners highlighted

**External Announcement:**
1. Export results as CSV/PDF
2. Share on social media
3. Send winner notifications via email
4. Schedule award ceremony (if applicable)

---

## Step 9: Post-Event Wrap-up

### Send Feedback to Participants

1. Go to **Admin → Events → [Your Event] → Feedback**
2. Select **Send Feedback** option
3. Choose recipients:
   - All teams
   - Specific teams
   - Winners only
4. Review AI-generated feedback summaries
5. Click **Send**

### Analyze Event Metrics

1. Go to **Admin → Analytics**
2. View event performance:
   - Registration trends
   - Submission rate
   - Judge participation
   - Popular categories
   - Engagement metrics

### Archive Event

1. Go to **Admin → Events → [Your Event] → Settings**
2. Click **Archive Event**
3. Event moves to archive but remains accessible
4. Results and projects stay public (if configured)

---

## Best Practices

### Before the Event

✅ **Test the flow** - Register a test participant and submit a dummy project  
✅ **Prep communication** - Draft announcement emails ahead of time  
✅ **Verify integrations** - Test GitHub, Discord, Slack connections  
✅ **Brief judges** - Send judging guidelines and rubric in advance  

### During the Event

✅ **Monitor actively** - Check registrations and submissions regularly  
✅ **Respond quickly** - Answer participant questions promptly  
✅ **Document issues** - Keep notes on technical problems for future events  
✅ **Backup data** - Export participant/project lists regularly  

### After the Event

✅ **Send thank-yous** - Acknowledge judges, sponsors, and participants  
✅ **Collect feedback** - Survey participants about their experience  
✅ **Review analytics** - Identify what worked and what didn't  
✅ **Share results** - Blog post, social media, press release  

---

## Troubleshooting

### Common Issues

**Problem:** Judges can't access projects  
**Solution:** Check judge assignments and ensure judging period is active

**Problem:** AI features not working  
**Solution:** Verify `OPENAI_API_KEY` is set and has sufficient credits

**Problem:** Results showing incorrect rankings  
**Solution:** Recalculate scores in Admin → Judging → Recalculate

**Problem:** Participants can't register  
**Solution:** Check event capacity and registration period dates

---

## Next Steps

Now that you've created your first event, explore these advanced features:

- [Partner Management](/docs/admin/partners) - Add sponsors and showcase their brands
- [Analytics Dashboard](/docs/admin/analytics) - Deep-dive into event metrics
- [User Management](/docs/admin/users) - Manage participant roles and permissions
- Custom branding, email templates, and webhooks - Coming soon!

---

## Need Help?

- **Documentation:** [https://docs.mongohacks.com](https://docs.mongohacks.com)
- **Community:** Join our Discord for admin support
- **Email:** support@mongohacks.com
- **GitHub Issues:** Report bugs and feature requests

Welcome aboard! We're excited to see the amazing hackathons you'll create. 🚀
