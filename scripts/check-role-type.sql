-- Check User role type
SELECT column_name, udt_name
FROM information_schema.columns 
WHERE table_name = 'User' AND column_name = 'role';