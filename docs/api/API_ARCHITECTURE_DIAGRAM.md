# API Architecture Diagram

*Version: 1.0.141*

This document provides a visual representation of the Buildappswith API architecture using Mermaid diagrams. These diagrams illustrate the relationships between different API domains, authentication flow, and request/response patterns.

## API Domain Overview

The following diagram illustrates the organization of the Buildappswith API by domain and their relationships:

```mermaid
flowchart TB
    Client([Client Application])
    
    subgraph API["Buildappswith API"]
        Admin["Admin API<br>/api/admin/*"]
        Apps["Apps API<br>/api/apps/*"]
        Marketplace["Marketplace API<br>/api/marketplace/*"]
        Scheduling["Scheduling API<br>/api/scheduling/*"]
        Stripe["Stripe API<br>/api/stripe/*"]
        Webhooks["Webhooks API<br>/api/webhooks/*"]
        Test["Test API<br>/api/test/*"]
    end
    
    subgraph External["External Services"]
        ClerkAuth["Clerk Authentication"]
        StripePayment["Stripe Payment"]
        CalendarService["Calendar Integration"]
    end
    
    subgraph Database["Database Layer"]
        Users[("Users")]
        BuilderProfiles[("Builder Profiles")]
        SessionTypes[("Session Types")]
        Bookings[("Bookings")]
        Availability[("Availability")]
        Apps_DB[("Apps")]
        Payments[("Payments")]
    end
    
    % Client connections
    Client -- "Authentication" --> ClerkAuth
    Client -- "API Requests" --> API
    
    % API to Database
    Admin --> Users
    Admin --> BuilderProfiles
    Admin --> SessionTypes
    
    Apps --> Apps_DB
    Apps --> BuilderProfiles
    
    Marketplace --> BuilderProfiles
    Marketplace --> Users
    
    Scheduling --> Bookings
    Scheduling --> SessionTypes
    Scheduling --> Availability
    Scheduling --> BuilderProfiles
    
    Stripe --> Payments
    Stripe --> Bookings
    
    % External integrations
    Webhooks <--> ClerkAuth
    Webhooks <--> StripePayment
    Webhooks <--> CalendarService
    
    Stripe <--> StripePayment
    
    % Authentication flow
    ClerkAuth -- "Session Validation" --> API
    
    % Test API connections
    Test -.-> Users
    
    % Relationships between APIs
    Scheduling -- "Builder Validation" --> Marketplace
    Stripe -- "Booking References" --> Scheduling
    
    class Client primary
    class API secondary
    class External tertiary
    class Database quaternary
    
    classDef primary fill:#f9a825,stroke:#f57f17,stroke-width:2px,color:#000
    classDef secondary fill:#1e88e5,stroke:#0d47a1,stroke-width:2px,color:#fff
    classDef tertiary fill:#43a047,stroke:#2e7d32,stroke-width:2px,color:#fff
    classDef quaternary fill:#5e35b1,stroke:#4527a0,stroke-width:2px,color:#fff
```

## Authentication Flow

The following diagram illustrates the authentication flow for the Buildappswith API:

```mermaid
sequenceDiagram
    participant Client
    participant NextMiddleware as Next.js Middleware
    participant ClerkAuth as Clerk Authentication
    participant APIRoute as API Route Handler
    participant Database
    
    Client->>NextMiddleware: Request with Auth Token
    NextMiddleware->>ClerkAuth: Validate Token
    
    alt Invalid Token
        ClerkAuth-->>NextMiddleware: Authentication Failed
        NextMiddleware-->>Client: 401 Unauthorized
    else Valid Token
        ClerkAuth-->>NextMiddleware: User Session
        NextMiddleware->>NextMiddleware: Extract User Data & Roles
        
        alt Insufficient Permissions
            NextMiddleware-->>Client: 403 Forbidden
        else Sufficient Permissions
            NextMiddleware->>APIRoute: Forward Request with User Context
            APIRoute->>Database: Database Operations
            Database-->>APIRoute: Operation Results
            APIRoute-->>Client: API Response
        end
    end
```

## Request/Response Flow

The following diagram illustrates the typical request/response flow for API endpoints:

