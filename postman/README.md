# BuildappsWith API Testing with Postman

This directory contains Postman collections for testing the BuildappsWith API endpoints. These collections are designed to help with API development, testing, and debugging.

## Getting Started

### Prerequisites

- [Postman](https://www.postman.com/downloads/) installed on your local machine
- BuildappsWith development server running locally
- Clerk developer account for authentication testing

### Setup

1. Import the collection JSON file into Postman
2. Create an environment in Postman with the following variables:
   - `baseUrl`: Your local development server URL (e.g., `http://localhost:3000`)
   - `clerkToken`: A valid Clerk session token for authentication tests
   - Other required variables as noted in the collection

### Authentication

All API requests require authentication with Clerk. The collection uses a Bearer token authentication method. You can obtain a token from your Clerk developer dashboard or by extracting it from your browser's local storage after logging in to the development server.

To get a token programmatically for testing:

```javascript
// In browser console after logging in
const token = localStorage.getItem('clerk-session');
console.log(token);
```

## Collection Structure

### Authentication Tests
- Tests for authentication endpoints
- Verification of Clerk integration

### Scheduling API
- Tests for booking creation
- Tests for retrieving bookings
- Tests for other scheduling-related endpoints

### Admin API
- Tests for admin-only endpoints
- Requires an account with ADMIN role

### Marketplace API
- Tests for builder profile endpoints
- Tests for marketplace discovery features

## Running Tests

1. Open the collection in Postman
2. Set up your environment variables
3. Run individual requests or use the "Run Collection" feature to execute all tests

## CI/CD Integration

These collections can be run as part of a CI/CD pipeline using Postman's Newman CLI tool. Example command:

```bash
newman run BuildappsWith_API_Tests.json -e environment.json
```

## Adding New Tests

When adding new endpoints to the API, please create corresponding tests in this collection to ensure consistent coverage.

## Troubleshooting

If you encounter authentication issues:
1. Verify your Clerk token is valid and not expired
2. Check that your local server is running and accessible
3. Ensure the user associated with the token has appropriate permissions

## Version

Current version: 1.0.59
