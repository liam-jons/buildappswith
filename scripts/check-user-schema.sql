-- Check User table schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'User'
ORDER BY column_name;