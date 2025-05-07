# Buildappswith Testing Framework

## Executive Summary

The Buildappswith platform requires a robust testing framework to ensure high quality across its marketplace, authentication, booking, and educational components. This document establishes a comprehensive testing approach using Vitest as the primary test runner with integration to Datadog for visualization, and specialized strategies for accessibility and authentication testing.

Key components:
- Multi-layered testing strategy: unit, component, integration, and E2E
- Standardized directory structure and test organization
- Mock data generators for consistent test data across components
- Specialized utilities for authentication, accessibility, and API testing
- Automated reporting and visualization through Datadog integration

## Testing Strategy

### Unit Testing

**Purpose**: Test individual functions, hooks, and utilities in isolation.

**Implementation**:
- Use Vitest for all unit tests (`/__tests__/unit/`)
- Mock external dependencies using `vi.mock()`
- Ensure high coverage of utility functions and hooks
- Target files: `*.test.ts` or `*.test.tsx`

**Example Unit Test Areas**:
- Form validation utilities
- Data transformations
- Custom hooks
- State management utilities
- API client functions

### Component Testing

**Purpose**: Verify UI components render correctly and respond appropriately to user interactions.

**Implementation**:
- React Testing Library for simulating user behavior
- Component rendering tests with various states and props
- Event handling and user interaction tests
- Snapshot testing for stable components
- Target location: `/__tests__/components/{domain}`

**Key Focus Areas**:
- Critical user-facing components (marketplace listings, booking interfaces)
- Role-based components with conditional rendering
- Form components with validation
- Interactive components with state changes

### Integration Testing

**Purpose**: Validate multiple components and services working together correctly.

**Implementation**:
- Test component interactions
- API integrations with frontend
- Auth flows across multiple components
- Target location: `/__tests__/integration/`

**Primary Focuses**:
- Authentication flows
- Booking and payment processes
- Profile management
- Marketplace search and filtering
- Cross-component data flow

### End-to-End Testing

**Purpose**: Test complete user journeys and critical paths.

**Implementation**:
- Playwright for E2E tests
- Real browser testing of key workflows
- Cross-browser compatibility testing
- Target location: `/__tests__/e2e/`

**Critical Flows**:
- User signup and verification
- Builder profile creation and management
- Booking and payment process
- Marketplace browsing and filtering
- Admin workflows

### API Testing

**Purpose**: Validate API endpoints handle requests correctly and return expected responses.

**Implementation**:
- Direct testing of API route handlers
- Mock authentication and database queries
- Validate request/response formats and status codes
- Target location: `/__tests__/api/`

**Focus Areas**:
- Authentication endpoints
- Profile management APIs
- Booking and scheduling APIs
- Marketplace data APIs
- Admin APIs

### Accessibility Testing

**Purpose**: Ensure WCAG 2.1 AA compliance across the platform.

**Implementation**:
- Automated accessibility testing with `jest-axe`
- Custom utilities for A11y validation
- Integration with component tests
- Manual testing checklist for QA

**Key Requirements**:
- Color contrast compliance
- Keyboard navigation
- Screen reader compatibility
- Form accessibility
- Focus management

## Framework Setup

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],
      reportsDirectory: './test-results/coverage',
    },
    reporters: ['default', 'json'],
    include: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@components': path.resolve(__dirname, './components'),
      '@lib': path.resolve(__dirname, './lib'),
      '@utils': path.resolve(__dirname, './utils'),
      '@hooks': path.resolve(__dirname, './hooks'),
      'test-utils': path.resolve(__dirname, './__tests__/utils'),
    },
  },
})
```

### Vitest Setup

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
import { vi, expect } from 'vitest'
import { cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

// Extend expect with jest-axe
expect.extend(toHaveNoViolations)

// Make accessible everywhere
global.axe = axe

// Clean up after each test
afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

// Mock Next.js features
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: '/',
    query: {},
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    setTheme: vi.fn(),
  })),
}))
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './__tests__/e2e',
  timeout: 30000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/e2e/playwright-results.json' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
})
```

## Test Organization

### Directory Structure

```
buildappswith/
├── __tests__/
│   ├── api/                    # API endpoint tests
│   │   ├── auth/               # Authentication API tests
│   │   ├── marketplace/        # Marketplace API tests
│   │   ├── profile/            # Profile API tests
│   │   ├── scheduling/         # Scheduling API tests
│   │   └── stripe/             # Payment API tests
│   ├── components/             # Component tests
│   │   ├── admin/              # Admin component tests
│   │   ├── auth/               # Authentication component tests
│   │   ├── landing/            # Landing page component tests
│   │   ├── marketplace/        # Marketplace component tests
│   │   ├── profile/            # Profile component tests
│   │   ├── scheduling/         # Scheduling component tests
│   │   └── ui/                 # Shared UI component tests
│   ├── e2e/                    # End-to-end tests with Playwright
│   │   ├── auth/               # Authentication flows
│   │   ├── booking/            # Booking and payment flows
│   │   ├── marketplace/        # Marketplace browsing flows
│   │   └── profile/            # Profile management flows
│   ├── integration/            # Integration tests between components
│   │   ├── auth-marketplace/   # Auth + marketplace integration
│   │   ├── booking-payment/    # Booking + payment integration
│   │   └── profile-builder/    # Profile + builder integration
│   ├── middleware/             # Middleware tests
│   ├── mocks/                  # Mock data and functions
│   │   ├── auth/               # Authentication mocks
│   │   ├── marketplace/        # Marketplace mocks
│   │   ├── profile/            # Profile mocks
│   │   └── scheduling/         # Scheduling mocks
│   ├── unit/                   # Unit tests for utilities and functions
│   │   ├── auth/               # Auth utility tests
│   │   ├── hooks/              # Custom hook tests
│   │   ├── lib/                # Library function tests
│   │   └── utils/              # Utility function tests
│   └── utils/                  # Shared test utilities
│       ├── a11y-utils.ts       # Accessibility testing utilities
│       ├── auth-test-utils.ts  # Authentication testing utilities
│       ├── api-test-utils.ts   # API testing utilities
│       ├── mock-builders.ts    # Mock data generators
│       └── vitest-utils.ts     # Vitest rendering utilities
├── test-results/               # Test execution results
│   ├── coverage/               # Code coverage reports
│   ├── e2e/                    # E2E test results
│   ├── reports/                # Test execution reports
│   └── snapshots/              # Component snapshots
```

### File Naming Conventions

- **Unit Tests**: `[filename].test.ts` or `[filename].test.tsx`
- **Component Tests**: `[ComponentName].test.tsx`
- **API Tests**: `[endpoint-name].test.ts`
- **Integration Tests**: `[feature-name].test.ts` or `[feature-name].spec.ts`
- **E2E Tests**: `[user-flow].spec.ts`
- **Test Utilities**: `[utility-name]-utils.ts`
- **Mock Data**: `[domain].mocks.ts`

