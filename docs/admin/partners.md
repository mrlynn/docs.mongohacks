---
sidebar_position: 4
---

# Partner Management

Manage event sponsors and partners with tiered recognition.

## Overview

Partners (sponsors) provide resources, prizes, and support for hackathons. The partner system manages logos, tiers, benefits, and display placement.

**URL:** `/admin/partners`

**Access:** Admin and organizer roles

---

## Partner Model

### Data Structure

```typescript
interface Partner {
  _id: ObjectId;
  name: string;
  slug: string;  // URL-friendly
  logoUrl: string;
  websiteUrl: string;
  description: string;
  tier: 'title' | 'platinum' | 'gold' | 'silver' | 'bronze' | 'community';
  
  // Contact
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  
  // Benefits
  benefits: string[];
  boothSpace?: boolean;
  speakingSlot?: boolean;
  talentRecruitment?: boolean;
  
  // Prizes
  prizes: Prize[];
  
  // Engagement
  events: ObjectId[];  // Events they sponsor
  active: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Tier System

### Sponsorship Tiers

**Title Sponsor:**
- **Investment:** $50,000+
- **Logo size:** Largest (200px height)
- **Placement:** Top billing, all materials
- **Benefits:**
  - Naming rights ("Powered by MongoDB")
  - Keynote speaking slot
  - Exclusive booth location
  - Logo on swag (t-shirts, stickers)
  - Social media mentions
  - Email header placement

**Platinum:**
- **Investment:** $20,000-$50,000
- **Logo size:** Large (120px height)
- **Placement:** Prominent, second tier
- **Benefits:**
  - Speaking slot (10-15 min)
  - Premium booth space
  - Logo on website
  - Social media posts
  - Recruiter access

**Gold:**
- **Investment:** $10,000-$20,000
- **Logo size:** Medium (80px height)
- **Placement:** Third tier
- **Benefits:**
  - Booth space
  - Logo on website
  - Email mention
  - Recruiter access

**Silver:**
- **Investment:** $5,000-$10,000
- **Logo size:** Small (60px height)
- **Placement:** Fourth tier
- **Benefits:**
  - Logo on website
  - Swag table presence

**Bronze:**
- **Investment:** $1,000-$5,000
- **Logo size:** Smallest (40px height)
- **Placement:** Fifth tier
- **Benefits:**
  - Logo on website
  - Thank you in closing

**Community:**
- **Investment:** In-kind (food, venue, etc.)
- **Logo size:** Small (40px height)
- **Placement:** Separate section
- **Benefits:**
  - Logo on website
  - Social media thank you

---

## Adding Partners

### Partner Creation Form

```tsx
<Dialog open={addingPartner} fullWidth maxWidth="md">
  <DialogTitle>Add Partner</DialogTitle>
  <DialogContent>
    <TextField
      label="Partner Name"
      value={name}
      onChange={e => setName(e.target.value)}
      fullWidth
      required
      sx={{ mb: 2 }}
    />
    
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Sponsorship Tier</InputLabel>
      <Select value={tier} onChange={e => setTier(e.target.value)}>
        <MenuItem value="title">
          Title Sponsor ($50k+) - Largest logo, naming rights
        </MenuItem>
        <MenuItem value="platinum">
          Platinum ($20k-$50k) - Large logo, speaking slot
        </MenuItem>
        <MenuItem value="gold">
          Gold ($10k-$20k) - Medium logo, booth
        </MenuItem>
        <MenuItem value="silver">
          Silver ($5k-$10k) - Small logo
        </MenuItem>
        <MenuItem value="bronze">
          Bronze ($1k-$5k) - Smallest logo
        </MenuItem>
        <MenuItem value="community">
          Community (In-kind) - Logo mention
        </MenuItem>
      </Select>
    </FormControl>
    
    <TextField
      label="Logo URL"
      value={logoUrl}
      onChange={e => setLogoUrl(e.target.value)}
      fullWidth
      required
      helperText="PNG with transparent background recommended"
      sx={{ mb: 2 }}
    />
    
    {logoUrl && (
      <Box sx={{ mb: 2, p: 2, border: '1px solid #ccc', textAlign: 'center' }}>
        <img 
          src={logoUrl} 
          alt="Logo preview"
          style={{ 
            maxHeight: tierSizes[tier],
            maxWidth: '100%'
          }}
        />
      </Box>
    )}
    
    <TextField
      label="Website URL"
      value={websiteUrl}
      onChange={e => setWebsiteUrl(e.target.value)}
      fullWidth
      required
      sx={{ mb: 2 }}
    />
    
    <TextField
      label="Description"
      value={description}
      onChange={e => setDescription(e.target.value)}
      fullWidth
      multiline
      rows={3}
      helperText="Brief company description"
      sx={{ mb: 2 }}
    />
    
    <Divider sx={{ my: 2 }}>Contact Information</Divider>
    
    <TextField
      label="Contact Name"
      value={contactName}
      onChange={e => setContactName(e.target.value)}
      fullWidth
      sx={{ mb: 2 }}
    />
    
    <TextField
      label="Contact Email"
      type="email"
      value={contactEmail}
      onChange={e => setContactEmail(e.target.value)}
      fullWidth
      sx={{ mb: 2 }}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setAddingPartner(false)}>Cancel</Button>
    <Button onClick={handleAddPartner} variant="contained">
      Add Partner
    </Button>
  </DialogActions>
