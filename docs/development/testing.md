---
sidebar_position: 5
---

# Testing

Comprehensive testing strategy for MongoHacks platform.

## Overview

MongoHacks uses Jest for unit testing, React Testing Library for component tests, and Playwright for end-to-end tests.

**Current coverage:** 15% (Sprint 4 goal: 60%)

**Test stack:**
- **Unit/Integration:** Jest + MongoDB Memory Server
- **Component:** React Testing Library
- **E2E:** Playwright
- **API:** Supertest

---

## Setup

### Install Dependencies

```bash
npm install --save-dev \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest-environment-jsdom \
  mongodb-memory-server \
  @playwright/test
```

---

### Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './'
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/_*.{js,jsx,ts,tsx}'
  ],
  coverageThresholds: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  }
};

module.exports = createJestConfig(customJestConfig);
```

---

### Jest Setup

```javascript
// jest.setup.js
import '@testing-library/jest-dom';

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.OPENAI_API_KEY = 'test-key';
```

---

## Unit Tests

### Model Tests

```typescript
// __tests__/models/User.test.ts
import User from '@/lib/db/models/User';
import dbConnect from '@/lib/db/connect';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  await dbConnect();
});

afterAll(async () => {
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('User Model', () => {
  it('creates a user with valid data', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'participant'
    };
    
    const user = await User.create(userData);
    
    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('participant');
  });
  
  it('hashes password before saving', async () => {
    const user = await User.create({
      name: 'Test',
      email: 'test@example.com',
      password: 'plaintext'
    });
    
    expect(user.password).not.toBe('plaintext');
    expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt format
  });
  
  it('rejects duplicate email', async () => {
    await User.create({
      name: 'User 1',
      email: 'test@example.com',
      password: 'password123'
    });
    
    await expect(
      User.create({
        name: 'User 2',
        email: 'test@example.com',
        password: 'password456'
      })
    ).rejects.toThrow();
  });
  
  it('validates email format', async () => {
    await expect(
      User.create({
        name: 'Test',
        email: 'invalid-email',
        password: 'password123'
      })
    ).rejects.toThrow(/email/i);
  });
});
```

---

### Service Tests

```typescript
// __tests__/services/matching-engine.test.ts
import { findMatchingTeams } from '@/lib/ai/matching-engine';
import Team from '@/lib/db/models/Team';
import Participant from '@/lib/db/models/Participant';

describe('Team Matching', () => {
  beforeEach(async () => {
    // Seed test data
    await Team.create({
      eventId: 'event123',
      name: 'Data Wizards',
      desiredSkills: ['Python', 'MongoDB', 'ML'],
      desiredSkillsEmbedding: [0.1, 0.2, 0.3, /* ... 1536 dims */]
    });
  });
  
  it('finds matching teams based on skills', async () => {
    const participant = await Participant.create({
      userId: 'user123',
      skills: ['Python', 'Machine Learning', 'MongoDB'],
      skillsEmbedding: [0.09, 0.21, 0.29, /* ... */]
    });
    
    const matches = await findMatchingTeams(participant._id, 'event123');
    
    expect(matches).toHaveLength(1);
    expect(matches[0].name).toBe('Data Wizards');
    expect(matches[0].matchScore).toBeGreaterThan(80);
  });
  
  it('returns empty array when no matches', async () => {
    const participant = await Participant.create({
      userId: 'user456',
      skills: ['Java', 'Spring', 'Oracle'],
      skillsEmbedding: [0.9, 0.8, 0.7, /* completely different */]
    });
    
    const matches = await findMatchingTeams(participant._id, 'event123');
    
    expect(matches).toHaveLength(0);
  });
});
```

---

## API Tests

### Route Handler Tests

```typescript
// __tests__/api/events/route.test.ts
import { GET, POST } from '@/app/api/events/route';
import { NextRequest } from 'next/server';
import Event from '@/lib/db/models/Event';

describe('GET /api/events', () => {
  it('returns published events', async () => {
    await Event.create({
      name: 'Test Event',
      slug: 'test-event',
      description: 'Test description',
      startDate: new Date(),
      endDate: new Date(),
      capacity: 100,
      status: 'published'
    });
    
    const request = new NextRequest('http://localhost:3002/api/events');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].name).toBe('Test Event');
  });
  
  it('filters by status query param', async () => {
    await Event.create([
      { /* published event */ status: 'published' },
      { /* draft event */ status: 'draft' }
    ]);
    
    const request = new NextRequest(
      'http://localhost:3002/api/events?status=published'
    );
    const response = await GET(request);
    const data = await response.json();
    
    expect(data.data).toHaveLength(1);
    expect(data.data[0].status).toBe('published');
  });
});

