-- Database Health Check Script
-- This script verifies database connections and performs basic health checks

-- Check connection and transaction capability
BEGIN;

-- Create temporary table for health check
CREATE TEMPORARY TABLE _health_check (
    id SERIAL PRIMARY KEY,
    status TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert test record
INSERT INTO _health_check (status)
VALUES ('ok');

-- Verify record was inserted
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'Database health check passed'
        ELSE 'Database health check failed'
    END AS result
FROM _health_check
WHERE status = 'ok';

-- Check required tables exist
SELECT 
    COUNT(*) AS tables_count,
    CASE 
        WHEN COUNT(*) = 10 THEN 'Required tables exist'
        ELSE 'Missing required tables'
    END AS tables_status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'User',
    'Account',
    'Session',
    'BuilderProfile',
    'ClientProfile',
    'SessionType',
    'Booking',
    'Skill', 
    'BuilderSkill',
    'App'
);

-- Check User table columns
SELECT 
    COUNT(*) AS user_columns_count,
    CASE 
        WHEN COUNT(*) >= 3 THEN 'User table has required columns'
        ELSE 'User table missing required columns'
    END AS user_columns_status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'User'
AND column_name IN ('id', 'email', 'clerkId');

-- Check database settings
SELECT 
    current_setting('server_version') as postgres_version,
    current_setting('max_connections') as max_connections,
    current_setting('TimeZone') as timezone;

-- Drop temporary table
DROP TABLE _health_check;

-- End transaction
COMMIT;