## Mock Data Strategy

### Core Principles

1. **Consistency**: Use shared mock data across test types
2. **Realistic Data**: Create mock data that represents real-world scenarios
3. **Flexibility**: Allow customization of mock data for specific test cases
4. **Type Safety**: Ensure all mock data follows type definitions
5. **Domain Separation**: Organize mock data by domain area

### Structured Mock Factory

```typescript
// __tests__/mocks/factory.ts
import { createBuilder, BuilderOptions } from './marketplace/builder.mocks'
import { createClient, ClientOptions } from './marketplace/client.mocks'
import { createSession, SessionOptions } from './scheduling/session.mocks'
import { createProject, ProjectOptions } from './profile/project.mocks'

export const mockFactory = {
  /**
   * Create a builder with customizable options
   */
  builder: (options?: Partial<BuilderOptions>) => createBuilder(options),
  
  /**
   * Create a client with customizable options
   */
  client: (options?: Partial<ClientOptions>) => createClient(options),
  
  /**
   * Create a session with customizable options
   */
  session: (options?: Partial<SessionOptions>) => createSession(options),
  
  /**
   * Create a project with customizable options
   */
  project: (options?: Partial<ProjectOptions>) => createProject(options),
  
  /**
   * Create multiple instances with consistent IDs
   */
  multiple: {
    builders: (count: number, baseOptions?: Partial<BuilderOptions>) => 
      Array.from({ length: count }, (_, i) => 
        createBuilder({ id: `builder-${i}`, ...baseOptions })
      ),
    
    clients: (count: number, baseOptions?: Partial<ClientOptions>) => 
      Array.from({ length: count }, (_, i) => 
        createClient({ id: `client-${i}`, ...baseOptions })
      ),
    
    sessions: (count: number, baseOptions?: Partial<SessionOptions>) => 
      Array.from({ length: count }, (_, i) => 
        createSession({ id: `session-${i}`, ...baseOptions })
      ),
  }
}
```

### Authentication Mock Data

```typescript
// __tests__/mocks/auth/users.mocks.ts
import { UserRole } from '@/lib/auth/types'

export interface MockUserOptions {
  id: string
  firstName: string
  lastName: string
  email: string
  roles: UserRole[]
  verified: boolean
  completedOnboarding: boolean
  stripeCustomerId?: string
  builderProfile?: {
    id: string
    slug: string
    validationTier: number
  }
}

const defaultUserOptions: MockUserOptions = {
  id: 'user_test123',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  roles: [UserRole.CLIENT],
  verified: true,
  completedOnboarding: true
}

export function createMockUser(options?: Partial<MockUserOptions>) {
  const opts = { ...defaultUserOptions, ...options }
  
  return {
    id: opts.id,
    firstName: opts.firstName,
    lastName: opts.lastName,
    fullName: `${opts.firstName} ${opts.lastName}`,
    username: opts.firstName.toLowerCase() + opts.lastName.toLowerCase(),
    primaryEmailAddress: {
      emailAddress: opts.email,
      id: `email_${opts.id}`,
      verification: { status: opts.verified ? 'verified' : 'unverified' }
    },
    primaryEmailAddressId: `email_${opts.id}`,
    emailAddresses: [{
      emailAddress: opts.email,
      id: `email_${opts.id}`,
      verification: { status: opts.verified ? 'verified' : 'unverified' }
    }],
    imageUrl: '/images/avatar-placeholder.png',
    publicMetadata: {
      roles: opts.roles,
      verified: opts.verified,
      completedOnboarding: opts.completedOnboarding,
      stripeCustomerId: opts.stripeCustomerId,
      builderProfile: opts.builderProfile
    },
    privateMetadata: {},
    unsafeMetadata: {},
    reload: async () => Promise.resolve(),
  }
}

export const mockUsers = {
  client: createMockUser({
    id: 'user_client123',
    roles: [UserRole.CLIENT],
    stripeCustomerId: 'cus_client123'
  }),
  
  builder: createMockUser({
    id: 'user_builder123',
    roles: [UserRole.BUILDER],
    stripeCustomerId: 'cus_builder123',
    builderProfile: {
      id: 'bld_123456',
      slug: 'testbuilder',
      validationTier: 2
    }
  }),
  
  admin: createMockUser({
    id: 'user_admin123',
    roles: [UserRole.ADMIN]
  }),
  
  multiRole: createMockUser({
    id: 'user_multi123',
    roles: [UserRole.CLIENT, UserRole.BUILDER],
    stripeCustomerId: 'cus_multi123',
    builderProfile: {
      id: 'bld_789012',
      slug: 'testmulti',
      validationTier: 3
    }
  }),
  
  unverified: createMockUser({
    id: 'user_unverified123',
    verified: false,
    completedOnboarding: false
  })
}
```

### Marketplace Mock Data

```typescript
// __tests__/mocks/marketplace/builder.mocks.ts
import { faker } from '@faker-js/faker'

export interface BuilderOptions {
  id: string
  displayName: string
  slug: string
  headline: string
  bio: string
  validationTier: number
  expertise: string[]
  hourlyRate: number
  availableForHire: boolean
  responseRate: number
  completedProjects: number
  domains: string[]
  badges: string[]
  topSkills: string[]
  isVerified: boolean
  featured: boolean
  searchable: boolean
}

const defaultBuilderOptions: BuilderOptions = {
  id: 'builder_123',
  displayName: 'Test Builder',
  slug: 'test-builder',
  headline: 'Full-stack AI Developer',
  bio: 'Experienced developer specializing in AI applications',
  validationTier: 2,
  expertise: ['React', 'Next.js', 'AI Integration'],
  hourlyRate: 85,
  availableForHire: true,
  responseRate: 95,
  completedProjects: 12,
  domains: ['Web Development', 'AI Applications'],
  badges: ['Fast Responder', 'Top Developer'],
  topSkills: ['React', 'Next.js', 'TypeScript', 'API Integration'],
  isVerified: true,
  featured: false,
  searchable: true
}

export function createBuilder(options?: Partial<BuilderOptions>) {
  const opts = { ...defaultBuilderOptions, ...options }
  
  return {
    id: opts.id,
    displayName: opts.displayName,
    slug: opts.slug,
    headline: opts.headline,
    bio: opts.bio,
    validationTier: opts.validationTier,
    expertise: opts.expertise,
    hourlyRate: { toNumber: () => opts.hourlyRate },
    availableForHire: opts.availableForHire,
    responseRate: opts.responseRate,
    completedProjects: opts.completedProjects,
    domains: opts.domains,
    badges: opts.badges,
    topSkills: opts.topSkills,
    isVerified: opts.isVerified,
    featured: opts.featured,
    searchable: opts.searchable,
    socialLinks: {
      github: 'https://github.com/testbuilder',
      website: 'https://example.com'
    },
    expertiseAreas: {
      REACT: {
        description: 'Expert in building React applications',
        bulletPoints: ['Component architecture', 'State management', 'Performance optimization'],
        testimonials: []
      },
      NEXTJS: {
        description: 'Experienced with Next.js framework',
        bulletPoints: ['Server-side rendering', 'API routes', 'Static site generation'],
        testimonials: []
      }
    },
    portfolioItems: [
      { id: 'proj_1', title: 'E-commerce Platform', description: 'Full-stack e-commerce solution' },
      { id: 'proj_2', title: 'AI Chatbot', description: 'Intelligent chatbot using NLP' }
    ]
  }
}

// Generate a collection of diverse builders
export function createBuilderCollection(count = 10) {
  return Array.from({ length: count }, (_, i) => {
    const tier = Math.floor(Math.random() * 3) + 1
    return createBuilder({
      id: `builder_${i + 1}`,
      displayName: faker.person.fullName(),
      slug: faker.helpers.slugify(faker.person.lastName()).toLowerCase(),
      headline: faker.helpers.arrayElement([
        'AI Developer', 
        'Full-stack Engineer',
        'React Specialist',
        'Next.js Expert',
        'Frontend Developer'
      ]),
      validationTier: tier,
      hourlyRate: faker.number.int({ min: 50, max: 200 }),
      availableForHire: faker.datatype.boolean(0.8),
      featured: i < 3, // Make first 3 featured
      expertise: faker.helpers.arrayElements(
        ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'AI', 'API Development'],
        faker.number.int({ min: 2, max: 5 })
      )
    })
  })
}
```

