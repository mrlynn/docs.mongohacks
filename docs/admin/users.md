---
sidebar_position: 5
---

# User Management

Manage user accounts, roles, permissions, and platform access.

## Overview

User management provides centralized control over platform accounts, role assignments, and access permissions.

**URL:** `/admin/users`

**Access:** Super admin only (sensitive operations)

---

## User Model

### Data Structure

```typescript
interface User {
  _id: ObjectId;
  name: string;
  email: string;  // unique
  password: string;  // bcrypt hashed
  role: 'participant' | 'judge' | 'organizer' | 'admin' | 'super_admin';
  
  // Profile
  avatar?: string;
  bio?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  
  // Account status
  active: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

---

## User List

### All Users Table

**Filterable list:**

| Name | Email | Role | Status | Events | Last Login | Actions |
|------|-------|------|--------|--------|------------|---------|
| Alice Smith | alice@example.com | Participant | ✅ Active | 3 | 2 hours ago | [Edit] [Deactivate] |
| Bob Jones | bob@example.com | Judge | ✅ Active | 1 | Yesterday | [Edit] [View] |
| Carol Lee | carol@example.com | Organizer | ✅ Active | 5 | 1 week ago | [Edit] [Promote] |
| Dan Kim | dan@example.com | Participant | 🔴 Inactive | 0 | Never | [Activate] [Delete] |

**Filters:**
- Role (all, participant, judge, organizer, admin)
- Status (active, inactive, unverified)
- Registration date range
- Last login (active users, dormant >30 days)
- Search by name or email

**Sort options:**
- Name (A-Z)
- Email (A-Z)
- Created date (newest first)
- Last login (most recent first)
- Event count (most active first)

---

## Role System

### Role Hierarchy

```
super_admin (highest privileges)
  ↓
admin (platform-wide access)
  ↓
organizer (event management)
  ↓
judge (scoring only)
  ↓
participant (lowest privileges)
```

**Permission matrix:**

| Action | Participant | Judge | Organizer | Admin | Super Admin |
|--------|-------------|-------|-----------|-------|-------------|
| Register for events | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create teams | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit projects | ✅ | ❌ | ✅ | ✅ | ✅ |
| Score projects | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create events | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage judges | ❌ | ❌ | ✅ | ✅ | ✅ |
| Publish results | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage admins | ❌ | ❌ | ❌ | ❌ | ✅ |
| System settings | ❌ | ❌ | ❌ | ❌ | ✅ |

---

### Role Assignment

**Change user role:**
```tsx
<FormControl fullWidth>
  <InputLabel>User Role</InputLabel>
  <Select 
    value={user.role}
    onChange={handleRoleChange}
  >
    <MenuItem value="participant">Participant</MenuItem>
    <MenuItem value="judge">Judge</MenuItem>
    <MenuItem value="organizer">Organizer</MenuItem>
    <MenuItem value="admin">Admin</MenuItem>
    {isSuperAdmin && (
      <MenuItem value="super_admin">Super Admin</MenuItem>
    )}
  </Select>
</FormControl>
```

**Confirmation dialog:**
```tsx
<Dialog open={confirmingRoleChange}>
  <DialogTitle>Change User Role?</DialogTitle>
  <DialogContent>
    <Alert severity="warning">
      <AlertTitle>This will immediately change permissions</AlertTitle>
      <Typography variant="body2">
        Changing {user.name}'s role from <strong>{oldRole}</strong> to <strong>{newRole}</strong> will:
      </Typography>
      <ul>
        {roleChangeSummary.map(change => (
          <li key={change}>{change}</li>
        ))}
      </ul>
    </Alert>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmingRoleChange(false)}>Cancel</Button>
    <Button onClick={handleConfirmRoleChange} variant="contained" color="warning">
      Confirm Role Change
    </Button>
  </DialogActions>