</Dialog>
```

---

## Partner Benefits

### Benefits Checklist

**Tier-based benefits:**
```tsx
const TIER_BENEFITS = {
  title: [
    'Naming rights',
    'Keynote speaking slot (20 min)',
    'Exclusive booth location',
    'Logo on all swag',
    'Social media campaign',
    'Email header placement',
    'Recruiter full access',
    'VIP tickets (10)'
  ],
  platinum: [
    'Speaking slot (10-15 min)',
    'Premium booth space',
    'Logo on website',
    '3 social media posts',
    'Recruiter access',
    'VIP tickets (5)'
  ],
  gold: [
    'Booth space',
    'Logo on website',
    'Email mention',
    'Recruiter access',
    'VIP tickets (3)'
  ],
  silver: [
    'Logo on website',
    'Swag table presence',
    'VIP tickets (2)'
  ],
  bronze: [
    'Logo on website',
    'Closing thank you',
    'VIP tickets (1)'
  ],
  community: [
    'Logo on website',
    'Social media thank you'
  ]
};
```

**Custom benefits:**
```tsx
<Autocomplete
  multiple
  freeSolo
  options={TIER_BENEFITS[tier]}
  value={benefits}
  onChange={(_, newValue) => setBenefits(newValue)}
  renderInput={params => (
    <TextField {...params} label="Benefits" placeholder="Add benefit" />
  )}
/>
```

---

## Prize Management

### Partner-Sponsored Prizes

**Link prizes to partners:**
```typescript
interface Prize {
  _id: ObjectId;
  eventId: ObjectId;
  partnerId?: ObjectId;  // Optional sponsor
  name: string;
  description: string;
  value: number;
  category?: string;
  position?: number;  // 1st, 2nd, 3rd
  quantity: number;
}
```

**Prize creation with partner:**
```tsx
<Card>
  <CardHeader title="Add Prize" />
  <CardContent>
    <TextField
      label="Prize Name"
      value={prizeName}
      onChange={e => setPrizeName(e.target.value)}
      fullWidth
      placeholder="Best Use of MongoDB"
      sx={{ mb: 2 }}
    />
    
    <TextField
      label="Prize Value (USD)"
      type="number"
      value={prizeValue}
      onChange={e => setPrizeValue(parseInt(e.target.value))}
      fullWidth
      sx={{ mb: 2 }}
    />
    
    <Autocomplete
      options={partners}
      getOptionLabel={p => p.name}
      value={sponsor}
      onChange={(_, newValue) => setSponsor(newValue)}
      renderInput={params => (
        <TextField {...params} label="Sponsored By (Optional)" />
      )}
    />
    
    {sponsor && (
      <Alert severity="info" sx={{ mt: 2 }}>
        This prize will be attributed to {sponsor.name} in results and announcements.
      </Alert>
    )}
  </CardContent>
