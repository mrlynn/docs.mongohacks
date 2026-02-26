---
sidebar_position: 3
---

# Registration

Event registration system for hackathon participants.

## Overview

Registration is the entry point for participants. The system handles:
- Account creation (if new user)
- Event enrollment
- Participant profile setup
- Skill embedding generation (for AI matching)

**One registration per event** - Users can register for multiple events but only once per event.

---

## Registration Flow

### From Landing Page

1. Visit event landing page (`/events/[slug]`)
2. Click "Register Now" button
3. Fill registration form
4. Submit
5. Auto-login
6. Redirect to Event Hub

**Total time:** 2-3 minutes for new users, <30 seconds for returning users

---

## Registration Form

### Tier 1: Basic Information (Always Required)

**Fields:**
- **Name** - Full name (2-100 characters)
- **Email** - Used for login and notifications (must be unique)
- **Password** - Min 8 characters (if new user)
- **Skills** - Multi-select tags (1-10 skills required)

**Skill options (example):**
- Languages: Python, JavaScript, Java, C++, Go, Rust
- Frontend: React, Vue, Angular, Next.js, Svelte
- Backend: Node.js, Express, Django, FastAPI
- Databases: MongoDB, PostgreSQL, MySQL, Redis
- AI/ML: OpenAI, TensorFlow, PyTorch, Vector Search
- Cloud: AWS, Azure, GCP, Docker, Kubernetes

**Why skills matter:**
- Used for AI team matching
- Helps form balanced teams
- Visible to team leaders
- Powers recommendations

---

### Tier 2: Advanced Profile (Optional)

**Configurable fields:**
- **Experience Level** - Beginner, Intermediate, Advanced, Expert
- **GitHub Username** - Links to profile
- **LinkedIn URL** - Professional profile
- **Portfolio URL** - Personal website
- **Bio** - 200 character intro

**When to enable:**
- Larger events (100+ participants)
- Career-focused hackathons
- When recruiting matters
- Professional networking events

**When to skip:**
- Small events (<50 people)
- Student-only hackathons
- Time-constrained events
- Simple registrations preferred

---

### Tier 3: Custom Questions (Event-Specific)

**Examples:**

**Question types:**
```yaml
Text Input:
  Label: "What do you want to build?"
  Type: text
  Placeholder: "Brief description..."
  Required: false

Select Dropdown:
  Label: "Have you used MongoDB before?"
  Type: select
  Options: ["Yes - extensively", "Yes - a little", "No - first time"]
  Required: true

Multi-Select:
  Label: "Which workshops interest you?"
  Type: multiselect
  Options: ["Vector Search", "AI Integration", "Atlas Basics"]
  Required: false

Checkbox:
  Label: "I agree to the Code of Conduct"
  Type: checkbox
  Required: true
```

**Use cases:**
- Dietary restrictions (for food)
- T-shirt sizes
- Travel arrangements
- Workshop preferences
- Team preferences
- Code of Conduct acceptance

---

## Validation Rules

### Email Validation

**Checks:**
- Valid email format (user@domain.com)
- Not already registered for this event
- Not temporary/disposable email (optional)

**Error messages:**
- "Email already registered for this event"
- "Invalid email format"
- "Please use a permanent email address"

---

### Password Requirements

**Minimum requirements:**
- 8 characters long
- At least one letter
- At least one number

**Recommended:**
- Mix of upper and lowercase
- Special characters
- 12+ characters

**Why simple:** Balance security with user friction. Most users use password managers anyway.

---

### Skills Validation

**Rules:**
- Minimum: 1 skill
- Maximum: 10 skills
- Must select from predefined list (prevents typos)

**Why limited:**
- Quality > quantity
- Forces focus on core skills
- Better matching results
- Prevents spam/noise

---

## Capacity Management

### Event Full Handling

**When capacity reached:**
```
Event Full
156 / 150 participants registered

Waitlist available:
[Join Waitlist] button
```

**Waitlist features:**
- Automatic notifications when spots open
- Priority based on join time
- Email alerts
- Can leave waitlist anytime

**Organizer controls:**
- Increase capacity
- Manually add from waitlist
- Clear waitlist
- Export waitlist emails

---

### Registration Closing

