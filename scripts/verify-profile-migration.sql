-- Verification query to check if migration was successful
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'BuilderProfile'
AND column_name IN ('slug', 'tagline', 'displayName', 'expertiseAreas', 'featured', 'searchable', 'availability', 'topSkills', 'clerkUserId')
ORDER BY column_name;

-- Check if indexes were created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'BuilderProfile'
AND indexname IN ('BuilderProfile_featured_idx', 'BuilderProfile_searchable_idx', 'BuilderProfile_availability_idx', 'BuilderProfile_validationTier_idx')
ORDER BY indexname;

-- Check Liam's profile data
SELECT 
  bp.id, 
  bp."displayName", 
  bp.slug, 
  bp."adhd_focus", 
  bp.featured, 
  bp."validationTier", 
  bp."expertiseAreas" IS NOT NULL as has_expertise_areas,
  u.name as user_name,
  u.email as user_email,
  u."clerkId" as clerk_id
FROM "BuilderProfile" bp
JOIN "User" u ON bp."userId" = u.id
WHERE u."clerkId" = 'user_2wiigzHyOhaAl4PPIhkKyT2yAkx';