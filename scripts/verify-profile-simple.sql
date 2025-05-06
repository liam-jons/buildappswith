-- Verify Liam's user record
SELECT id, name, email, "clerkId", verified, role
FROM "User" 
WHERE email = 'liam@buildappswith.ai';

-- Verify Liam's builder profile
SELECT id, "userId", bio, headline, "validationTier", slug, tagline, featured, 
       "expertiseAreas" IS NOT NULL as has_expertise_areas,
       "socialLinks" IS NOT NULL as has_social_links
FROM "BuilderProfile"
WHERE "userId" IN (
  SELECT id FROM "User" WHERE email = 'liam@buildappswith.ai'
);

-- Verify Liam's session types
SELECT id, title, description, "durationMinutes", price, currency, "isActive"
FROM "SessionType"
WHERE "builderId" IN (
  SELECT bp.id 
  FROM "BuilderProfile" bp
  JOIN "User" u ON bp."userId" = u.id
  WHERE u.email = 'liam@buildappswith.ai'
);