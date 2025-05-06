-- Find all enum types in the database
SELECT n.nspname as schema, 
       t.typname as type,
       e.enumlabel as value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
ORDER BY schema, type, e.enumsortorder;