</Dialog>
```

---

## Account Management

### Edit User

**User edit form:**
```tsx
<Dialog open={editingUser} fullWidth maxWidth="md">
  <DialogTitle>Edit User</DialogTitle>
  <DialogContent>
    <TextField
      label="Name"
      value={name}
      onChange={e => setName(e.target.value)}
      fullWidth
      sx={{ mb: 2 }}
    />
    
    <TextField
      label="Email"
      type="email"
      value={email}
      onChange={e => setEmail(e.target.value)}
      fullWidth
      disabled
      helperText="Email cannot be changed (used for login)"
      sx={{ mb: 2 }}
    />
    
    <FormControlLabel
      control={
        <Switch 
          checked={active}
          onChange={e => setActive(e.target.checked)}
        />
      }
      label="Account Active"
    />
    
    <FormControlLabel
      control={
        <Switch 
          checked={emailVerified}
          onChange={e => setEmailVerified(e.target.checked)}
        />
      }
      label="Email Verified"
    />
    
    <Divider sx={{ my: 2 }}>Profile</Divider>
    
    <TextField
      label="GitHub Username"
      value={githubUsername}
      onChange={e => setGithubUsername(e.target.value)}
      fullWidth
      sx={{ mb: 2 }}
    />
    
    <TextField
      label="LinkedIn URL"
      value={linkedinUrl}
      onChange={e => setLinkedinUrl(e.target.value)}
      fullWidth
      sx={{ mb: 2 }}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setEditingUser(false)}>Cancel</Button>
    <Button onClick={handleSaveUser} variant="contained">
      Save Changes
    </Button>
  </DialogActions>
</Dialog>
```

---

### Deactivate Account

**Soft delete (preserves data):**
```tsx
<Button
  color="error"
  variant="outlined"
  onClick={() => handleDeactivate(user._id)}
>
  Deactivate Account
</Button>

<Dialog open={confirmingDeactivation}>
  <DialogTitle>Deactivate Account?</DialogTitle>
  <DialogContent>
    <Alert severity="warning">
      <AlertTitle>This will prevent login but preserve data</AlertTitle>
      <Typography variant="body2">
        Deactivating {user.name}'s account will:
      </Typography>
      <ul>
        <li>Prevent login</li>
        <li>Hide profile from searches</li>
        <li>Preserve event registrations</li>
        <li>Preserve team memberships</li>
        <li>Preserve project submissions</li>
      </ul>
      <Typography variant="body2" sx={{ mt: 1 }}>
        This action can be reversed by reactivating the account.
      </Typography>
    </Alert>
    
    <TextField
      label="Reason for Deactivation (Internal)"
      value={deactivationReason}
      onChange={e => setDeactivationReason(e.target.value)}
      fullWidth
      multiline
      rows={3}
      sx={{ mt: 2 }}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmingDeactivation(false)}>Cancel</Button>
    <Button onClick={handleConfirmDeactivation} variant="contained" color="error">
      Deactivate
    </Button>
  </DialogActions>
</Dialog>
```

---

### Delete Account

**Hard delete (permanent):**
```tsx
<Button
  color="error"
  variant="contained"
  onClick={() => handleDelete(user._id)}
  startIcon={<DeleteForever />}
>
  Permanently Delete
</Button>

<Dialog open={confirmingDeletion}>
  <DialogTitle>⚠️ Permanently Delete Account?</DialogTitle>
  <DialogContent>
    <Alert severity="error">
      <AlertTitle>This action CANNOT be undone</AlertTitle>
      <Typography variant="body2">
        Permanently deleting {user.name} will:
      </Typography>
      <ul>
        <li>Delete user account</li>
        <li>Remove from all teams</li>
        <li>Delete projects (if sole member)</li>
        <li>Delete all scores given (if judge)</li>
        <li>Cannot be recovered</li>
      </ul>
    </Alert>
    
    <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
      Type "{user.email}" to confirm deletion:
    </Typography>
    <TextField
      value={confirmationText}
      onChange={e => setConfirmationText(e.target.value)}
      fullWidth
      placeholder={user.email}
      error={confirmationText !== user.email}
      sx={{ mt: 1 }}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmingDeletion(false)}>Cancel</Button>
    <Button 
      onClick={handleConfirmDeletion}
      variant="contained"
      color="error"
      disabled={confirmationText !== user.email}
    >
      Permanently Delete
    </Button>
  </DialogActions>
