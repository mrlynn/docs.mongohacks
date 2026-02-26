---
sidebar_position: 3
---

# Database Design

MongoDB schema design, models, and data architecture.

## Overview

MongoHacks uses MongoDB with Mongoose ODM for data modeling and validation.

**Database:** MongoDB Atlas (M10+ recommended for Vector Search)  
**ODM:** Mongoose 8.x  
**Connection:** Singleton pattern for connection pooling

---

## Connection Setup

### Database Connection

```typescript
// src/lib/db/connect.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
```

**Why singleton:**
- Prevents multiple connections in serverless
- Reuses connection across requests
- Reduces latency

---

## Schema Design

### Core Models

**User:**
```typescript
// src/lib/db/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'participant' | 'judge' | 'organizer' | 'admin' | 'super_admin';
  avatar?: string;
  githubUsername?: string;
  active: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false  // Don't return password by default
    },
    role: {
      type: String,
      enum: ['participant', 'judge', 'organizer', 'admin', 'super_admin'],
      default: 'participant'
    },
    avatar: String,
    githubUsername: String,
    active: {
      type: Boolean,
      default: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    lastLogin: Date
  },
  {
    timestamps: true
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ active: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
```

---

**Event:**
```typescript
// src/lib/db/models/Event.ts
export interface IEvent extends Document {
  name: string;
  slug: string;
  description: string;
  startDate: Date;
  endDate: Date;
  submissionDeadline?: Date;
  capacity: number;
  currentParticipants: number;
  status: 'draft' | 'published' | 'active' | 'concluded';
  resultsPublished: boolean;
  categories: string[];
  location?: string;
  isVirtual: boolean;
  enableAI: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(this: IEvent, value: Date) {
          return value > this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    submissionDeadline: Date,
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1']
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'active', 'concluded'],
      default: 'draft'
    },
    resultsPublished: {
      type: Boolean,
      default: false
    },
    categories: [String],
    location: String,
    isVirtual: {
      type: Boolean,
      default: false
    },
    enableAI: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
EventSchema.index({ slug: 1 }, { unique: true });
EventSchema.index({ status: 1 });
EventSchema.index({ startDate: 1 });
EventSchema.index({ endDate: 1 });

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
```

---

**Team:**
```typescript
export interface ITeam extends Document {
  eventId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  leaderId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  desiredSkills: string[];
  desiredSkillsEmbedding?: number[];  // 1536-dim vector
  lookingForMembers: boolean;
  capacity: number;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    leaderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    desiredSkills: [String],
    desiredSkillsEmbedding: {
      type: [Number],
      select: false  // Don't return by default (large)
    },
    lookingForMembers: {
      type: Boolean,
      default: true
    },
    capacity: {
      type: Number,
      default: 5,
      min: 1,
      max: 20
    },
    category: String
  },
  {
    timestamps: true
  }
);

// Compound indexes
TeamSchema.index({ eventId: 1, name: 1 }, { unique: true });
TeamSchema.index({ eventId: 1, lookingForMembers: 1 });
TeamSchema.index({ leaderId: 1 });
TeamSchema.index({ members: 1 });

// Virtual: member count
TeamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

export default mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);
```

---

**Project:**
```typescript
export interface IProject extends Document {
  eventId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  aiSummary?: string;
  aiFeedback?: string;
  category: string;
  technologies: string[];
  innovations?: string;
  repoUrl: string;
  demoUrl?: string;
  videoUrl?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'judged';
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    aiSummary: String,
    aiFeedback: String,
    category: {
      type: String,
      required: true
    },
    technologies: [String],
    innovations: String,
    repoUrl: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => /^https:\/\/(github|gitlab|bitbucket)\.com/.test(v),
        message: 'Must be a valid GitHub, GitLab, or Bitbucket URL'
      }
    },
    demoUrl: String,
    videoUrl: String,
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'judged'],
      default: 'draft'
    },
    submittedAt: Date
  },
  {
    timestamps: true
  }
);

// Compound unique index: one project per team per event
ProjectSchema.index({ teamId: 1, eventId: 1 }, { unique: true });
ProjectSchema.index({ eventId: 1, status: 1 });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
```

---

## Relationships

### One-to-Many

**Event → Teams:**
```typescript
// Populate teams for an event
const event = await Event.findById(eventId);
const teams = await Team.find({ eventId: event._id })
  .populate('leaderId', 'name email')
  .populate('members', 'name email');
```

---

### Many-to-Many

**Team ↔ Users (members):**
```typescript
// Get team with member details
const team = await Team.findById(teamId)
  .populate('members', 'name email githubUsername');

// Get user's teams
const teams = await Team.find({ members: userId });
```

---

### Referenced Documents

