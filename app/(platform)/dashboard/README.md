# Unified Dashboard

This directory contains the unified dashboard implementation for the Buildappswith platform. The dashboard is designed with a role-based approach, providing appropriate functionality based on the user's roles.

## Architecture

The dashboard uses a role-based architecture to replace the previous implementation of three separate dashboards (builder-dashboard, client-dashboard, and generic dashboard). This approach:

1. **Supports Multiple Roles**: Users can have multiple roles (ADMIN, BUILDER, CLIENT) and switch between different dashboard views
2. **Centralizes Logic**: Consolidates dashboard implementation in one location with role-specific components
3. **Improves Maintainability**: Reduces code duplication and ensures consistent functionality across roles
4. **Enhances User Experience**: Provides a unified interface with seamless role transitions

## Implementation

The dashboard is implemented with the following components:

- **page.tsx**: Main entry point with role detection and conditional rendering
- **layout.tsx**: Dashboard-specific layout with navigation and common elements
- **RoleDashboard Component**: Server component that renders the appropriate dashboard based on user roles

## Role-Specific Components

Domain-specific dashboard components are imported from their respective domains:

- **AdminDashboard**: From `/components/admin` - Administrative functionality
- **BuilderDashboard**: From `/components/marketplace` - Builder-specific functionality
- **ClientDashboard**: From `/components/profile` - Client-specific functionality

## Integration with Other Domains

The dashboard integrates with other platform domains through consistent navigation and functionality:

- **Profile Integration**: Links to the unified profile system
- **Marketplace Integration**: Access to marketplace functionality
- **Booking Integration**: View and manage bookings
- **Community Integration**: Connect to community features

## User Experience

The dashboard provides a consistent user experience with:

- **Role Switching**: Easy transition between different roles
- **Quick Actions**: Frequently used actions for each role
- **Status Indicators**: Visual feedback on important information
- **Personalized Content**: Content tailored to the user's roles and preferences

## Security

The dashboard implements appropriate security measures:

- **Server-Side Role Verification**: Authentication and authorization handled on the server
- **Role-Based Access Control**: Functionality restricted based on user roles
- **Protected Routes**: Secure access to sensitive information and operations
