
-- Mark all existing migrations as applied
INSERT INTO "_prisma_migrations" (
  id,
  checksum,
  finished_at,
  migration_name,
  logs,
  rolled_back_at,
  started_at,
  applied_steps_count
)
SELECT 
  md5(random()::text || clock_timestamp()::text)::uuid,
  md5(pg_read_file(path))::varchar(64),
  now(),
  migration_name,
  NULL,
  NULL,
  now(),
  1
FROM (
  SELECT 
    unnest(string_to_array('20250417110231_db_setup,20250417151731_sync_schema,20250420104035_add_social_links,20250423141509_add_session_types,20250423152730_add_multi_role_and_app_showcase', ',')) as migration_name,
    'prisma/migrations/' || unnest(string_to_array('20250417110231_db_setup,20250417151731_sync_schema,20250420104035_add_social_links,20250423141509_add_session_types,20250423152730_add_multi_role_and_app_showcase', ',')) || '/migration.sql' as path
) subquery
WHERE NOT EXISTS (
  SELECT 1 FROM "_prisma_migrations" WHERE migration_name = subquery.migration_name
);