workspace "Buildappswith Platform" "Architecture documentation for the Buildappswith platform using the C4 model" {

    !adrs decisions
    !docs documentation

    model {
        // People/Actors
        client = person "Client" "A small business owner or individual seeking to create an AI application"
        learner = person "Learner" "An individual looking to develop AI literacy and application skills"
        builder = person "Builder" "An experienced developer offering AI application development services"
        admin = person "Administrator" "Platform administrator managing the Buildappswith ecosystem"

        // Software Systems
        buildappswith = softwareSystem "Buildappswith Platform" "A platform that democratizes AI application development through marketplace and educational resources" {
            // Containers
            webapplication = container "WebApplication" "Next.js web application serving the Buildappswith platform" "Next.js 15.3.1 + React 19.1.0 + TypeScript"
            database = container "Database" "Stores user data, builder profiles, session information, and learning content" "PostgreSQL + Prisma ORM"
            authenticationservice = container "AuthenticationService" "Handles user authentication and authorization" "Clerk Authentication"
            paymentservice = container "PaymentService" "Processes payments for sessions" "Stripe API"
            bookingsystem = container "BookingSystem" "Manages session scheduling and availability" "Custom calendar integration"

            // Components in WebApplication
            webapplication {
                instrumentation_client = component "instrumentation-client" "Utility"
                instrumentation = component "instrumentation" "Utility"
                middleware = component "middleware" "Middleware"
                next_env_d = component "next-env.d" "Utility"
                sentry_edge_config = component "sentry.edge.config" "Utility"
                sentry_server_config = component "sentry.server.config" "Utility"
                tailwind_config = component "tailwind.config" "Utility"
                vitest_config = component "vitest.config" "Utility"
                vitest_setup = component "vitest.setup" "Utility"
                global_error = component "global-error" "Utility"
                layout = component "layout" "Page Component"
                error_boundary = component "error-boundary" "UI Component"
                search_params_fallback = component "search-params-fallback" "UI Component"
                site_banner = component "site-banner" "UI Component"
                site_footer = component "site-footer" "UI Component"
                site_header = component "site-header" "UI Component"
                suspense_user_auth_form = component "suspense-user-auth-form" "UI Component"
                theme_provider = component "theme-provider" "Context Provider"
                user_auth_form = component "user-auth-form" "UI Component"
                use_on_click_outside = component "use-on-click-outside" "Utility"
                csrf_edge = component "csrf-edge" "Utility"
                csrf = component "csrf" "Utility"
                db = component "db" "Utility"
                json_utilities = component "json-utilities" "Utility"
                logger = component "logger" "Utility"
                prisma_extensions = component "prisma-extensions" "Utility"
                prisma_types = component "prisma-types" "Utility"
                rate_limit = component "rate-limit" "Utility"
                session_types = component "session-types" "Utility"
                utils = component "utils" "Utility"
                create_unused_features_analyzer = component "create-unused-features-analyzer" "Utility"
                extract_architecture = component "extract-architecture" "Utility"
                generate_architecture_report = component "generate-architecture-report" "Utility" tags "Legacy"
                vitest_d = component "vitest.d" "Utility"
                layout = component "layout" "Page Component"
                page = component "page" "Page Component"
                layout = component "layout" "Page Component"
                route_types = component "route-types" "Utility"
                page = component "page" "Page Component"
                layout = component "layout" "Page Component"
                page = component "page" "Page Component"
                layout = component "layout" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                admin_nav = component "admin-nav" "UI Component"
                session_type_form = component "session-type-form" "UI Component"
                faq_accordion = component "faq-accordion" "UI Component"
                contact_form = component "contact-form" "UI Component"
                animated_heading_v2 = component "animated-heading-v2" "UI Component"
                animated_heading = component "animated-heading" "UI Component"
                inline_animated_heading = component "inline-animated-heading" "UI Component"
                two_line_animated_heading = component "two-line-animated-heading" "UI Component"
                ai_capabilities_marquee = component "ai-capabilities-marquee" "UI Component"
                animated_beam_section = component "animated-beam-section" "UI Component"
                animated_circular_progress_bar_demo = component "animated-circular-progress-bar-demo" "UI Component"
                client_section = component "client-section" "UI Component"
                cta_section = component "cta-section" "UI Component"
                final_cta_section = component "final-cta-section" "UI Component"
                hero_section = component "hero-section" "UI Component"
                hero_visualization = component "hero-visualization" "UI Component"
                key_values_section = component "key-values-section" "UI Component"
                pricing_section = component "pricing-section" "UI Component"
                testimonials_section = component "testimonials-section" "UI Component"
                animated_beam = component "animated-beam" "UI Component"
                animated_circular_progress_bar = component "animated-circular-progress-bar" "UI Component"
                aurora_text = component "aurora-text" "UI Component"
                border_beam = component "border-beam" "UI Component"
                marquee = component "marquee" "UI Component"
                particles = component "particles" "UI Component"
                sphere_mask = component "sphere-mask" "UI Component"
                text_shimmer = component "text-shimmer" "UI Component"
                word_rotate = component "word-rotate" "UI Component"
                builder_card = component "builder-card" "UI Component"
                builder_image = component "builder-image" "UI Component"
                featured_builder_card = component "featured-builder-card" "UI Component"
                profile_edit_page = component "profile-edit-page" "UI Component"
                add_project_form = component "add-project-form" "UI Component"
                app_showcase = component "app-showcase" "UI Component"
                builder_profile_client_wrapper = component "builder-profile-client-wrapper" "UI Component"
                builder_profile_client = component "builder-profile-client" "UI Component"
                builder_profile = component "builder-profile" "UI Component"
                edit_profile_form = component "edit-profile-form" "UI Component"
                portfolio_gallery = component "portfolio-gallery" "UI Component"
                portfolio_showcase = component "portfolio-showcase" "UI Component"
                profile_interactive_elements = component "profile-interactive-elements" "UI Component"
                role_badges = component "role-badges" "Context Provider"
                success_metrics_dashboard = component "success-metrics-dashboard" "Context Provider"
                validation_tier_badge = component "validation-tier-badge" "Context Provider"
                clerk_provider = component "clerk-provider" "Context Provider"
                providers = component "providers" "Context Provider"
                accordion = component "accordion" "UI Component"
                alert = component "alert" "UI Component"
                avatar = component "avatar" "UI Component"
                badge = component "badge" "UI Component"
                button = component "button" "UI Component"
                card = component "card" "UI Component"
                checkbox = component "checkbox" "UI Component"
                collapsible = component "collapsible" "UI Component"
                dialog = component "dialog" "UI Component"
                dropdown_menu = component "dropdown-menu" "UI Component"
                form = component "form" "Context Provider"
                input = component "input" "UI Component"
                label = component "label" "UI Component"
                loading_spinner = component "loading-spinner" "UI Component"
                popover = component "popover" "UI Component"
                radio_group = component "radio-group" "Context Provider"
                select = component "select" "UI Component"
                separator = component "separator" "UI Component"
                sheet = component "sheet" "UI Component"
                skeleton = component "skeleton" "UI Component"
                sonner = component "sonner" "UI Component"
                switch = component "switch" "UI Component"
                table = component "table" "UI Component"
                tabs = component "tabs" "UI Component"
                textarea = component "textarea" "UI Component"
                tooltip = component "tooltip" "Context Provider"
                mock_test = component "mock-test" "Middleware"
                typed_mock_test = component "typed-mock-test" "Middleware"
                builders = component "builders" "Utility"
                scheduling = component "scheduling" "Service"
                profile = component "profile" "Utility"
                profile_context = component "profile-context" "Utility"
                index = component "index" "Utility"
                app_service = component "app-service" "Service"
                builders = component "builders" "Utility"
                data_service = component "data-service" "Service"
                types = component "types" "Utility"
                api_protection = component "api-protection" "Middleware"
                error_handling = component "error-handling" "Middleware"
                index = component "index" "Middleware"
                performance = component "performance" "Middleware"
                profiles = component "profiles" "Utility"
                mock_data = component "mock-data" "Utility"
                types = component "types" "Utility"
                utils = component "utils" "Utility"
                builder_profile_service = component "builder-profile-service" "Service"
                builder_service = component "builder-service" "Service"
                mock_data = component "mock-data" "Utility"
                builder = component "builder" "Utility"
                profile_form_helpers = component "profile-form-helpers" "Utility"
                create_dummy_profiles = component "create-dummy-profiles" "Utility"
                create_profiles = component "create-profiles" "Utility"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                profile = component "profile" "Utility"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                layout = component "layout" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                layout = component "layout" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                layout = component "layout" "Page Component"
                page = component "page" "Page Component"
                layout = component "layout" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                page = component "page" "Page Component"
                client = component "client" "Utility"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                availability_manager = component "availability-manager" "UI Component"
                session_type_editor = component "session-type-editor" "UI Component"
                timezone_selector = component "timezone-selector" "UI Component"
                marketplace_service = component "marketplace-service" "Utility"
                scheduling_service = component "scheduling-service" "Utility"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                BuilderProfileClient = component "BuilderProfileClient" "Service"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                page = component "page" "Page Component"
                availability_exceptions = component "availability-exceptions" "UI Component"
                availability_management = component "availability-management" "UI Component"
                weekly_availability = component "weekly-availability" "UI Component"
                metrics_display = component "metrics-display" "UI Component"
                portfolio_gallery = component "portfolio-gallery" "UI Component"
                validation_tier = component "validation-tier" "Context Provider"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
            }

            // Components in Database
            database {
                schema = component "schema" "Data Model"
                User = component "User" "Data Model"
                Account = component "Account" "Data Model"
                Session = component "Session" "Data Model"
                VerificationToken = component "VerificationToken" "Data Model"
                BuilderProfile = component "BuilderProfile" "Data Model"
                ClientProfile = component "ClientProfile" "Data Model"
                App = component "App" "Data Model"
                Skill = component "Skill" "Data Model"
                BuilderSkill = component "BuilderSkill" "Data Model"
                SkillResource = component "SkillResource" "Data Model"
                Project = component "Project" "Data Model"
                ProjectMilestone = component "ProjectMilestone" "Data Model"
                Booking = component "Booking" "Data Model"
                SessionType = component "SessionType" "Data Model"
                AvailabilityRule = component "AvailabilityRule" "Data Model"
                AvailabilityException = component "AvailabilityException" "Data Model"
                ExceptionTimeSlot = component "ExceptionTimeSlot" "Data Model"
                AICapability = component "AICapability" "Data Model"
                CapabilityExample = component "CapabilityExample" "Data Model"
                CapabilityLimitation = component "CapabilityLimitation" "Data Model"
                CapabilityRequirement = component "CapabilityRequirement" "Data Model"
            }

            // Components in AuthenticationService
            authenticationservice {
                auth_utils = component "auth-utils" "Authentication Component"
                architecture_utils = component "architecture-utils" "Authentication Component" tags "Technical Debt"
                extract_auth_architecture = component "extract-auth-architecture" "Authentication Component" tags "Legacy"
                auth_error_boundary = component "auth-error-boundary" "UI Component"
                auth_provider = component "auth-provider" "Context Provider"
                clerk_auth_form = component "clerk-auth-form" "UI Component"
                loading_state = component "loading-state" "UI Component"
                login_button = component "login-button" "UI Component"
                protected_route = component "protected-route" "UI Component"
                user_profile = component "user-profile" "UI Component"
                factory_test_solution = component "factory-test-solution" "Authentication Component"
                improved_integration_test = component "improved-integration-test" "Authentication Component"
                improved_solution = component "improved-solution" "Authentication Component"
                improved_test_utils = component "improved-test-utils" "Authentication Component"
                nextjs_mock_solution = component "nextjs-mock-solution" "Authentication Component"
                auth_config = component "auth-config" "Authentication Component"
                auth_utils = component "auth-utils" "Authentication Component"
                clerk_hooks = component "clerk-hooks" "Authentication Component"
                clerk_middleware = component "clerk-middleware" "Authentication Component"
                data_access = component "data-access" "Authentication Component"
                hooks = component "hooks" "Authentication Component"
                index = component "index" "Authentication Component" tags "Legacy"
                types = component "types" "Authentication Component"
                config = component "config" "Authentication Component"
                factory = component "factory" "Authentication Component"
                logging = component "logging" "Authentication Component"
                rbac = component "rbac" "Authentication Component"
                test_utils = component "test-utils" "Authentication Component"
                validation = component "validation" "Authentication Component"
                page = component "page" "Page Component"
                protected_route = component "protected-route" "UI Component"
                api_auth = component "api-auth" "Authentication Component"
                helpers = component "helpers" "Authentication Component"
                auth_provider = component "auth-provider" "Authentication Component"
                route = component "route" "API Endpoint"
            }

            // Components in PaymentService
            paymentservice {
                payment_status_indicator = component "payment-status-indicator" "Context Provider"
                payment_status_page = component "payment-status-page" "UI Component"
                index = component "index" "Service"
                stripe_client = component "stripe-client" "Service"
                stripe_server = component "stripe-server" "Utility" tags "Technical Debt"
                page = component "page" "Page Component"
                page = component "page" "Page Component"
                payment_success_content = component "payment-success-content" "Utility"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
                route = component "route" "API Endpoint"
            }

            // Components in BookingSystem
            bookingsystem {
                booking_overview = component "booking-overview" "UI Component"
                weekly_schedule = component "weekly-schedule" "UI Component"
                booking_form = component "booking-form" "UI Component"
                builder_calendar = component "builder-calendar" "UI Component"
                route = component "route" "API Endpoint"
                client = component "client" "Utility"
                page = component "page" "Page Component"
                route = component "route" "API Endpoint"
                availability_manager_client = component "availability-manager-client" "Utility"
                client = component "client" "Utility"
                page = component "page" "Page Component"
            }

            // Relationships between components
            middleware -> index "Uses"
            db -> logger "Uses"
            json_utilities -> prisma_types "Uses"
            prisma_extensions -> prisma_types "Uses"
            session_types -> types "Uses"
            create_unused_features_analyzer -> architecture_utils "Uses"
            extract_architecture -> architecture_utils "Uses"
            extract_auth_architecture -> architecture_utils "Uses"
            hero_section -> animated_circular_progress_bar_demo "Uses"
            payment_status_page -> payment_status_indicator "Uses"
            add_project_form -> portfolio_showcase "Uses"
            builder_profile -> validation_tier_badge "Uses"
            builder_profile -> portfolio_showcase "Uses"
            builder_profile -> app_showcase "Uses"
            builder_profile -> success_metrics_dashboard "Uses"
            builder_profile -> role_badges "Uses"
            edit_profile_form -> builder_profile "Uses"
            portfolio_gallery -> validation_tier_badge "Uses"
            portfolio_gallery -> portfolio_showcase "Uses"
            success_metrics_dashboard -> validation_tier_badge "Uses"
            clerk_provider -> loading_state "Uses"
            providers -> clerk_provider "Uses"
            providers -> auth_error_boundary "Uses"
            factory_test_solution -> factory "Uses"
            factory_test_solution -> config "Uses"
            factory_test_solution -> api_protection "Uses"
            factory_test_solution -> test_utils "Uses"
            improved_integration_test -> index "Uses"
            improved_integration_test -> test_utils "Uses"
            builders -> builder "Uses"
            scheduling -> types "Uses"
            scheduling -> mock_data "Uses"
            clerk_hooks -> types "Uses"
            profile -> session_types "Uses"
            data_service -> types "Uses"
            api_protection -> csrf "Uses"
            api_protection -> rate_limit "Uses"
            api_protection -> config "Uses"
            factory -> config "Uses"
            factory -> api_protection "Uses"
            factory -> validation "Uses"
            factory -> performance "Uses"
            factory -> error_handling "Uses"
            factory -> logging "Uses"
            factory -> rbac "Uses"
            rbac -> error_handling "Uses"
            rbac -> logging "Uses"
            validation -> config "Uses"
            mock_data -> types "Uses"
            utils -> types "Uses"
            index -> stripe_server "Uses"
            stripe_server -> logger "Uses"
            create_profiles -> db "Uses"
            create_profiles -> types "Uses"
            page -> client "Uses"
            page -> BuilderProfileClient "Uses"
            page -> payment_success_content "Uses"
            availability_manager -> weekly_schedule "Uses"
            availability_manager -> session_type_editor "Uses"
            availability_manager -> timezone_selector "Uses"
            builder_calendar -> timezone_selector "Uses"
            api_auth -> helpers "Uses"
            scheduling_service -> types "Uses"
            availability_management -> weekly_availability "Uses"
            availability_management -> availability_exceptions "Uses"

            // Relationships between containers
            webapplication -> database "Reads from and writes to" "SQL/TCP"
            webapplication -> authenticationservice "Authenticates users via" "JSON/HTTP"
            webapplication -> paymentservice "Processes payments via" "JSON/HTTP"
            webapplication -> bookingsystem "Manages bookings via" "JSON/HTTP"
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

        component webapplication "WebApplication" {
            include *
            autoLayout
        }

        component database "Database" {
            include *
            autoLayout
        }

        component authenticationservice "AuthenticationService" {
            include *
            autoLayout
        }

        component paymentservice "PaymentService" {
            include *
            autoLayout
        }

        component bookingsystem "BookingSystem" {
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
            element "Technical Debt" {
                background #ff9800
                color #ffffff
            }
            element "Legacy" {
                background #f44336
                color #ffffff
            }
        }
    }
}