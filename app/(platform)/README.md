# Platform Route Group

This directory contains the platform functionality for authenticated users of the Buildappswith platform. The route structure follows a role-based organization with unified components for each major feature area.

## Directory Structure

```
/(platform)
├── dashboard/           # Role-based dashboard with unified implementation
├── profile/             # Unified profile system for all user types
├── booking/             # Booking functionality for session scheduling
├── payment/             # Payment processing and transaction management
├── marketplace/         # Marketplace for discovering builders
├── admin/               # Administrative functionality
└── layout.tsx           # Shared platform layout with authentication
```

## Key Components

### Dashboard

The dashboard provides a unified entry point with role-specific content based on the user's role:

- **Client Dashboard**: Shows booked sessions, favorites, and recommendations
- **Builder Dashboard**: Shows upcoming sessions, profile completeness, and earnings
- **Admin Dashboard**: Shows platform metrics, verification queue, and system status

### Profile

The profile section manages user profiles with specialized views:

- **Builder Profiles**: Resume, expertise, portfolio, and validation tier
- **Client Profiles**: Preferences, history, and saved builders
- **Profile Editing**: Role-specific profile management

### Booking

The booking system handles the scheduling and management of sessions:

- **Calendar View**: Available time slots based on builder schedules
- **Session Type Selection**: Different session formats and durations
- **Booking Confirmation**: Summary and payment initiation

### Payment

The payment section manages financial transactions:

- **Checkout Process**: Secure payment processing
- **Transaction History**: Past payment records
- **Invoices and Receipts**: Documentation for payments

### Marketplace

The marketplace enables discovery of builders and services:

- **Builder Directory**: Searchable list of verified builders
- **Filtering and Sorting**: Find specific expertise or availability
- **Builder Detail Pages**: Comprehensive builder information

### Admin

The admin section provides platform management capabilities:

- **User Management**: Account administration and role assignment
- **Builder Verification**: Approval workflow for new builders
- **System Settings**: Platform configuration and features

## Integration Points

The platform group integrates with:

- **Authentication System**: User identity and role management
- **API Routes**: Data access and manipulation
- **External Services**: Payment processing, calendar integration, etc.

## Usage Guidelines

1. All new platform functionality should be added to the appropriate domain directory
2. Follow the role-based structure for user-specific features
3. Use the shared layout for consistent navigation and authentication
4. Add any new route groups to this documentation