describe('POST /api/events', () => {
  it('creates event with valid data', async () => {
    const eventData = {
      name: 'New Event',
      slug: 'new-event',
      description: 'Description',
      startDate: '2026-06-01T09:00:00Z',
      endDate: '2026-06-01T18:00:00Z',
      capacity: 200
    };
    
    const request = new NextRequest('http://localhost:3002/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('New Event');
  });
  
  it('rejects invalid data', async () => {
    const request = new NextRequest('http://localhost:3002/api/events', {
      method: 'POST',
      body: JSON.stringify({ name: 'No other fields' })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
```

---

## Component Tests

### React Component Tests

```typescript
// __tests__/components/EventCard.test.tsx
import { render, screen } from '@testing-library/react';
import EventCard from '@/components/EventCard';

describe('EventCard', () => {
  const mockEvent = {
    _id: 'event123',
    name: 'MongoHacks Spring',
    slug: 'mongohacks-spring',
    description: 'Spring hackathon',
    startDate: new Date('2026-03-18'),
    capacity: 150,
    currentParticipants: 100,
    status: 'published'
  };
  
  it('renders event details', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('MongoHacks Spring')).toBeInTheDocument();
    expect(screen.getByText(/Spring hackathon/)).toBeInTheDocument();
  });
  
  it('shows participant count', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText(/100.*150/)).toBeInTheDocument();
  });
  
  it('shows register button for published events', () => {
    render(<EventCard event={mockEvent} />);
    
    const button = screen.getByRole('button', { name: /register/i });
    expect(button).toBeInTheDocument();
  });
  
  it('shows event full when at capacity', () => {
    const fullEvent = { ...mockEvent, currentParticipants: 150 };
    render(<EventCard event={fullEvent} />);
    
    expect(screen.getByText(/event full/i)).toBeInTheDocument();
  });
});
```

---

### User Interaction Tests

```typescript
// __tests__/components/RegistrationForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegistrationForm from '@/components/RegistrationForm';

describe('RegistrationForm', () => {
  it('submits form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<RegistrationForm eventId="event123" onSubmit={onSubmit} />);
    
    const user = userEvent.setup();
    
    await user.type(screen.getByLabelText(/name/i), 'Alice Smith');
    await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Select skills
    const skillsInput = screen.getByLabelText(/skills/i);
    await user.click(skillsInput);
    await user.click(screen.getByText('Python'));
    await user.click(screen.getByText('MongoDB'));
    
    await user.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'password123',
        skills: ['Python', 'MongoDB']
      });
    });
  });
  
  it('shows validation errors', async () => {
    render(<RegistrationForm eventId="event123" />);
    
    const user = userEvent.setup();
    
    // Submit without filling
    await user.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });
});
```

---

## End-to-End Tests

### Playwright Setup

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' }
    }
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI
  }
});
```

---

### E2E Test Examples

```typescript
// e2e/registration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Event Registration', () => {
  test('complete registration flow', async ({ page }) => {
    // Go to event page
    await page.goto('/events/mongohacks-spring-2026');
    
    // Click register button
    await page.click('text=Register Now');
    
    // Fill registration form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Select skills
    await page.click('text=Skills');
    await page.click('text=Python');
    await page.click('text=MongoDB');
    
    // Submit
    await page.click('button:has-text("Register")');
    
    // Should redirect to event hub
    await expect(page).toHaveURL(/\/events\/.*\/hub/);
    
    // Should show welcome message
    await expect(page.locator('text=Welcome')).toBeVisible();
  });
  
  test('prevents duplicate registration', async ({ page }) => {
    // Register once
    await page.goto('/events/mongohacks-spring-2026/register');
    await page.fill('input[name="name"]', 'Alice');
    await page.fill('input[name="email"]', 'alice@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Register")');
    
    await expect(page).toHaveURL(/\/hub/);
    
    // Try to register again
    await page.goto('/events/mongohacks-spring-2026/register');
    
    // Should show already registered message
    await expect(page.locator('text=already registered')).toBeVisible();
  });
});
```

---

### E2E Team Formation

```typescript
// e2e/team-formation.spec.ts
test('create and join team', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button:has-text("Login")');
  
  // Go to event hub
  await page.goto('/events/mongohacks-spring-2026/hub');
  
  // Create team
  await page.click('text=Create Team');
  await page.fill('input[name="name"]', 'Data Wizards');
  await page.fill('textarea[name="description"]', 'Building a RAG chatbot');
  
  // Add desired skills
  await page.click('text=Desired Skills');
  await page.click('text=Python');
  await page.click('text=ML');
  
  await page.click('button:has-text("Create")');
  
  // Should see team in hub
  await expect(page.locator('text=Data Wizards')).toBeVisible();
  
  // Should show team member count
  await expect(page.locator('text=1/5 members')).toBeVisible();
});
```