## Component Test Plans

### Authentication Component Test Plan

| ID | Component | Test Case | Description | Expected Outcome | Test Type |
|----|-----------|-----------|-------------|-----------------|-----------|
| AUTH-01 | AuthStatus | Render authenticated | Display authenticated user status | Shows user name and avatar | Component |
| AUTH-02 | AuthStatus | Render unauthenticated | Display sign-in button | Shows sign-in button | Component |
| AUTH-03 | AuthStatus | Handle loading state | Show loading indicator | Displays loading spinner | Component |
| AUTH-04 | ProtectedRoute | Authenticated with role | User has required role | Renders protected content | Integration |
| AUTH-05 | ProtectedRoute | Authenticated without role | User missing required role | Shows access denied message | Integration |
| AUTH-06 | ProtectedRoute | Unauthenticated | User not logged in | Redirects to login page | Integration |
| AUTH-07 | SignInForm | Valid credentials | Submit with valid credentials | Redirects after successful login | Component |
| AUTH-08 | SignInForm | Invalid credentials | Submit with invalid credentials | Shows validation errors | Component |
| AUTH-09 | SignUpForm | Valid submission | Submit with valid data | Creates account and redirects | Component |
| AUTH-10 | SignUpForm | Form validation | Submit with invalid data | Shows appropriate field errors | Component |
| AUTH-11 | UserProfile | Builder profile | Render builder profile view | Shows builder-specific content | Component |
| AUTH-12 | UserProfile | Client profile | Render client profile view | Shows client-specific content | Component |
| AUTH-13 | RoleBadges | Multiple roles | User with multiple roles | Shows all relevant role badges | Component |
| AUTH-14 | SignOut | Sign out action | Click sign out button | Logs out and redirects to home | Integration |
| AUTH-15 | AdminLayout | Admin access | Admin user visits admin route | Shows admin dashboard | Integration |
| AUTH-16 | AdminLayout | Unauthorized access | Non-admin visits admin route | Shows access denied or redirects | Integration |

### Marketplace Component Test Plan

| ID | Component | Test Case | Description | Expected Outcome | Test Type |
|----|-----------|-----------|-------------|-----------------|-----------|
| MKT-01 | BuilderCard | Render with data | Display builder info correctly | Shows name, skills, rating | Component |
| MKT-02 | BuilderCard | Click interaction | Click "View Profile" button | Navigates to builder profile | Component |
| MKT-03 | BuilderList | Render collection | Display multiple builders | Shows builder cards grid | Component |
| MKT-04 | BuilderList | Empty state | No builders available | Shows appropriate empty state | Component |
| MKT-05 | FilterPanel | Update filters | Change filter values | Updates builder list | Integration |
| MKT-06 | FilterPanel | Clear filters | Click clear button | Resets all filters | Component |
| MKT-07 | SearchBar | Valid search | Enter search term | Filters builders by term | Integration |
| MKT-08 | SearchBar | No results | Search with no matches | Shows "no results" message | Integration |
| MKT-09 | SortControls | Change sort | Select different sort option | Updates builder list order | Component |
| MKT-10 | PaginationControls | Navigate pages | Click next/prev | Shows appropriate page | Component |
| MKT-11 | BuilderProfile | View full profile | Load builder profile page | Shows complete profile data | Integration |
| MKT-12 | BuilderProfile | Book session | Click booking button | Navigates to booking flow | Integration |
| MKT-13 | ReviewSection | View reviews | Load review section | Shows builder reviews | Component |
| MKT-14 | PortfolioGallery | View projects | Browse portfolio items | Shows project previews | Component |
| MKT-15 | ValidationBadge | Display by tier | Show validation tier badge | Shows appropriate tier badge | Component |

### Booking/Payment Component Test Plan

| ID | Component | Test Case | Description | Expected Outcome | Test Type |
|----|-----------|-----------|-------------|-----------------|-----------|
| BOOK-01 | SessionTypeSelector | Display options | Show available session types | Lists session types with details | Component |
| BOOK-02 | SessionTypeSelector | Select session | Choose a session type | Updates selected session | Component |
| BOOK-03 | BookingCalendar | Display availability | Show available time slots | Shows correct availability | Component |
| BOOK-04 | BookingCalendar | Select time slot | Choose available time | Updates selected time | Component |
| BOOK-05 | BookingCalendar | Navigate month | Change month view | Shows correct month data | Component |
| BOOK-06 | BookingForm | Complete booking | Fill form with valid data | Proceeds to payment | Integration |
| BOOK-07 | BookingForm | Validation errors | Submit with invalid data | Shows validation errors | Component |
| BOOK-08 | PaymentForm | Valid payment | Submit valid payment | Processes payment successfully | Integration |
| BOOK-09 | PaymentForm | Invalid payment | Submit invalid payment | Shows payment error | Component |
| BOOK-10 | CheckoutSummary | Display details | Show booking summary | Shows correct price and details | Component |
| BOOK-11 | BookingConfirmation | Successful booking | View confirmation page | Shows booking confirmation | Integration |
| BOOK-12 | TimezonePicker | Change timezone | Select different timezone | Updates available times | Component |
| BOOK-13 | BookingStatus | Pending status | View pending booking | Shows pending state | Component |
| BOOK-14 | BookingStatus | Confirmed status | View confirmed booking | Shows confirmed state | Component |
| BOOK-15 | BookingStatus | Cancelled status | View cancelled booking | Shows cancelled state | Component |

