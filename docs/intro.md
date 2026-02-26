---
sidebar_position: 1
---

# Welcome to MongoHacks

**MongoHacks** is a modern, AI-powered hackathon management platform built with Next.js 15, React 19, Material UI, and MongoDB Atlas.

## What is MongoHacks?

MongoHacks provides everything you need to run successful hackathons:

- 🎯 **Event Management** - Create and manage hackathon events with custom landing pages
- 👥 **Team Formation** - AI-powered team matching based on skills and interests
- 💻 **Project Submission** - Streamlined project submission with GitHub integration
- ⚖️ **Judging System** - Complete judging workflow with AI-generated feedback
- 🤖 **AI Features** - GPT-4 summaries, feedback synthesis, and vector search
- 📊 **Analytics** - Real-time insights and reporting

## Platform Status

**Current Version:** 1.0.0-alpha  
**Completeness:** ~75% MVP  
**Production Ready:** Sprints 1-3 Complete

### What's Built ✅

- **Sprint 1: Event Hub** - Participant dashboard with smart guidance
- **Sprint 2: Judging System** - Complete judging workflow end-to-end
- **Sprint 3: AI Layer** - Project summaries, feedback, team matching
- **Phase 4.1: Performance** - Database indexes optimized

### In Progress 🚧

- **Phase 4.2-4.6:** Polish & Harden (type safety, tests, mobile, dark mode)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/mongodb/mongohacks-platform
cd mongohacks-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB connection string

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the platform.

## Key Features

### Event Hub

The Event Hub is the participant's home base. It provides:

- Smart next steps based on event timeline
- Team recommendations using vector search
- Project submission tracking
- Resource links and schedules

[Learn more about the Event Hub →](/docs/features/event-hub)

### AI-Powered Judging

MongoHacks uses GPT-4 to enhance the judging experience:

- **Project Summaries** - 2-3 sentence AI summaries save judges 3-5 minutes per project
- **Feedback Synthesis** - Combine judge scores and comments into constructive paragraphs
- **Batch Processing** - Generate feedback for all projects with one click

[Learn more about AI Features →](/docs/ai/overview)

### Vector Search Team Matching

MongoDB Atlas Vector Search powers intelligent team recommendations:

- Embeddings generated on registration and team creation
- Semantic skill matching beyond simple tags
- Graceful fallback to tag-overlap when needed

[Learn more about Team Matching →](/docs/ai/team-matching)

## Architecture

**Frontend:**
- Next.js 15 (App Router)
- React 19 (Server Components + Client Components)
- Material UI 7 (MongoDB brand theme)
- TypeScript

**Backend:**
- Next.js API Routes
- MongoDB with Mongoose
- NextAuth.js for authentication
- OpenAI GPT-4 Turbo + Embeddings

**Infrastructure:**
- MongoDB Atlas (database + vector search)
- Vercel (recommended deployment)
- OpenAI API (AI features)

[Learn more about Architecture →](/docs/development/architecture)

## Prerequisites

Before deploying MongoHacks, you need:

1. **MongoDB Atlas Cluster** (M10+ for vector search)
2. **OpenAI API Key** (for AI features)
3. **Node.js 20+** and npm
4. **GitHub OAuth App** (for authentication)

## Cost Estimates

**Per 100-project hackathon:**
- MongoDB Atlas: ~$50-100/month (M10 cluster)
- OpenAI API: ~$5-10 (summaries + feedback)
- Vercel: $20-50/month (Pro plan recommended)
- **Total: ~$75-160/month**

## Support

- **Documentation:** [https://mongohacks-docs.mongodb.com](https://mongohacks-docs.mongodb.com)
- **GitHub Issues:** [Report bugs and request features](https://github.com/mongodb/mongohacks-platform/issues)
- **Discord:** [Join the community](https://discord.gg/mongodb)

## License

MongoHacks is released under the Apache 2.0 License.

---

Ready to get started? [Install MongoHacks →](/docs/getting-started/installation)