---

## Test Utilities

### Mock Data Factory

```typescript
// __tests__/utils/factories.ts
import { faker } from '@faker-js/faker';

export function createMockUser(overrides = {}) {
  return {
    _id: faker.database.mongodbObjectId(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    role: 'participant',
    active: true,
    emailVerified: true,
    ...overrides
  };
}

export function createMockEvent(overrides = {}) {
  const startDate = faker.date.future();
  
  return {
    _id: faker.database.mongodbObjectId(),
    name: faker.company.buzzPhrase(),
    slug: faker.helpers.slugify(faker.company.buzzPhrase()),
    description: faker.lorem.paragraph(),
    startDate,
    endDate: faker.date.future({ refDate: startDate }),
    capacity: faker.number.int({ min: 50, max: 500 }),
    currentParticipants: 0,
    status: 'published',
    ...overrides
  };
}

export function createMockTeam(overrides = {}) {
  return {
    _id: faker.database.mongodbObjectId(),
    eventId: faker.database.mongodbObjectId(),
    name: faker.company.name(),
    description: faker.lorem.sentences(2),
    leaderId: faker.database.mongodbObjectId(),
    members: [],
    desiredSkills: ['Python', 'MongoDB', 'React'],
    lookingForMembers: true,
    capacity: 5,
    ...overrides
  };
}
```

---

### Test Helpers

```typescript
// __tests__/utils/helpers.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

export async function setupTestDB() {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  return mongoServer;
}

export async function teardownTestDB(mongoServer: MongoMemoryServer) {
  await mongoose.disconnect();
  await mongoServer.stop();
}

export async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}
```

---

## Mocking

### Mock External APIs

```typescript
// __tests__/mocks/openai.ts
jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      embeddings: {
        create: jest.fn().mockResolvedValue({
          data: [{
            embedding: new Array(1536).fill(0).map(() => Math.random())
          }]
        })
      },
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: 'Mock AI-generated summary'
              }
            }]
          })
        }
      }
    }))
  };
});
```

---

### Mock NextAuth

```typescript
// __tests__/mocks/next-auth.ts
jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue({
    user: {
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'participant'
    }
  })
}));
```

---

## Test Coverage

### Generate Coverage Report

```bash
npm test -- --coverage
```

**Output:**
```
File                   | % Stmts | % Branch | % Funcs | % Lines
-----------------------|---------|----------|---------|--------
All files              |   62.5  |    58.3  |   65.2  |   62.1
 models/               |   85.7  |    75.0  |   90.0  |   85.7
  User.ts              |   90.0  |    80.0  |  100.0  |   90.0
  Event.ts             |   85.0  |    75.0  |   85.0  |   85.0
 api/                  |   55.2  |    50.0  |   60.0  |   55.2
  events/route.ts      |   70.0  |    60.0  |   75.0  |   70.0
```

---

### Coverage Goals

**Sprint 4 targets:**
- **Statements:** 60%
- **Branches:** 60%
- **Functions:** 60%
- **Lines:** 60%

**Priority areas:**
- API routes (critical business logic)
- Database models (data integrity)
- Authentication (security)
- AI services (expensive operations)

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
        env:
          MONGODB_URI: mongodb://localhost:27017/test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Best Practices

### 1. Test Naming

```typescript
// Good
it('creates user with valid data', () => {});
it('rejects duplicate email', () => {});
it('hashes password before saving', () => {});

// Bad
it('test 1', () => {});
it('works', () => {});
```

---

### 2. Arrange-Act-Assert Pattern

```typescript
it('finds matching teams', async () => {
  // Arrange
  const team = await Team.create({ /* data */ });
  const participant = await Participant.create({ /* data */ });
  
  // Act
  const matches = await findMatchingTeams(participant._id);
  
  // Assert
  expect(matches).toHaveLength(1);
  expect(matches[0]._id).toEqual(team._id);
});
```

---

### 3. Isolated Tests

```typescript
// Clean up after each test
afterEach(async () => {
  await clearDatabase();
});

// Don't depend on order
it('test A', () => { /* independent */ });
it('test B', () => { /* independent */ });
```

---

### 4. Test Edge Cases

```typescript
describe('Team capacity', () => {
  it('allows members up to capacity', async () => {});
  it('rejects members when full', async () => {});
  it('handles zero capacity', async () => {});
  it('handles negative capacity input', async () => {});
});
```

---

## Next Steps

- [Run tests locally](/docs/development/testing#setup)
- [Set up CI pipeline](/docs/development/deployment#cicd-pipeline)
- [View coverage report](/docs/development/testing#test-coverage)
- [Deploy with confidence](/docs/development/deployment)