**Events can close:**
- When capacity reached
- At registration deadline
- Manually by organizers

**Closed states:**
```
Registration Closed
Event is full (150/150)

Registration Closed
Deadline passed (Started 2 days ago)

Registration Closed
Organizers have closed registration
```

---

## Auto-Login After Registration

### How It Works

1. User submits registration form
2. Backend creates User + Participant records
3. NextAuth session created automatically
4. Cookie set (next-auth.session-token)
5. Redirect to Event Hub
6. User is logged in

**Why auto-login:**
- Reduces friction (no separate login step)
- Better UX (immediate access to hub)
- Higher completion rate
- Matches user expectations

**Security:**
- Session expires after 30 days
- Can logout anytime
- Secure httpOnly cookies
- CSRF protection

---

## Participant Profile

### Created on Registration

```typescript
{
  _id: ObjectId,
  userId: ObjectId → User,
  skills: ["Python", "MongoDB", "React"],
  skillsEmbedding: [0.023, -0.145, ...], // 1536 dims
  bio: "Full-stack developer interested in AI",
  experienceLevel: "intermediate",
  githubUsername: "alice",
  registeredEvents: [{
    eventId: ObjectId,
    registeredAt: Date
  }],
  teamId: null, // Set when joining team
  createdAt: Date,
  updatedAt: Date
}
```

**Purpose:**
- Separate user account from event participation
- Track multiple event registrations
- Store event-specific data (skills, bio)
- Enable cross-event analytics

---

## Skill Embedding Generation

### AI-Powered Team Matching

**On registration:**
```typescript
// 1. Combine skills into text
const skillText = skills.join(' ') + ' ' + bio;
// "Python MongoDB React Full-stack developer interested in AI"

// 2. Generate embedding via OpenAI
const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: skillText
});

// 3. Store 1536-dim vector
participant.skillsEmbedding = embedding.data[0].embedding;
await participant.save();
```

**Why embeddings:**
- Semantic matching (not just keywords)
- "Machine Learning" ≈ "ML" ≈ "Data Science"
- "MongoDB" ≈ "Databases" ≈ "NoSQL"
- Better team recommendations

**Cost:** ~$0.0001 per participant (negligible)

**Async generation:**
- Doesn't block registration
- Generated in background
- Usually completes in 1-2 seconds
- Fallback to tag-overlap if fails

---

## Technical Implementation

### Registration API

```http
POST /api/events/:eventId/register
```

**Request body:**
```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "password": "securePassword123",
  "skills": ["Python", "MongoDB", "React"],
  "experienceLevel": "intermediate",
  "bio": "Full-stack developer interested in AI"
}
```

**Backend logic:**
```typescript
1. Validate input (Zod schema)
2. Check capacity not exceeded
3. Check email not already registered
4. Hash password (bcrypt)
5. Create User document
6. Create Participant document
7. Generate skill embedding (async)
8. Create session (NextAuth)
9. Return success + redirect URL
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful!",
  "data": {
    "participant": { "_id": "...", "userId": "..." },
    "user": { "_id": "...", "email": "..." }
  },
  "redirectTo": "/events/abc123/hub"
}
```

---

### Form State Management

**Client-side (React):**
```tsx
const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
  skills: [],
  experienceLevel: 'beginner',
  bio: ''
});

const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  const response = await fetch('/api/events/123/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  const data = await response.json();
  
  if (data.success) {
    router.push(data.redirectTo);
  } else {
    setErrors(data.errors);
    setLoading(false);
  }
};
```

**UX improvements:**
- Real-time validation (as user types)
- Clear error messages
- Loading state during submission
- Disable submit while loading
- Auto-focus first error field

---

## Error Handling

### Common Errors

**Email already registered:**
```json
{
  "success": false,
  "error": "Email already registered for this event",
  "code": "DUPLICATE_EMAIL"
}
```

**Action:** Show "Already registered?" link to login page

---

**Event full:**
```json
{
  "success": false,
  "error": "Event has reached capacity (150/150)",
  "code": "EVENT_FULL"
}
```

**Action:** Show waitlist signup option

---

**Registration closed:**
```json
{
  "success": false,
  "error": "Registration is closed for this event",
  "code": "REGISTRATION_CLOSED"
}
```

