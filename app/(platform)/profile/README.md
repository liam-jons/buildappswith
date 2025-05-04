# Unified Profile System

This directory contains the unified profile system for the Buildappswith platform. It implements a role-based approach to profile management, providing different views based on user roles (builder, client, admin) while maintaining a consistent user experience.

## Directory Structure

```
/profile
├── [id]/                 # Dynamic profile routes (public profiles)
│   └── page.tsx          # Public profile display page
├── edit/                 # Profile editing functionality
│   └── page.tsx          # Profile edit page
├── settings/             # Profile settings management
│   ├── account/          # Account settings
│   ├── availability/     # Availability settings (builder only)
│   ├── payments/         # Payment settings
│   └── preferences/      # User preferences
├── dashboard/            # Profile dashboard
│   └── page.tsx          # Profile-specific dashboard
├── page.tsx              # Main profile page (role-based)
└── layout.tsx            # Profile section layout
```

## Pages Overview

### Main Profile Page (`page.tsx`)

The main profile page implements role-based content, showing different information based on the user's role:

1. **Builder Profile View**:
   - Trust architecture indicators
   - Portfolio showcase
   - Session types and availability
   - Success metrics and reviews

2. **Client Profile View**:
   - Personal information
   - Booking history
   - Favorite builders
   - Payment information

3. **Admin Profile View**:
   - All user information
   - Administrative controls
   - System metrics and logs

### Dynamic Profile Routes (`[id]/page.tsx`)

Public profile pages for viewing other users' profiles:

- Publicly viewable information only
- Different views based on profile type (builder vs. client)
- Authentication check for private information

### Profile Edit Page (`edit/page.tsx`)

Allows users to edit their profile information:

- Role-specific fields
- Image upload capability
- Form validation
- Save and cancel functionality

## Integration With Other Domains

The profile system integrates with several other domains:

- **Trust Domain**: For validation tier display and management
- **Scheduling Domain**: For builder availability and booking history
- **Marketplace Domain**: For builder discovery and presentation
- **Payment Domain**: For transaction history and payment settings

## Implementation Guidelines

When implementing profile pages:

1. Use server components for data-fetching operations
2. Implement role-based content using conditional rendering
3. Keep forms and interactive elements as client components
4. Ensure proper error handling for all operations
5. Maintain consistent UI patterns across all profile pages