## Example Test Cases

### Unit Test Example

```typescript
// __tests__/unit/utils/date-utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate, getTimeSlots, isAvailable } from '@/lib/utils/date-utils'

describe('Date Utilities', () => {
  describe('formatDate function', () => {
    it('formats date in short format correctly', () => {
      const date = new Date('2025-05-15T14:30:00Z')
      expect(formatDate(date, 'short')).toBe('May 15, 2025')
    })
    
    it('formats date in long format correctly', () => {
      const date = new Date('2025-05-15T14:30:00Z')
      expect(formatDate(date, 'long')).toBe('Thursday, May 15, 2025')
    })
    
    it('formats date with time correctly', () => {
      const date = new Date('2025-05-15T14:30:00Z')
      expect(formatDate(date, 'withTime')).toBe('May 15, 2025, 2:30 PM')
    })
    
    it('handles invalid dates gracefully', () => {
      const invalidDate = new Date('invalid-date')
      expect(formatDate(invalidDate, 'short')).toBe('Invalid Date')
    })
  })
  
  describe('getTimeSlots function', () => {
    it('generates correct 30-minute time slots', () => {
      const date = new Date('2025-05-15')
      const slots = getTimeSlots(date, 30)
      
      expect(slots).toHaveLength(24 * 2) // 48 slots in a day
      expect(slots[0].time).toBe('00:00')
      expect(slots[1].time).toBe('00:30')
      expect(slots[47].time).toBe('23:30')
    })
    
    it('generates correct 60-minute time slots', () => {
      const date = new Date('2025-05-15')
      const slots = getTimeSlots(date, 60)
      
      expect(slots).toHaveLength(24) // 24 slots in a day
      expect(slots[0].time).toBe('00:00')
      expect(slots[1].time).toBe('01:00')
      expect(slots[23].time).toBe('23:00')
    })
  })
  
  describe('isAvailable function', () => {
    it('returns true for available time slot', () => {
      const date = new Date('2025-05-15T14:30:00Z')
      const unavailableTimes = [
        new Date('2025-05-15T10:30:00Z'),
        new Date('2025-05-15T11:30:00Z')
      ]
      
      expect(isAvailable(date, unavailableTimes)).toBe(true)
    })
    
    it('returns false for unavailable time slot', () => {
      const date = new Date('2025-05-15T10:30:00Z')
      const unavailableTimes = [
        new Date('2025-05-15T10:30:00Z'),
        new Date('2025-05-15T11:30:00Z')
      ]
      
      expect(isAvailable(date, unavailableTimes)).toBe(false)
    })
  })
})
```

### Component Test Example

```typescript
// __tests__/components/marketplace/builder-card.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import BuilderCard from '@/components/marketplace/builder-card'
import { mockFactory } from '@/__tests__/mocks/factory'

describe('BuilderCard', () => {
  const mockBuilder = mockFactory.builder({
    displayName: 'Jane Smith',
    headline: 'React & Next.js Expert',
    validationTier: 3,
    hourlyRate: 120,
    topSkills: ['React', 'Next.js', 'TypeScript']
  })
  
  const onSelectMock = vi.fn()
  
  it('renders builder information correctly', () => {
    render(<BuilderCard builder={mockBuilder} onSelect={onSelectMock} />)
    
    // Check basic information is displayed
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('React & Next.js Expert')).toBeInTheDocument()
    expect(screen.getByText('$120/hr')).toBeInTheDocument()
    
    // Check skills are displayed
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Next.js')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    
    // Check validation tier badge is displayed
    const validationBadge = screen.getByTestId('validation-badge')
    expect(validationBadge).toBeInTheDocument()
    expect(validationBadge).toHaveTextContent('Tier 3')
  })
  
  it('calls onSelect when view profile button is clicked', () => {
    render(<BuilderCard builder={mockBuilder} onSelect={onSelectMock} />)
    
    const viewProfileButton = screen.getByRole('button', { name: /view profile/i })
    fireEvent.click(viewProfileButton)
    
    expect(onSelectMock).toHaveBeenCalledWith(mockBuilder.id)
  })
  
  it('displays correct availability status', () => {
    // Test with available builder
    render(<BuilderCard builder={mockBuilder} onSelect={onSelectMock} />)
    expect(screen.getByText(/available for hire/i)).toBeInTheDocument()
    
    // Test with unavailable builder
    const unavailableBuilder = mockFactory.builder({
      displayName: 'Jane Smith',
      availableForHire: false
    })
    
    render(<BuilderCard builder={unavailableBuilder} onSelect={onSelectMock} />)
    expect(screen.getByText(/not available/i)).toBeInTheDocument()
  })
  
  it('displays featured badge for featured builders', () => {
    // Test with non-featured builder (default)
    render(<BuilderCard builder={mockBuilder} onSelect={onSelectMock} />)
    expect(screen.queryByText(/featured/i)).not.toBeInTheDocument()
    
    // Test with featured builder
    const featuredBuilder = mockFactory.builder({
      displayName: 'Jane Smith',
      featured: true
    })
    
    render(<BuilderCard builder={featuredBuilder} onSelect={onSelectMock} />)
    expect(screen.getByText(/featured/i)).toBeInTheDocument()
  })
  
  it('has no accessibility violations', async () => {
    const { container } = render(
      <BuilderCard builder={mockBuilder} onSelect={onSelectMock} />
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### API Test Example

```typescript
// __tests__/api/marketplace/builders.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { GET } from '@/app/api/marketplace/builders/route'
import { mockBuilders } from '@/__tests__/mocks/marketplace/builder.mocks'
import { mockClerkServerAuth } from '@/__tests__/utils/auth-test-utils'

// Mock the database queries
vi.mock('@/lib/marketplace/data-service', () => ({
  marketplaceData: {
    getBuilders: vi.fn().mockResolvedValue(mockBuilders),
    getBuilderById: vi.fn().mockImplementation((id) => 
      Promise.resolve(mockBuilders.find(b => b.id === id) || null)
    )
  }
}))