**Populate related data:**
```typescript
const project = await Project.findById(projectId)
  .populate('eventId', 'name startDate')
  .populate({
    path: 'teamId',
    populate: {
      path: 'members',
      select: 'name email'
    }
  });

// Result:
// project.eventId.name → "MongoHacks Spring 2026"
// project.teamId.members[0].name → "Alice Smith"
```

---

## Indexes

### Index Strategy

**Critical indexes (added in Sprint 4.1):**
```typescript
// User
UserSchema.index({ email: 1 }, { unique: true });

// Participant
ParticipantSchema.index({ userId: 1 });
ParticipantSchema.index({ teamId: 1, eventId: 1 });

// Project
ProjectSchema.index({ teamId: 1, eventId: 1 }, { unique: true });

// Event
EventSchema.index({ slug: 1 }, { unique: true });
EventSchema.index({ status: 1, startDate: 1 });

// Team
TeamSchema.index({ eventId: 1, lookingForMembers: 1 });
```

**Performance impact:**
- Landing page: 100ms → 10ms
- User login: 50ms → 5ms
- Browse teams: 200ms → 20ms

---

### Vector Search Indexes

**Atlas Vector Search (for AI matching):**
```javascript
// Create via Atlas UI or mongosh

// Participant skills vector
{
  "name": "participant_skills_vector",
  "type": "vectorSearch",
  "fields": [{
    "type": "vector",
    "path": "skillsEmbedding",
    "numDimensions": 1536,
    "similarity": "cosine"
  }]
}

// Team desired skills vector
{
  "name": "team_skills_vector",
  "type": "vectorSearch",
  "fields": [{
    "type": "vector",
    "path": "desiredSkillsEmbedding",
    "numDimensions": 1536,
    "similarity": "cosine"
  }]
}
```

**Query vector search:**
```typescript
const teams = await Team.aggregate([
  {
    $vectorSearch: {
      index: "team_skills_vector",
      path: "desiredSkillsEmbedding",
      queryVector: participant.skillsEmbedding,
      numCandidates: 100,
      limit: 10
    }
  }
]);
```

---

## Validation

### Schema-Level Validation

```typescript
const EventSchema = new Schema({
  capacity: {
    type: Number,
    required: true,
    min: [1, 'Capacity must be at least 1'],
    max: [10000, 'Capacity cannot exceed 10,000']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  }
});
```

---

### Custom Validators

```typescript
// Email uniqueness check
UserSchema.pre('save', async function(next) {
  if (this.isModified('email')) {
    const exists = await User.findOne({ email: this.email });
    if (exists && !exists._id.equals(this._id)) {
      throw new Error('Email already in use');
    }
  }
  next();
});

// Team capacity check
TeamSchema.pre('save', function(next) {
  if (this.members.length > this.capacity) {
    throw new Error('Team exceeds capacity');
  }
  next();
});
```

---

## Middleware (Hooks)

### Pre-Save Hooks

```typescript
// Hash password before saving
import bcrypt from 'bcryptjs';

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Auto-increment participant count
ParticipantSchema.post('save', async function() {
  await Event.findByIdAndUpdate(this.eventId, {
    $inc: { currentParticipants: 1 }
  });
});
```

---

### Post-Delete Hooks

```typescript
// Clean up related data when team deleted
TeamSchema.post('findOneAndDelete', async function(doc) {
  if (!doc) return;
  
  // Delete team's project
  await Project.deleteMany({ teamId: doc._id });
  
  // Clear teamId from participants
  await Participant.updateMany(
    { teamId: doc._id },
    { $unset: { teamId: 1 } }
  );
});
```

---

## Aggregations

### Complex Queries

**Results with average scores:**
```typescript
const results = await Score.aggregate([
  // Match event
  {
    $match: { eventId: new mongoose.Types.ObjectId(eventId) }
  },
  
  // Group by project, calculate averages
  {
    $group: {
      _id: '$projectId',
      innovation: { $avg: '$scores.innovation' },
      technical: { $avg: '$scores.technical' },
      impact: { $avg: '$scores.impact' },
      presentation: { $avg: '$scores.presentation' },
      judgeCount: { $sum: 1 }
    }
  },
  
  // Calculate total score
  {
    $addFields: {
      totalScore: {
        $add: ['$innovation', '$technical', '$impact', '$presentation']
      }
    }
  },
  
  // Sort by total score
  { $sort: { totalScore: -1 } },
  
  // Lookup project details
  {
    $lookup: {
      from: 'projects',
      localField: '_id',
      foreignField: '_id',
      as: 'project'
    }
  },
  
  { $unwind: '$project' },
  
  // Lookup team
  {
    $lookup: {
      from: 'teams',
      localField: 'project.teamId',
      foreignField: '_id',
      as: 'team'
    }
  },
  
  { $unwind: '$team' }
]);
```

---