</Dialog>
```

---

## Password Management

### Reset Password (Admin)

**Admin can reset any user's password:**
```tsx
<Button
  variant="outlined"
  onClick={() => handleResetPassword(user._id)}
>
  Reset Password
</Button>

<Dialog open={resettingPassword}>
  <DialogTitle>Reset Password for {user.name}</DialogTitle>
  <DialogContent>
    <Typography variant="body2" paragraph>
      Choose how to reset this user's password:
    </Typography>
    
    <RadioGroup value={resetMethod} onChange={e => setResetMethod(e.target.value)}>
      <FormControlLabel
        value="email"
        control={<Radio />}
        label="Send password reset link via email"
      />
      <FormControlLabel
        value="temporary"
        control={<Radio />}
        label="Generate temporary password (admin sets)"
      />
    </RadioGroup>
    
    {resetMethod === 'temporary' && (
      <TextField
        label="Temporary Password"
        type="password"
        value={tempPassword}
        onChange={e => setTempPassword(e.target.value)}
        fullWidth
        sx={{ mt: 2 }}
        helperText="User will be required to change on next login"
      />
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setResettingPassword(false)}>Cancel</Button>
    <Button onClick={handleConfirmReset} variant="contained">
      Reset Password
    </Button>
  </DialogActions>
</Dialog>
```

---

## Bulk Operations

### Bulk Actions

**Select multiple users:**
```tsx
<TableToolbar>
  <Typography variant="h6">
    {selectedCount} users selected
  </Typography>
  
  <Stack direction="row" spacing={2}>
    <Button
      onClick={() => bulkExport(selectedUsers)}
      startIcon={<FileDownload />}
    >
      Export CSV
    </Button>
    
    <Button
      onClick={() => bulkEmail(selectedUsers)}
      startIcon={<Email />}
    >
      Send Email
    </Button>
    
    <Button
      onClick={() => bulkDeactivate(selectedUsers)}
      color="error"
      startIcon={<Block />}
    >
      Deactivate
    </Button>
  </Stack>
</TableToolbar>
```

---

### Bulk Email

**Send announcement to users:**
```tsx
<Dialog open={composingBulkEmail} fullWidth maxWidth="md">
  <DialogTitle>Send Email to {selectedUsers.length} Users</DialogTitle>
  <DialogContent>
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
    
    <FormControlLabel
      control={
        <Checkbox 
          checked={includeName}
          onChange={e => setIncludeName(e.target.checked)}
        />
      }
      label="Personalize with name (Hi {Name})"
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setComposingBulkEmail(false)}>Cancel</Button>
    <Button onClick={handleSendBulkEmail} variant="contained">
      Send to {selectedUsers.length} Users
    </Button>
  </DialogActions>
</Dialog>
```

---

## User Activity

### Activity Tracking

**User activity log:**
```tsx
<Card>
  <CardHeader title="Recent Activity" />
  <CardContent>
    <Timeline>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot color="primary" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Typography variant="body2">
            Registered for MongoHacks Spring
          </Typography>
          <Typography variant="caption" color="text.secondary">
            2 hours ago
          </Typography>
        </TimelineContent>
      </TimelineItem>
      
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot color="success" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Typography variant="body2">
            Joined team "Data Wizards"
          </Typography>
          <Typography variant="caption" color="text.secondary">
            1 day ago
          </Typography>
        </TimelineContent>
      </TimelineItem>
      
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
        </TimelineSeparator>
        <TimelineContent>
          <Typography variant="body2">
            Account created
          </Typography>
          <Typography variant="caption" color="text.secondary">
            1 week ago
          </Typography>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  </CardContent>