describe('Marketplace API - Builders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  describe('GET /api/marketplace/builders', () => {
    it('returns all builders with 200 status', async () => {
      // Mock request
      const request = new NextRequest('http://localhost:3000/api/marketplace/builders')
      
      // Call API route
      const response = await GET(request)
      
      // Check response
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.builders).toHaveLength(mockBuilders.length)
      expect(data.builders[0]).toHaveProperty('id')
      expect(data.builders[0]).toHaveProperty('displayName')
    })
    
    it('filters builders by expertise', async () => {
      // Mock request with search params
      const url = new URL('http://localhost:3000/api/marketplace/builders')
      url.searchParams.set('expertise', 'React')
      const request = new NextRequest(url)
      
      // Mock filtered data
      const filteredBuilders = mockBuilders.filter(b => 
        b.expertise.includes('React')
      )
      vi.mocked(marketplaceData.getBuilders).mockResolvedValueOnce(filteredBuilders)
      
      // Call API route
      const response = await GET(request)
      
      // Check response
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.builders.length).toBeLessThan(mockBuilders.length)
      expect(data.builders.every(b => b.expertise.includes('React'))).toBe(true)
    })
    
    it('handles database errors gracefully', async () => {
      // Mock database error
      vi.mocked(marketplaceData.getBuilders).mockRejectedValueOnce(
        new Error('Database connection error')
      )
      
      // Mock request
      const request = new NextRequest('http://localhost:3000/api/marketplace/builders')
      
      // Call API route
      const response = await GET(request)
      
      // Check response
      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toHaveProperty('message')
    })
  })
  
  describe('GET /api/marketplace/builders/:id', () => {
    it('returns a specific builder with 200 status', async () => {
      // Create URL with parameter
      const url = new URL('http://localhost:3000/api/marketplace/builders/builder_1')
      
      // Mock Next.js params
      const request = new NextRequest(url)
      const context = { params: { id: 'builder_1' } }
      
      // Call API route
      const response = await GET(request, context)
      
      // Check response
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.builder).toHaveProperty('id', 'builder_1')
    })
    
    it('returns 404 for non-existent builder', async () => {
      // Create URL with non-existent ID
      const url = new URL('http://localhost:3000/api/marketplace/builders/non-existent')
      
      // Mock Next.js params
      const request = new NextRequest(url)
      const context = { params: { id: 'non-existent' } }
      
      // Mock empty result
      vi.mocked(marketplaceData.getBuilderById).mockResolvedValueOnce(null)
      
      // Call API route
      const response = await GET(request, context)
      
      // Check response
      expect(response.status).toBe(404)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toHaveProperty('message')
    })
  })
})
```

### Integration Test Example

```typescript
// __tests__/integration/booking-payment/booking-flow.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BookingFlow from '@/components/booking/booking-flow'
import { setupMockClerk } from '@/__tests__/utils/auth-test-utils'
import { mockFactory } from '@/__tests__/mocks/factory'
import { mockStripe } from '@/__tests__/mocks/payment/stripe.mocks'

// Mock dependencies
vi.mock('@stripe/react-stripe-js', () => mockStripe.reactStripe)
vi.mock('@/lib/scheduling/actions', () => ({
  createBooking: vi.fn().mockResolvedValue({ id: 'booking_123', success: true })
}))
vi.mock('@/lib/stripe/actions', () => ({
  createCheckoutSession: vi.fn().mockResolvedValue({ 
    id: 'cs_123', 
    url: 'https://checkout.stripe.com/test'
  })
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}))

describe('Booking Flow Integration', () => {
  // Set up test data
  const mockBuilder = mockFactory.builder()
  const mockSessions = [
    mockFactory.session({
      id: 'session_1',
      title: '30-Minute Consultation',
      durationMinutes: 30,
      price: 50
    }),
    mockFactory.session({
      id: 'session_2',
      title: '1-Hour Consultation',
      durationMinutes: 60,
      price: 100
    })
  ]
  
  beforeEach(() => {
    // Set up authenticated user
    setupMockClerk('client')
    vi.clearAllMocks()
  })
  
  it('completes the full booking flow from session selection to payment', async () => {
    // Render the booking flow
    render(
      <BookingFlow 
        builder={mockBuilder}
        sessionTypes={mockSessions}
      />
    )
    
    // 1. Session type selection
    expect(screen.getByText('30-Minute Consultation')).toBeInTheDocument()
    expect(screen.getByText('1-Hour Consultation')).toBeInTheDocument()
    
    // Select the 1-hour session
    fireEvent.click(screen.getByText('1-Hour Consultation'))
    
    // Click continue
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    
    // 2. Calendar and time selection
    await waitFor(() => {
      expect(screen.getByTestId('booking-calendar')).toBeInTheDocument()
    })
    
    // Select an available time slot
    const timeSlot = screen.getByTestId('time-slot-1')
    fireEvent.click(timeSlot)
    
    // Click continue
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    
    // 3. Booking details form
    await waitFor(() => {
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()
    })
    
    // Fill in booking details
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test Client' }
    })
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    
    fireEvent.change(screen.getByLabelText(/project details/i), {
      target: { value: 'Need help with my React app' }
    })
    
    // Click continue
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    
    // 4. Payment form
    await waitFor(() => {
      expect(screen.getByTestId('payment-form')).toBeInTheDocument()
    })
    
    // Verify payment summary shows correct details
    expect(screen.getByText('1-Hour Consultation')).toBeInTheDocument()
    expect(screen.getByText('$100.00')).toBeInTheDocument()
    
    // Submit payment
    fireEvent.click(screen.getByRole('button', { name: /pay now/i }))
    
    // Verify API calls
    await waitFor(() => {
      expect(createBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionTypeId: 'session_2',
          builderId: mockBuilder.id,
          clientName: 'Test Client',
          clientEmail: 'test@example.com'
        })
      )
      
      expect(createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingId: 'booking_123',
          amount: 10000, // $100.00 in cents
          customerEmail: 'test@example.com'
        })
      )
    })
  })
  
  it('handles validation errors in booking form', async () => {
    // Render the booking flow
    render(
      <BookingFlow 
        builder={mockBuilder}
        sessionTypes={mockSessions}
      />
    )
    
    // 1. Session type selection
    fireEvent.click(screen.getByText('30-Minute Consultation'))
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    
    // 2. Calendar and time selection
    await waitFor(() => {
      expect(screen.getByTestId('booking-calendar')).toBeInTheDocument()
    })
    
    const timeSlot = screen.getByTestId('time-slot-1')
    fireEvent.click(timeSlot)
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    
    // 3. Booking details form
    await waitFor(() => {
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()
    })
    
    // Submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    
    // Verify validation errors
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
    
    // Verify API not called
    expect(createBooking).not.toHaveBeenCalled()
  })
})
```

### E2E Test Example

```typescript
// __tests__/e2e/booking/booking-payment-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Booking and Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as a client user
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test-client@example.com')
    await page.fill('input[name="password"]', 'test-password')
    await page.click('button[type="submit"]')
    
    // Wait for successful login
    await page.waitForURL('/dashboard')
  })
  
  test('complete builder booking process from profile to confirmation', async ({ page }) => {
    // Go to builder profile
    await page.goto('/profile/test-builder')
    
    // Verify profile loaded
    await expect(page.locator('h1')).toContainText('Test Builder')
    
    // Click Book button
    await page.click('[data-testid="booking-button"]')
    
    // Step 1: Select session type
    await page.waitForURL(/\/book\/.*/)
    
    // Verify session types are displayed
    await expect(page.locator('[data-testid="session-type-card"]')).toHaveCount(2)
    
    // Select a session type (1-hour consultation)
    await page.click('text=1-Hour Consultation')
    await page.click('button:has-text("Continue")')
    
    // Step 2: Select date and time
    await page.waitForSelector('[data-testid="booking-calendar"]')
    
    // Select a date in the future (next available date)
    await page.click('[data-testid="next-month-button"]')
    await page.click('.react-calendar__tile:not(.react-calendar__tile--disabled)').first()
    
    // Select a time slot
    await page.click('[data-testid="time-slot"]:not([data-disabled="true"])').first()
    await page.click('button:has-text("Continue")')
    
    // Step 3: Fill booking details form
    await page.waitForSelector('[data-testid="booking-form"]')
    
    // Fill the form
    await page.fill('input[name="name"]', 'Test Client')
    await page.fill('textarea[name="projectDetails"]', 'Need help with my React application development')
    await page.click('button:has-text("Continue")')
    
    // Step 4: Payment
    await page.waitForSelector('[data-testid="payment-form"]')
    
    // Verify booking summary
    await expect(page.locator('[data-testid="booking-summary"]')).toContainText('1-Hour Consultation')
    await expect(page.locator('[data-testid="booking-price"]')).toContainText('$100.00')
    
    // Mock successful payment (in test environment)
    await page.evaluate(() => {
      window.localStorage.setItem('test:mockPaymentSuccess', 'true')
    })
    
    // Click Pay button
    await page.click('button:has-text("Pay Now")')
    
    // Step 5: Confirmation
    await page.waitForURL(/\/booking\/confirmation\/.*/)
    
    // Verify confirmation page
    await expect(page.locator('h1')).toContainText('Booking Confirmed')
    await expect(page.locator('[data-testid="booking-details"]')).toContainText('Test Builder')
    await expect(page.locator('[data-testid="booking-details"]')).toContainText('1-Hour Consultation')
    
    // Verify add to calendar button is present
    await expect(page.locator('button:has-text("Add to Calendar")')).toBeVisible()
  })
  
  test('handles session unavailability correctly', async ({ page }) => {
    // Go to builder profile with unavailable sessions
    await page.goto('/profile/unavailable-builder')
    
    // Click Book button
    await page.click('[data-testid="booking-button"]')
    
    // Step 1: Select session type
    await page.waitForURL(/\/book\/.*/)
    
    // Select a session type
    await page.click('[data-testid="session-type-card"]').first()
    await page.click('button:has-text("Continue")')
    
    // Step 2: Calendar shows no available times
    await page.waitForSelector('[data-testid="booking-calendar"]')
    
    // Verify unavailability message
    await expect(page.locator('[data-testid="no-availability-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="no-availability-message"]')).toContainText('No available times')
    
    // Verify disabled continue button
    await expect(page.locator('button:has-text("Continue")')).toBeDisabled()
  })
})
```

## Test Utilities

### Authentication Test Utilities

```typescript
// __tests__/utils/auth-test-utils.ts
import { vi } from 'vitest'
import { render } from '@testing-library/react'
import { UserRole } from '@/lib/auth/types'
import { mockUsers, createMockUser } from '@/__tests__/mocks/auth/users.mocks'