**Action:** Show event status and contact info

---

**Validation errors:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters",
    "skills": "Please select at least 1 skill"
  }
}
```

**Action:** Highlight fields with errors, show messages

---

## Email Confirmation (Optional)

### Two-Step Verification

**If enabled:**
1. User submits registration
2. Account created but not verified
3. Email sent with confirmation link
4. User clicks link to verify
5. Account activated
6. Can login and access event

**Benefits:**
- Reduces fake registrations
- Validates email addresses
- Prevents typos
- Higher quality participants

**Drawbacks:**
- Extra friction (lowers completion rate)
- Email deliverability issues
- Users forget to check email
- May lose legitimate registrations

**Recommendation:** Skip for most hackathons (friction not worth it). Use only for:
- Very large events (500+ participants)
- Prize money events (reduce spam)
- Corporate/professional hackathons

---

## Analytics

### Registration Metrics

**Track:**
- Registrations per day
- Conversion rate (landing page → registration)
- Drop-off points (which fields cause abandonment)
- Time to complete registration
- Mobile vs desktop registrations
- Skill distribution
- Experience level breakdown

**Goals:**
- 70%+ conversion from landing page
- <5% form abandonment
- <2 minutes average completion time
- <20% mobile registrations (forms easier on desktop)

---

## Best Practices

### For Organizers

**Form design:**
- Keep it short (essential fields only)
- Group related fields
- Use clear labels and placeholders
- Provide examples
- Enable auto-complete
- Mobile-responsive design

**Capacity planning:**
- Set realistic limits (venue, resources)
- Leave 10-20% buffer for no-shows
- Monitor registrations daily
- Increase capacity early if needed
- Close registration 1-2 days before event

**Communication:**
- Confirmation email immediately
- Reminder 1 week before
- Logistics email 2 days before
- Day-of instructions morning of event

---

### For Participants

**Choosing skills:**
- Be honest (don't oversell)
- Choose current skills (not learning goals)
- Include both technical and soft skills
- Specific > generic ("React" > "Frontend")

**Profile completeness:**
- Fill optional fields (better matching)
- Add GitHub (shows your work)
- Write bio (helps teams recruit you)
- Use professional email

**After registration:**
- Check confirmation email
- Add event to calendar
- Join Discord/Slack
- Browse teams early

---

## Troubleshooting

### "Email already registered"

**Solutions:**
1. Login instead (maybe you already registered)
2. Use different email
3. Contact organizers to check status

---

### Confirmation email not received

**Check:**
1. Spam/junk folder
2. Email typo in registration
3. Email provider blocking

**Solutions:**
- Check spam
- Add noreply@mongohacks.com to contacts
- Contact support with name/email used

---

### Cannot select skills

**Causes:**
- JavaScript disabled
- Browser compatibility
- Loading error

**Solutions:**
- Enable JavaScript
- Try different browser (Chrome/Firefox)
- Clear cache and reload

---

## Security Considerations

### Password Handling

**Server-side:**
- Never store plaintext passwords
- Use bcrypt with salt rounds = 10
- Minimum 8 characters enforced
- Optional: check against breach database

**Client-side:**
- Password strength indicator
- Show/hide toggle
- Auto-generate option (future)

---

### CSRF Protection

**NextAuth handles:**
- CSRF token in forms
- Validates on submission
- Rotating session tokens
- Secure cookie flags

---

### Rate Limiting

**Prevent abuse:**
- Max 5 registrations per IP per hour
- Max 3 attempts with same email
- Captcha after 2 failures (optional)

---

## Accessibility

### WCAG 2.1 AA Compliance

**Requirements:**
- Keyboard navigation (no mouse required)
- Screen reader support
- Sufficient color contrast (4.5:1)
- Error messages associated with fields
- Skip links for navigation
- ARIA labels on form controls

**Testing:**
- VoiceOver (macOS)
- NVDA (Windows)
- Lighthouse accessibility audit
- Axe DevTools

---

## Next Steps

- [Complete your profile](/docs/features/event-hub#your-profile)
- [Join or create a team](/docs/features/teams)
- [Browse event resources](/docs/features/event-hub#resources)
- [Understand the Event Hub](/docs/features/event-hub)