</Card>
```

---

### Login History

**Track login attempts:**
```typescript
interface LoginLog {
  userId: ObjectId;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  location?: string;  // GeoIP lookup
}
```

**Display:**
```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableCell>Date</TableCell>
      <TableCell>IP Address</TableCell>
      <TableCell>Location</TableCell>
      <TableCell>Status</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {loginHistory.map(log => (
      <TableRow key={log._id}>
        <TableCell>{formatDate(log.timestamp)}</TableCell>
        <TableCell>{log.ipAddress}</TableCell>
        <TableCell>{log.location || 'Unknown'}</TableCell>
        <TableCell>
          <Chip 
            label={log.success ? 'Success' : 'Failed'}
            color={log.success ? 'success' : 'error'}
            size="small"
          />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## User Analytics

### User Metrics

**Platform-wide stats:**
```tsx
<Grid container spacing={3}>
  <Grid item xs={12} md={3}>
    <Card>
      <CardContent>
        <Typography color="text.secondary">Total Users</Typography>
        <Typography variant="h4">{totalUsers}</Typography>
        <Typography variant="caption">
          +{newUsersThisMonth} this month
        </Typography>
      </CardContent>
    </Card>
  </Grid>
  
  <Grid item xs={12} md={3}>
    <Card>
      <CardContent>
        <Typography color="text.secondary">Active Users</Typography>
        <Typography variant="h4">{activeUsers}</Typography>
        <Typography variant="caption">
          Logged in last 30 days
        </Typography>
      </CardContent>
    </Card>
  </Grid>
  
  <Grid item xs={12} md={3}>
    <Card>
      <CardContent>
        <Typography color="text.secondary">Verified Emails</Typography>
        <Typography variant="h4">{verifiedUsers}</Typography>
        <Typography variant="caption">
          {(verifiedUsers / totalUsers * 100).toFixed(1)}% verified
        </Typography>
      </CardContent>
    </Card>
  </Grid>
  
  <Grid item xs={12} md={3}>
    <Card>
      <CardContent>
        <Typography color="text.secondary">Role Breakdown</Typography>
        <Stack spacing={0.5}>
          <Typography variant="caption">Participants: {participantCount}</Typography>
          <Typography variant="caption">Judges: {judgeCount}</Typography>
          <Typography variant="caption">Organizers: {organizerCount}</Typography>
        </Stack>
      </CardContent>
    </Card>
  </Grid>
</Grid>
```

---

### Growth Trends

**User registration over time:**
```
New Users (Last 12 Months)

150 │                              ╭─╮
120 │                        ╭─────╯ │
 90 │                  ╭─────╯       │
 60 │          ╭───────╯             │
 30 │  ╭───────╯                     │
  0 ├──┴──────────────────────────────
    Mar  May  Jul  Sep  Nov  Jan  Mar
    2025                        2026

Total: 1,247 users (+23% vs last year)
```

---

## Security

### Suspicious Activity Detection

**Flag suspicious patterns:**
```typescript
// Multiple failed login attempts
const failedLogins = await LoginLog.countDocuments({
  userId: user._id,
  success: false,
  timestamp: { $gt: new Date(Date.now() - 3600000) }  // last hour
});

if (failedLogins > 5) {
  await lockAccount(user._id);
  await sendSecurityAlert(user.email);
}
```

**Security alerts:**
```tsx
{user.suspiciousActivity && (
  <Alert severity="error" sx={{ mb: 2 }}>
    <AlertTitle>Suspicious Activity Detected</AlertTitle>
    <ul>
      {user.securityFlags.map(flag => (
        <li key={flag}>{flag}</li>
      ))}
    </ul>
    <Button size="small" onClick={() => reviewSecurityIncident(user._id)}>
      Review & Resolve
    </Button>
  </Alert>
)}
```

---

### Account Locks

**Temporary lock after failed logins:**
```typescript
interface AccountLock {
  userId: ObjectId;
  lockedAt: Date;
  reason: 'failed_logins' | 'admin_action' | 'suspicious_activity';
  expiresAt?: Date;  // Auto-unlock
  unlockToken?: string;  // Email unlock link
}
```

**Unlock flow:**
```tsx
<Button
  variant="outlined"
  onClick={() => unlockAccount(user._id)}
>
  Unlock Account
</Button>

<Dialog open={unlockingAccount}>
  <DialogTitle>Unlock Account?</DialogTitle>
  <DialogContent>
    <Typography variant="body2">
      Account was locked: {lockReason}
    </Typography>
    <Typography variant="body2" sx={{ mt: 1 }}>
      Unlocking will allow {user.name} to login immediately.
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setUnlockingAccount(false)}>Cancel</Button>
    <Button onClick={handleUnlock} variant="contained">
      Unlock Account
    </Button>
  </DialogActions>
</Dialog>
```

---

## Import/Export

### CSV Export

**Export user data:**
```typescript
async function exportUsers(filters: UserFilters): Promise<string> {
  const users = await User.find(filters);
  
  const csv = [
    ['Name', 'Email', 'Role', 'Status', 'Events', 'Created', 'Last Login'].join(','),
    ...users.map(u => [
      u.name,
      u.email,
      u.role,
      u.active ? 'Active' : 'Inactive',
      u.eventCount || 0,
      u.createdAt.toISOString(),
      u.lastLogin?.toISOString() || 'Never'
    ].join(','))
  ].join('\n');
  
  return csv;
}
```

---

### CSV Import

**Bulk user creation:**
```tsx
<Box>
  <Typography variant="h6">Import Users from CSV</Typography>
  <Typography variant="body2" paragraph>
    CSV format: Name, Email, Role
  </Typography>
  
  <input
    type="file"
    accept=".csv"
    onChange={handleFileUpload}
    ref={fileInputRef}
    style={{ display: 'none' }}
  />
  
  <Button
    variant="outlined"
    onClick={() => fileInputRef.current.click()}
  >
    Choose File
  </Button>
  
  {importResults && (
    <Alert severity="success" sx={{ mt: 2 }}>
      Imported {importResults.success} users
      {importResults.errors.length > 0 && ` (${importResults.errors.length} errors)`}
    </Alert>
  )}
</Box>
```

---

## Best Practices

### User Management

**Regular audits:**
- Review inactive users quarterly
- Clean up unverified accounts (>90 days)
- Monitor role assignments
- Check for duplicate accounts

**Security:**
- Enforce strong passwords (8+ chars)
- Enable email verification
- Monitor failed login attempts
- Lock accounts after 5 failed attempts
- Regular security audits

**Communication:**
- Welcome email on account creation
- Password reset instructions
- Account deactivation notices
- Re-engagement campaigns (dormant users)

---

## Troubleshooting

### User Can't Login

**Check:**
1. Account active?
2. Email verified?
3. Account locked?
4. Correct password?

**Debug:**
```javascript
db.users.findOne({ email: 'user@example.com' }, {
  active: 1,
  emailVerified: 1
});

db.accountlocks.findOne({ userId: userId });
```

---

### Duplicate Accounts

**Find duplicates:**
```javascript
db.users.aggregate([
  { $group: { _id: '$email', count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
]);
```

**Merge accounts:**
```typescript
async function mergeAccounts(primaryId: ObjectId, duplicateId: ObjectId) {
  // Transfer event registrations
  await Participant.updateMany(
    { userId: duplicateId },
    { $set: { userId: primaryId } }
  );
  
  // Transfer team memberships
  await Team.updateMany(
    { members: duplicateId },
    { $set: { 'members.$': primaryId } }
  );
  
  // Delete duplicate
  await User.findByIdAndDelete(duplicateId);
}
```

---

## Next Steps

- [Manage event participants](/docs/admin/events#participant-management)
- [Assign judge roles](/docs/admin/judges)
- [View user analytics](/docs/admin/analytics)
- [Configure authentication](/docs/getting-started/configuration#authentication)