/**
 * Create a mock Clerk object with authenticated state
 */
export function createAuthenticatedMock(
  userType: keyof typeof mockUsers = 'client',
  overrides: Record<string, any> = {}
) {
  const userData = { ...mockUsers[userType], ...overrides }
  
  return {
    __esModule: true,
    default: {},
    // Auth hooks
    useAuth: () => ({
      isLoaded: true,
      isSignedIn: true,
      userId: userData.id,
      sessionId: 'sess_test123',
      signOut: vi.fn().mockResolvedValue(undefined),
      user: userData,
    }),
    useUser: () => ({
      isLoaded: true,
      isSignedIn: true,
      user: userData,
    }),
    // Client components
    SignIn: ({ children }: any) => children,
    SignUp: ({ children }: any) => children,
    SignedIn: ({ children }: any) => children,
    SignedOut: () => null,
    UserButton: () => null,
    // Server functions
    auth: () => ({
      userId: userData.id,
      sessionId: 'sess_test123',
      getToken: vi.fn().mockResolvedValue('test-token'),
    }),
    currentUser: () => userData,
    clerkClient: {
      users: {
        getUser: vi.fn().mockResolvedValue(userData),
        updateUser: vi.fn().mockResolvedValue(userData),
      },
    },
    // Helpers/middleware
    authMiddleware: () => (req: any) => req,
    Protect: ({ children }: any) => children,
  }
}

/**
 * Create a mock Clerk object for unauthenticated state
 */
export function createUnauthenticatedMock() {
  return {
    __esModule: true,
    default: {},
    // Auth hooks
    useAuth: () => ({
      isLoaded: true,
      isSignedIn: false,
      userId: null,
      sessionId: null,
      signOut: vi.fn(),
      user: null,
    }),
    useUser: () => ({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    }),
    // Client components
    SignIn: ({ children }: any) => children,
    SignUp: ({ children }: any) => children,
    SignedIn: () => null,
    SignedOut: ({ children }: any) => children,
    UserButton: () => null,
    // Server functions
    auth: () => ({
      userId: null,
      sessionId: null,
      getToken: vi.fn().mockResolvedValue(null),
    }),
    currentUser: () => null,
    clerkClient: {
      users: {
        getUser: vi.fn().mockRejectedValue(new Error('User not found')),
      },
    },
    // Helpers/middleware
    authMiddleware: () => (req: any) => req,
    Protect: () => null,
  }
}

/**
 * Set up mock Clerk auth for testing
 */
export function setupMockClerk(
  userType: keyof typeof mockUsers | 'unauthenticated' = 'client',
  overrides: Record<string, any> = {}
) {
  if (userType === 'unauthenticated') {
    vi.mock('@clerk/nextjs', () => createUnauthenticatedMock())
    return createUnauthenticatedMock()
  }
  
  const mockClerk = createAuthenticatedMock(userType as keyof typeof mockUsers, overrides)
  vi.mock('@clerk/nextjs', () => mockClerk)
  return mockClerk
}

/**
 * Render a component with mock authentication
 */
export function renderWithAuth(
  ui: React.ReactElement,
  options: {
    userType?: keyof typeof mockUsers | 'unauthenticated',
    userOverrides?: Record<string, any>,
    renderOptions?: Parameters<typeof render>[1]
  } = {}
) {
  // Set up mock auth
  const { userType = 'client', userOverrides = {} } = options
  setupMockClerk(userType, userOverrides)
  
  // Render the component
  return render(ui, options.renderOptions)
}

/**
 * Reset auth mocks
 */
export function resetMockClerk() {
  vi.resetModules()
  vi.clearAllMocks()
}

/**
 * Mock Clerk server authentication for API tests
 */