```mermaid
flowchart LR
    subgraph Client["Client Application"]
        Request["API Request"]
        Response["API Response"]
    end
    
    subgraph API["API Processing"]
        Auth["Authentication<br>Middleware"]
        Validation["Input<br>Validation"]
        BusinessLogic["Business<br>Logic"]
        ErrorHandling["Error<br>Handling"]
        ResponseFormatter["Response<br>Formatter"]
    end
    
    subgraph Services["Services Layer"]
        DBOperations["Database<br>Operations"]
        ExternalAPIs["External<br>API Calls"]
        Utilities["Utility<br>Functions"]
    end
    
    Request --> Auth
    
    Auth --> Validation
    Auth -- "Auth Error" --> ErrorHandling
    
    Validation --> BusinessLogic
    Validation -- "Validation Error" --> ErrorHandling
    
    BusinessLogic --> DBOperations
    BusinessLogic --> ExternalAPIs
    BusinessLogic --> Utilities
    BusinessLogic --> ResponseFormatter
    BusinessLogic -- "Logic Error" --> ErrorHandling
    
    DBOperations -- "DB Error" --> ErrorHandling
    ExternalAPIs -- "API Error" --> ErrorHandling
    Utilities -- "Utility Error" --> ErrorHandling
    
    ErrorHandling --> ResponseFormatter
    ResponseFormatter --> Response
    
    classDef client fill:#f9a825,stroke:#f57f17,stroke-width:2px,color:#000
    classDef api fill:#1e88e5,stroke:#0d47a1,stroke-width:2px,color:#fff
    classDef services fill:#43a047,stroke:#2e7d32,stroke-width:2px,color:#fff
    
    class Client client
    class API api
    class Services services
```

## Integration with External Services

The following diagram illustrates how the Buildappswith API integrates with external services:

```mermaid
flowchart LR
    subgraph API["Buildappswith API"]
        Stripe["Stripe API"]
        Webhooks["Webhooks API"]
        Scheduling["Scheduling API"]
        Auth["Authentication<br>Middleware"]
    end
    
    subgraph ExternalServices["External Services"]
        StripeAPI["Stripe Payment<br>Processing"]
        ClerkAPI["Clerk Authentication<br>& User Management"]
        Calendar["Calendar<br>Integration"]
    end
    
    Stripe <--> StripeAPI
    Webhooks <--> StripeAPI
    Webhooks <--> ClerkAPI
    Webhooks <--> Calendar
    Auth <--> ClerkAPI
    Scheduling <--> Calendar
    
    classDef api fill:#1e88e5,stroke:#0d47a1,stroke-width:2px,color:#fff
    classDef external fill:#43a047,stroke:#2e7d32,stroke-width:2px,color:#fff
    
    class API api
    class ExternalServices external
```

## Role-Based Access Control

The following diagram illustrates the role-based access control for different API domains:

```mermaid
flowchart TD
    subgraph Roles["User Roles"]
        Public["Public<br>No Authentication"]
        Client["Client Role"]
        Builder["Builder Role"]
        Admin["Admin Role"]
    end
    
    subgraph APIAccess["API Domain Access"]
        AdminAPI["Admin API"]
        AppsAPI["Apps API"]
        MarketplaceAPI["Marketplace API"]
        SchedulingAPI["Scheduling API"]
        StripeAPI["Stripe API"]
        WebhooksAPI["Webhooks API"]
        TestAPI["Test API"]
    end
    
    Public --> MarketplaceAPI
    Public -.-> AppsAPI
    
    Client --> SchedulingAPI
    Client --> StripeAPI
    
    Builder --> AppsAPI
    Builder --> SchedulingAPI
    
    Admin --> AdminAPI
    Admin --> AppsAPI
    Admin --> MarketplaceAPI
    Admin --> SchedulingAPI
    Admin --> TestAPI
    
    classDef roles fill:#5e35b1,stroke:#4527a0,stroke-width:2px,color:#fff
    classDef api fill:#1e88e5,stroke:#0d47a1,stroke-width:2px,color:#fff
    
    class Roles roles
    class APIAccess api
```

These diagrams provide a visual representation of the Buildappswith API architecture to help developers understand the system's structure and interactions.
