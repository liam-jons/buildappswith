workspace "Buildappswith Platform" "Architecture documentation for the Buildappswith platform using the C4 model" {

    !adrs docs/architecture/decisions
    !docs docs/architecture/documentation

    model {
        // People/Actors
        client = person "Client" "A small business owner or individual seeking to create an AI application"
        learner = person "Learner" "An individual looking to develop AI literacy and application skills"
        builder = person "Builder" "An experienced developer offering AI application development services"
        admin = person "Administrator" "Platform administrator managing the Buildappswith ecosystem"

        // Software Systems
        buildappswith = softwareSystem "Buildappswith Platform" "A platform that democratizes AI application development through marketplace and educational resources" {
            // Containers
            singlePageApplication = container "Single Page Application" "Provides all platform functionality to users via their web browser" "Next.js, React, TypeScript" "Web Browser"
            apiApplication = container "API Application" "Provides platform functionality via JSON/HTTP API" "Next.js API Routes" "API"
            database = container "Database" "Stores user data, project information, learning resources, and platform content" "PostgreSQL" "Database"
            
            // External integrations
            authProvider = container "Authentication Provider" "Handles user authentication and authorization" "NextAuth.js (to be migrated to Clerk)" "External Service"
            paymentProcessor = container "Payment Processor" "Processes payments for builder services" "Stripe" "External Service"
            contentDelivery = container "Content Delivery Network" "Delivers static assets and optimizes content delivery" "Vercel Edge Network" "External Service"
            
            // Components
            // Frontend Components
            singlePageApplication -> apiApplication "Makes API calls to" "JSON/HTTP"
            singlePageApplication -> authProvider "Authenticates users via" "JSON/HTTP"
            singlePageApplication -> contentDelivery "Loads assets from" "HTTPS"
            
            // API Components
            apiApplication -> database "Reads from and writes to" "SQL/TCP"
            apiApplication -> authProvider "Verifies authentication via" "JSON/HTTP"
            apiApplication -> paymentProcessor "Processes payments via" "JSON/HTTP"
        }

        // External Systems
        aiTools = softwareSystem "External AI Tools" "Third-party AI tools and platforms recommended by Buildappswith" "External System"
        email = softwareSystem "Email System" "System for sending emails to users" "External System"

        // Relationships between people and systems
        client -> buildappswith "Uses to commission AI applications"
        learner -> buildappswith "Uses to learn AI application development"
        builder -> buildappswith "Uses to offer services and showcase expertise"
        admin -> buildappswith "Manages and monitors"
        
        buildappswith -> aiTools "Recommends and integrates with"
        buildappswith -> email "Sends emails via"
    }

    views {
        systemContext buildappswith "SystemContext" {
            include *
            autoLayout
        }

        container buildappswith "Containers" {
            include *
            autoLayout
        }

        theme default
        
        styles {
            element "Person" {
                shape Person
                background #08427B
                color #ffffff
            }
            element "Web Browser" {
                shape WebBrowser
            }
            element "Database" {
                shape Cylinder
            }
            element "External Service" {
                background #999999
            }
            element "External System" {
                background #999999
            }
        }
    }
}