export function mockClerkServerAuth(options: {
  isAuthenticated: boolean,
  userId?: string,
  roles?: UserRole[]
}) {
  const { isAuthenticated, userId = 'user_test123', roles = [UserRole.CLIENT] } = options
  
  vi.mock('@clerk/nextjs/server', () => ({
    auth: () => ({
      userId: isAuthenticated ? userId : null,
      sessionClaims: isAuthenticated ? {
        sub: userId,
        public_metadata: {
          roles
        }
      } : null,
      getToken: vi.fn().mockResolvedValue(isAuthenticated ? 'test-token' : null),
    }),
    currentUser: () => isAuthenticated ? createMockUser({
      id: userId,
      roles
    }) : null,
    clerkClient: {
      users: {
        getUser: vi.fn().mockResolvedValue(
          isAuthenticated ? createMockUser({ id: userId, roles }) : null
        ),
      },
    },
  }))
}
```

### Accessibility Testing Utilities

```typescript
// __tests__/utils/a11y-utils.ts
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { expect } from 'vitest'

// Make sure jest-axe matcher is available
expect.extend(toHaveNoViolations)

/**
 * Options for accessibility testing
 */
export interface AccessibilityTestOptions {
  /**
   * Rules to run or skip
   * @example { 'color-contrast': { enabled: false } }
   */
  rules?: Record<string, { enabled: boolean }>
  /**
   * WCAG guidelines to check
   * @example ['wcag2a', 'wcag2aa']
   */
  wcag?: ('wcag2a' | 'wcag2aa' | 'wcag2aaa' | 'wcag21a' | 'wcag21aa')[]
  /**
   * Additional options for axe-core
   */
  axeOptions?: Record<string, any>
}

/**
 * Test a component for accessibility violations
 */
export async function testAccessibility(
  ui: React.ReactElement,
  options: AccessibilityTestOptions = {}
) {
  const { rules, wcag = ['wcag21aa'], axeOptions = {} } = options
  
  const container = render(ui).container
  
  const results = await axe(container, {
    rules,
    // Specify which WCAG guidelines to check
    runOnly: {
      type: 'tag',
      values: wcag,
    },
    ...axeOptions,
  })
  
  expect(results).toHaveNoViolations()
  
  return results
}

/**
 * Create a reusable test for accessibility checks
 */
export function createA11yTest(componentName: string) {
  return (ui: React.ReactElement, options: AccessibilityTestOptions = {}) => {
    it(`${componentName} has no accessibility violations`, async () => {
      await testAccessibility(ui, options)
    })
  }
}

/**
 * Generate a detailed accessibility report
 */
export async function generateA11yReport(
  ui: React.ReactElement,
  options: AccessibilityTestOptions = {}
) {
  const results = await testAccessibility(ui, options)
  
  // Format results for reporting
  return {
    passes: results.passes?.length || 0,
    violations: results.violations?.map(violation => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.length,
    })) || [],
    incomplete: results.incomplete?.length || 0,
    timestamp: new Date().toISOString(),
  }
}
```

### API Testing Utilities

```typescript
// __tests__/utils/api-test-utils.ts
import { NextRequest } from 'next/server'
import { vi } from 'vitest'
import { mockUsers } from '@/__tests__/mocks/auth/users.mocks'

/**
 * Create a mock NextRequest with optional authentication headers
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string,
    headers?: Record<string, string>,
    cookies?: Record<string, string>,
    body?: any,
    searchParams?: Record<string, string>
  } = {}
) {
  // Create URL with search params
  const fullUrl = new URL(url.startsWith('http') ? url : `http://localhost${url}`)
  
  // Add search params
  if (options.searchParams) {
    Object.entries(options.searchParams).forEach(([key, value]) => {
      fullUrl.searchParams.set(key, value)
    })
  }
  
  // Create init options
  const init: RequestInit = {
    method: options.method || 'GET',
    headers: options.headers || {},
  }
  
  // Add body if specified
  if (options.body) {
    if (typeof options.body === 'object') {
      init.body = JSON.stringify(options.body)
      init.headers = {
        'Content-Type': 'application/json',
        ...init.headers,
      }
    } else {
      init.body = options.body
    }
  }
  
  // Create request
  const req = new NextRequest(fullUrl, init)
  
  // Add cookies
  if (options.cookies) {
    Object.entries(options.cookies).forEach(([key, value]) => {
      // @ts-ignore - cookies is readonly but we need to mock it
      req.cookies.set(key, value)
    })
  }
  
  return req
}

/**
 * Create a mock authenticated NextRequest for API testing
 */
export function createAuthenticatedRequest(
  url: string,
  options: {
    method?: string,
    userType?: keyof typeof mockUsers,
    body?: any,
    searchParams?: Record<string, string>
  } = {}
) {
  const { userType = 'client', ...requestOptions } = options
  const userData = mockUsers[userType]
  
  return createMockRequest(url, {
    ...requestOptions,
    headers: {
      'x-user-id': userData.id,
      'x-user-roles': JSON.stringify(userData.publicMetadata.roles),
      ...requestOptions.headers,
    },
  })
}

/**
 * Mock API route context with params
 */
export function createRouteContext(params: Record<string, string>) {
  return { params }
}

/**
 * Mock the database client and its methods
 */
export function mockPrismaClient() {
  return {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    builderProfile: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    sessionType: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    booking: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(async (callback) => await callback()),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  }
}
```

## Accessibility Testing

### Automated A11y Testing

The testing framework includes comprehensive accessibility testing using `jest-axe` to validate components against WCAG 2.1 AA standards.

```typescript
// __tests__/components/ui/button.a11y.test.tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Button } from '@/components/ui/core/button'