</Card>
```

---

## Landing Page Display

### Partner Logo Grid

**Tiered display:**
```tsx
<Box sx={{ mt: 8 }}>
  <Typography variant="h3" align="center" gutterBottom>
    Our Partners
  </Typography>
  
  {/* Title Sponsors */}
  {titleSponsors.length > 0 && (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" align="center" color="text.secondary" gutterBottom>
        Title Sponsor
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        gap: 6,
        mb: 4
      }}>
        {titleSponsors.map(partner => (
          <a 
            href={partner.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            key={partner._id}
          >
            <img 
              src={partner.logoUrl}
              alt={partner.name}
              style={{ height: 200, objectFit: 'contain' }}
            />
          </a>
        ))}
      </Box>
    </Box>
  )}
  
  {/* Platinum Sponsors */}
  {platinumSponsors.length > 0 && (
    <Box sx={{ mb: 5 }}>
      <Typography variant="h6" align="center" color="text.secondary" gutterBottom>
        Platinum Partners
      </Typography>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 4
      }}>
        {platinumSponsors.map(partner => (
          <a href={partner.websiteUrl} target="_blank" key={partner._id}>
            <img 
              src={partner.logoUrl}
              alt={partner.name}
              style={{ height: 120 }}
            />
          </a>
        ))}
      </Box>
    </Box>
  )}
  
  {/* Gold Sponsors */}
  {goldSponsors.length > 0 && (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
        Gold Partners
      </Typography>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 3
      }}>
        {goldSponsors.map(partner => (
          <a href={partner.websiteUrl} target="_blank" key={partner._id}>
            <img src={partner.logoUrl} alt={partner.name} style={{ height: 80 }} />
          </a>
        ))}
      </Box>
    </Box>
  )}
  
  {/* Silver & Bronze combined */}
  {[...silverSponsors, ...bronzeSponsors].length > 0 && (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle2" align="center" color="text.secondary" gutterBottom>
        Supporting Partners
      </Typography>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        {[...silverSponsors, ...bronzeSponsors].map(partner => (
          <a href={partner.websiteUrl} target="_blank" key={partner._id}>
            <img src={partner.logoUrl} alt={partner.name} style={{ height: 50 }} />
          </a>
        ))}
      </Box>
    </Box>
  )}
  
  {/* Community Partners */}
  {communityPartners.length > 0 && (
    <Box>
      <Typography variant="caption" align="center" color="text.secondary" display="block" gutterBottom>
        Community Partners
      </Typography>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 2,
        opacity: 0.7
      }}>
        {communityPartners.map(partner => (
          <a href={partner.websiteUrl} target="_blank" key={partner._id}>
            <img src={partner.logoUrl} alt={partner.name} style={{ height: 40 }} />
          </a>
        ))}
      </Box>
    </Box>
  )}
</Box>
```

---

## Partner Analytics

### Engagement Metrics

**Track partner ROI:**
```tsx
<Card>
  <CardHeader title={partner.name} subheader={`${partner.tier} sponsor`} />
  <CardContent>
    <Grid container spacing={2}>
      <Grid item xs={6} md={3}>
        <Typography variant="h4">{logoViews}</Typography>
        <Typography variant="caption">Logo Views</Typography>
      </Grid>
      
      <Grid item xs={6} md={3}>
        <Typography variant="h4">{websiteClicks}</Typography>
        <Typography variant="caption">Website Clicks</Typography>
      </Grid>
      
      <Grid item xs={6} md={3}>
        <Typography variant="h4">{boothVisits}</Typography>
        <Typography variant="caption">Booth Visits</Typography>
      </Grid>
      
      <Grid item xs={6} md={3}>
        <Typography variant="h4">{resumesCollected}</Typography>
        <Typography variant="caption">Resumes Collected</Typography>
      </Grid>
    </Grid>
    
    <Divider sx={{ my: 2 }} />
    
    <Typography variant="subtitle2" gutterBottom>
      Events Sponsored
    </Typography>
    <Stack spacing={1}>
      {partner.events.map(event => (
        <Chip 
          key={event._id}
          label={event.name}
          size="small"
          variant="outlined"
        />
      ))}
    </Stack>
  </CardContent>