**Top technologies across events:**
```typescript
const topTech = await Project.aggregate([
  { $unwind: '$technologies' },
  {
    $group: {
      _id: '$technologies',
      count: { $sum: 1 },
      events: { $addToSet: '$eventId' }
    }
  },
  { $sort: { count: -1 } },
  { $limit: 20 }
]);
```

---

## Transactions

### Multi-Document Operations

```typescript
import mongoose from 'mongoose';

export async function transferTeamLeadership(
  teamId: string,
  newLeaderId: string
) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Update team
    const team = await Team.findByIdAndUpdate(
      teamId,
      { leaderId: newLeaderId },
      { session, new: true }
    );
    
    if (!team) throw new Error('Team not found');
    
    // Log leadership change
    await AuditLog.create([{
      action: 'TRANSFER_LEADERSHIP',
      teamId,
      oldLeaderId: team.leaderId,
      newLeaderId,
      timestamp: new Date()
    }], { session });
    
    await session.commitTransaction();
    return team;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## Query Optimization

### Projection

**Only fetch needed fields:**
```typescript
// Bad: fetch everything
const users = await User.find();

// Good: select specific fields
const users = await User.find()
  .select('name email role');

// Better: exclude heavy fields
const users = await User.find()
  .select('-password -avatar');
```

---

### Lean Queries

**Skip Mongoose overhead for read-only:**
```typescript
// Returns plain JavaScript objects (faster)
const events = await Event.find({ status: 'published' })
  .lean();

// No virtuals, no methods, just data
```

---

### Query Caching

**Cache frequently accessed data:**
```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 min

async function getPublishedEvents() {
  const cacheKey = 'published_events';
  
  let events = cache.get(cacheKey);
  if (events) return events;
  
  events = await Event.find({ status: 'published' })
    .lean();
  
  cache.set(cacheKey, events);
  return events;
}
```

---

## Best Practices

### 1. Always Use Indexes

```typescript
// Check index usage
db.events.find({ slug: 'mongohacks-2026' }).explain('executionStats');

// Should show: "indexName": "slug_1"
```

---

### 2. Limit Array Growth

```typescript
// Bad: unbounded array
TeamSchema = new Schema({
  members: [ObjectId]  // Could grow infinitely
});

// Good: enforce limit
TeamSchema = new Schema({
  members: {
    type: [ObjectId],
    validate: [arrayLimit(20), 'Max 20 members']
  }
});

function arrayLimit(val) {
  return function(arr) {
    return arr.length <= val;
  };
}
```

---

### 3. Use Virtuals for Computed Fields

```typescript
// Don't store what can be computed
TeamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

TeamSchema.virtual('isFull').get(function() {
  return this.members.length >= this.capacity;
});
```

---

### 4. Avoid N+1 Queries

```typescript
// Bad: N+1 query
const teams = await Team.find({ eventId });
for (const team of teams) {
  team.leader = await User.findById(team.leaderId);  // N queries
}

// Good: use populate
const teams = await Team.find({ eventId })
  .populate('leaderId', 'name email');  // 1 query
```

---

## Data Migration

### Seed Data

```typescript
// scripts/seed.ts
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Event from '@/lib/db/models/Event';

async function seed() {
  await dbConnect();
  
  // Clear existing
  await User.deleteMany({});
  await Event.deleteMany({});
  
  // Create users
  const users = await User.create([
    {
      name: 'Super Admin',
      email: 'superadmin@mongohacks.com',
      password: 'admin123',
      role: 'super_admin'
    },
    {
      name: 'Test Organizer',
      email: 'organizer@mongohacks.com',
      password: 'admin123',
      role: 'organizer'
    }
  ]);
  
  // Create event
  await Event.create({
    name: 'MongoHacks Spring 2026',
    slug: 'mongohacks-spring-2026',
    description: 'Spring hackathon...',
    startDate: new Date('2026-03-18T09:00:00Z'),
    endDate: new Date('2026-03-18T20:00:00Z'),
    capacity: 150,
    status: 'published'
  });
  
  console.log('Seed complete');
  process.exit(0);
}

seed().catch(console.error);
```

**Run:** `npx tsx scripts/seed.ts`

---

## Troubleshooting

### Connection Issues

```typescript
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Reconnecting...');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});
```

---

### Validation Errors

```javascript
// Get detailed error
try {
  await user.save();
} catch (error) {
  if (error.name === 'ValidationError') {
    Object.values(error.errors).forEach(err => {
      console.error(`${err.path}: ${err.message}`);
    });
  }
}
```

---

## Next Steps

- [API route implementation](/docs/development/api-routes)
- [Testing database models](/docs/development/testing)
- [Deploy to MongoDB Atlas](/docs/development/deployment)
- [Vector Search setup](/docs/ai/vector-search)