describe('Button Accessibility', () => {
  it('has no accessibility violations for default button', async () => {
    const { container } = render(<Button>Click Me</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  
  it('has no accessibility violations for disabled button', async () => {
    const { container } = render(<Button disabled>Disabled</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  
  it('has no accessibility violations for button with icon', async () => {
    const { container } = render(
      <Button>
        <svg aria-hidden="true" />
        Button with Icon
      </Button>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  
  it('warns if button has no accessible text', async () => {
    const { container } = render(
      <Button>
        <svg />
      </Button>
    )
    const results = await axe(container)
    
    // Check for specific violation
    const violations = results.violations
    const hasNameViolation = violations.some(v => v.id === 'button-name')
    expect(hasNameViolation).toBe(true)
  })
})
```

### Accessibility Test Plan

The accessibility testing strategy covers:

1. **Automated Testing**: Using `jest-axe` to check components
2. **Keyboard Navigation Testing**: Testing focus management and keyboard interactions
3. **Screen Reader Testing**: Validating ARIA attributes and screen reader announcements
4. **Color Contrast Testing**: Verifying compliance with WCAG 2.1 AA contrast ratios
5. **Content Structure Testing**: Checking heading hierarchy and landmark regions

Example accessibility-focused tests:

```typescript
// __tests__/components/ui/form.a11y.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Form, FormField, FormLabel, FormInput, FormError } from '@/components/ui/core/form'

describe('Form Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <Form>
        <FormField>
          <FormLabel htmlFor="name">Name</FormLabel>
          <FormInput id="name" name="name" />
        </FormField>
        <FormField>
          <FormLabel htmlFor="email">Email</FormLabel>
          <FormInput id="email" name="email" type="email" />
        </FormField>
        <Button type="submit">Submit</Button>
      </Form>
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  
  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    
    render(
      <Form>
        <FormField>
          <FormLabel htmlFor="name">Name</FormLabel>
          <FormInput id="name" name="name" />
        </FormField>
        <FormField>
          <FormLabel htmlFor="email">Email</FormLabel>
          <FormInput id="email" name="email" type="email" />
        </FormField>
        <Button type="submit">Submit</Button>
      </Form>
    )
    
    // Check that Tab key navigates through form elements
    await user.tab()
    expect(screen.getByLabelText('Name')).toHaveFocus()
    
    await user.tab()
    expect(screen.getByLabelText('Email')).toHaveFocus()
    
    await user.tab()
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus()
  })
  
  it('shows validation errors accessibly', async () => {
    const user = userEvent.setup()
    
    render(
      <Form>
        <FormField>
          <FormLabel htmlFor="name">Name</FormLabel>
          <FormInput id="name" name="name" required aria-describedby="name-error" />
          <FormError id="name-error">Name is required</FormError>
        </FormField>
        <Button type="submit">Submit</Button>
      </Form>
    )
    
    // Find the form elements
    const nameInput = screen.getByLabelText('Name')
    const submitButton = screen.getByRole('button', { name: 'Submit' })
    
    // Try to submit without filling the required field
    await user.click(submitButton)
    
    // Check that error message is linked to input for screen readers
    const errorElement = screen.getByText('Name is required')
    expect(errorElement).toHaveAttribute('id', 'name-error')
    expect(nameInput).toHaveAttribute('aria-describedby', 'name-error')
    expect(nameInput).toHaveAttribute('aria-invalid', 'true')
  })
})
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:

jobs:
  # Unit and Component tests
  test:
    name: Unit & Component Tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run linting
        run: pnpm lint
      
      - name: Run type checking
        run: pnpm type-check
      
      - name: Run unit and component tests
        run: pnpm test:ci
      
      - name: Upload test coverage
        uses: actions/upload-artifact@v3
        with:
          name: coverage
          path: test-results/coverage
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/reports
  
  # E2E tests
  e2e:
    name: End-to-End Tests
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps
      
      - name: Build the application
        run: pnpm build
      
      - name: Start the application
        run: pnpm start & npx wait-on http://localhost:3000
      
      - name: Run E2E tests
        run: pnpm exec playwright test
      
      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
  
  # Datadog integration
  datadog:
    name: Datadog Reporting
    runs-on: ubuntu-latest
    needs: [test, e2e]
    if: always()
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Download test coverage
        uses: actions/download-artifact@v3
        with:
          name: coverage
          path: test-results/coverage
      
      - name: Download test results
        uses: actions/download-artifact@v3
        with:
          name: test-results
          path: test-results/reports
      
      - name: Setup Datadog Agent
        uses: datadog/agent-github-action@v1
        with:
          api_key: ${{ secrets.DATADOG_API_KEY }}
          site: datadoghq.com
      
      - name: Run Datadog reporting
        run: node datadog-test-agent.js
        env:
          DATADOG_API_KEY: ${{ secrets.DATADOG_API_KEY }}
          DATADOG_APP_KEY: ${{ secrets.DATADOG_APP_KEY }}
```

### Test Coverage Reporting

```typescript
// scripts/create-coverage-badge.js
const fs = require('fs')
const path = require('path')

// Read coverage summary
const coverageSummaryPath = path.join(__dirname, '../test-results/coverage/coverage-summary.json')
const coverageSummary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'))

// Get total coverage percentage
const totalCoverage = coverageSummary.total.statements.pct

// Determine badge color
let color = 'red'
if (totalCoverage >= 90) {
  color = 'brightgreen'
} else if (totalCoverage >= 80) {
  color = 'green'
} else if (totalCoverage >= 70) {
  color = 'yellowgreen'
} else if (totalCoverage >= 60) {
  color = 'yellow'
} else if (totalCoverage >= 50) {
  color = 'orange'
}

// Generate badge URL
const badgeUrl = `https://img.shields.io/badge/coverage-${totalCoverage}%25-${color}`

// Write badge URL to file
fs.writeFileSync(path.join(__dirname, '../test-results/coverage-badge.txt'), badgeUrl)

console.log(`Coverage badge generated: ${badgeUrl}`)
```

## Maintenance Guidelines

### Best Practices for Test Maintenance

1. **Test Isolation**: Keep tests independent of each other
2. **Follow Domain Organization**: Organize tests by domain for clear organization
3. **Use Mock Factory**: Use standardized mock data for tests
4. **Focus on Behavior**: Test component behavior, not implementation details
5. **Use Test-Driven Development**: Write tests before implementing features
6. **Keep Test Coverage High**: Aim for at least 80% test coverage
7. **Document Edge Cases**: Comment on complex edge cases in tests
8. **Support Accessibility**: Include accessibility tests for all components
9. **Monitor Test Performance**: Watch for slow tests and optimize them
10. **Update Tests with Code Changes**: Maintain tests as features evolve

### Code Review Checklist for Tests

- [ ] Tests follow naming conventions
- [ ] Tests use the correct mock data
- [ ] Tests cover positive and negative scenarios
- [ ] Tests include accessibility checks
- [ ] Test isolation is maintained
- [ ] Tests are fast and efficient
- [ ] Tests focus on behavior, not implementation details
- [ ] Tests provide good failure messages
- [ ] Tests avoid duplication
- [ ] Tests are documented where needed

### Recommended Testing Workflow

1. **Write Component Tests First**: Start with component tests to validate UI
2. **Add Unit Tests**: Write unit tests for utilities and hooks
3. **Develop Integration Tests**: Add integration tests for component interactions
4. **Complete with E2E Tests**: Add E2E tests for critical user flows
5. **Verify Accessibility**: Run accessibility tests on all components
6. **Measure Coverage**: Check test coverage and add tests where needed
7. **Optimize Performance**: Review test performance and optimize slow tests
8. **Document Special Cases**: Document any special test requirements

## Conclusion

This testing framework provides a comprehensive approach to ensuring the quality of the Buildappswith platform. By implementing a structured testing strategy across all levels from unit to end-to-end tests, with a focus on accessibility and authentication, the platform can maintain high quality standards through ongoing development. The framework is designed to be maintainable, scalable, and integrated with CI/CD workflows to provide visibility into test results and coverage.