</Card>
```

---

## Recurring Partners

### Multi-Event Sponsorship

**Assign to multiple events:**
```tsx
<Card>
  <CardHeader title="Event Sponsorships" />
  <CardContent>
    <Autocomplete
      multiple
      options={allEvents}
      getOptionLabel={event => event.name}
      value={partner.events}
      onChange={(_, newValue) => handleUpdateEvents(newValue)}
      renderInput={params => (
        <TextField {...params} label="Sponsored Events" />
      )}
    />
    
    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
      This partner will appear on landing pages for all selected events.
    </Typography>
  </CardContent>
</Card>
```

**Discount for recurring:**
```
Annual Partnership Package:
- 4 events per year
- Platinum tier all events
- 20% discount ($160k instead of $200k)
```

---

## Swag & Materials

### Partner Swag Integration

**Swag table management:**
```tsx
<Card>
  <CardHeader title="Swag & Materials" />
  <CardContent>
    <FormControlLabel
      control={
        <Checkbox 
          checked={partner.swagTable}
          onChange={e => handleToggleSwag(e.target.checked)}
        />
      }
      label="Partner has swag table"
    />
    
    {partner.swagTable && (
      <Box sx={{ mt: 2 }}>
        <TextField
          label="Table Location"
          value={tableLocation}
          onChange={e => setTableLocation(e.target.value)}
          fullWidth
          placeholder="E.g., Table 3, near entrance"
        />
        
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Swag Items
        </Typography>
        <Stack spacing={1}>
          {swagItems.map((item, idx) => (
            <TextField
              key={idx}
              value={item}
              onChange={e => updateSwagItem(idx, e.target.value)}
              placeholder="E.g., T-shirts, stickers, pens"
              fullWidth
              size="small"
            />
          ))}
        </Stack>
        <Button size="small" onClick={addSwagItem}>
          + Add Item
        </Button>
      </Box>
    )}
  </CardContent>
</Card>
```

---

## Recruiter Access

### Talent Recruitment

**Grant resume access:**
```tsx
<Card>
  <CardHeader title="Recruiting Permissions" />
  <CardContent>
    <FormControlLabel
      control={
        <Checkbox 
          checked={partner.talentRecruitment}
          onChange={e => handleToggleRecruitment(e.target.checked)}
        />
      }
      label="Allow talent recruitment"
    />
    
    {partner.talentRecruitment && (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          Partner can:
          <ul>
            <li>View participant profiles (opt-in only)</li>
            <li>Collect resumes at booth</li>
            <li>Schedule interviews</li>
            <li>Access resume book (post-event)</li>
          </ul>
        </Alert>
        
        <TextField
          label="Recruiter Email"
          type="email"
          value={recruiterEmail}
          onChange={e => setRecruiterEmail(e.target.value)}
          fullWidth
          sx={{ mt: 2 }}
          helperText="Access link will be sent to this email"
        />
      </Box>
    )}
  </CardContent>
</Card>
```

**Resume book generation:**
```typescript
async function generateResumeBook(eventId: string, partnerId: string) {
  const participants = await Participant.find({
    'registeredEvents.eventId': eventId,
    shareWithSponsors: true  // Opt-in
  }).populate('userId', 'name email');
  
  const pdf = new PDFDocument();
  
  for (const p of participants) {
    pdf.addPage();
    pdf.fontSize(16).text(p.userId.name);
    pdf.fontSize(12).text(p.userId.email);
    pdf.fontSize(10).text(`Skills: ${p.skills.join(', ')}`);
    pdf.text(p.bio || '');
    
    if (p.githubUsername) {
      pdf.text(`GitHub: github.com/${p.githubUsername}`);
    }
  }
  
  pdf.end();
  return pdf;
}
```

---

## Communication

### Partner Updates

**Send updates to partners:**
```tsx
<Button
  variant="outlined"
  onClick={() => sendPartnerUpdate(partner._id)}
>
  Send Update Email
</Button>
```

**Update template:**
```html
Subject: MongoHacks Spring 2026 - Partner Update

Hi {ContactName},

Quick update on MongoHacks Spring 2026:

Registrations: 142 / 150 (95% capacity!)
Teams Formed: 38 teams
Projects Submitted: 38 (100% submission rate)

Your Logo:
- Landing page views: 1,247
- Click-throughs to your website: 89 (7.1% CTR)

Booth Setup:
- Location: Table 3, near main entrance
- Setup time: March 18, 8:00 AM - 9:00 AM

Speaking Slot:
- Time: 10:30 AM - 10:45 AM
- Room: Main auditorium
- AV: HDMI connection, wireless mic

Questions? Reply to this email.

Thanks for your support!
MongoHacks Team
```

---

## Invoice & Billing

### Sponsorship Invoicing

**Generate invoice:**
```tsx
<Button
  variant="contained"
  startIcon={<Receipt />}
  onClick={() => generateInvoice(partner._id)}
>
  Generate Invoice
</Button>
```

**Invoice template:**
```
INVOICE

From:
MongoHacks Organization
123 Main Street
San Francisco, CA 94102

To:
{Partner Name}
{Contact Name}
{Partner Address}

Invoice #: MH-2026-001
Date: March 1, 2026
Due: March 15, 2026

Item                          Amount
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platinum Sponsorship          $30,000
MongoHacks Spring 2026

Benefits:
- Speaking slot (15 min)
- Premium booth space
- Logo on website & materials
- Social media mentions (3 posts)
- Recruiter access
- VIP tickets (5)

Total Due:                    $30,000

Payment Methods:
- Wire transfer: [account details]
- Check payable to: MongoHacks Organization
- Online: mongohacks.com/pay/invoice-001

Thank you for your support!
```

---

## Best Practices

### Sponsorship Sales

**Pricing strategy:**
- Set tiers based on budget capacity
- Offer early-bird discounts (20% off if committed 3+ months early)
- Bundle multi-event packages
- Upsell benefits (speaking → keynote for +$5k)

**Sales funnel:**
```
Prospects:     50 companies
Outreach sent: 50 (100%)
Responses:     20 (40%)
Proposals:     15 (30%)
Commitments:   10 (20%)

Total revenue: $150,000
```

---

### Logo Guidelines

**Request from partners:**
- High-resolution PNG (transparent background)
- Minimum 500px width
- Vector format (SVG) preferred
- Horizontal orientation
- Single color or full color versions

**Quality check:**
```tsx
{logoUrl && (
  <Alert severity={logoQuality < 500 ? 'warning' : 'success'}>
    Logo resolution: {logoWidth}x{logoHeight}px
    {logoQuality < 500 && ' (Recommend 500px+ width for clarity)'}
  </Alert>
)}
```

---

### Relationship Management

**Keep partners engaged:**
- Monthly update emails
- Logo click-through reports
- Post-event survey results
- Early renewal offers
- Thank you cards/gifts

**Renewal strategy:**
```
60 days before event:
- Send renewal invitation
- Offer same tier at last year's price
- Highlight previous year's success

30 days before:
- Follow-up call
- Discuss upgraded benefits

14 days before:
- Final renewal deadline
- Open tier to new sponsors if declined
```

---

## Troubleshooting

### Logo Not Displaying

**Check:**
1. logoUrl is valid and accessible
2. Image is PNG/JPG (not PDF)
3. File size reasonable (&lt;1MB)
4. No CORS issues

**Debug:**
```tsx
<img 
  src={partner.logoUrl}
  alt={partner.name}
  onError={e => {
    console.error('Logo failed to load:', partner.logoUrl);
    e.target.src = '/placeholder-logo.png';
  }}
/>
```

---

### Partner Not Listed

**Possible causes:**
- `active: false` in database
- Not assigned to this event
- Tier filter hiding them

**Solution:**
```javascript
// Check partner status
db.partners.findOne({ slug: 'partner-slug' }, {
  active: 1,
  events: 1,
  tier: 1
});
```

---

## Next Steps

- [Create event with partners](/docs/admin/events#step-6-categories--prizes)
- [View partner analytics](/docs/admin/analytics)
- [Manage prizes](/docs/features/results#prize-attribution)
- [Export partner report](/docs/admin/dashboard#export--reporting)
