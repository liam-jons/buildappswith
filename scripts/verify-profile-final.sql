-- Verify Liam's profile in production
WITH user_data AS (
  SELECT id, name, email, "clerkId", verified, role
  FROM "User" 
  WHERE email = 'liam@buildappswith.ai'
),
profile_data AS (
  SELECT 
    bp.id, 
    bp."userId", 
    bp.bio, 
    bp.headline, 
    bp."validationTier", 
    bp.slug,
    bp.tagline,
    bp."expertiseAreas",
    bp.featured,
    bp."portfolioItems"
  FROM "BuilderProfile" bp
  JOIN user_data u ON bp."userId" = u.id
),
session_data AS (
  SELECT 
    st.id,
    st.title,
    st.description,
    st."durationMinutes",
    st.price
  FROM "SessionType" st
  JOIN profile_data p ON st."builderId" = p.id
)

SELECT 
  'user' as type, 
  json_build_object(
    'id', u.id,
    'name', u.name,
    'email', u.email,
    'clerkId', u."clerkId",
    'verified', u.verified,
    'role', u.role
  ) as data
FROM user_data u

UNION ALL

SELECT 
  'profile' as type, 
  json_build_object(
    'id', p.id,
    'userId', p."userId",
    'bio', p.bio,
    'headline', p.headline,
    'validationTier', p."validationTier",
    'slug', p.slug,
    'tagline', p.tagline,
    'hasExpertiseAreas', p."expertiseAreas" IS NOT NULL,
    'featured', p.featured,
    'portfolioItemCount', json_array_length(COALESCE(p."portfolioItems"::json, '[]'))
  ) as data
FROM profile_data p

UNION ALL

SELECT 
  'sessions' as type, 
  json_agg(
    json_build_object(
      'id', s.id,
      'title', s.title,
      'durationMinutes', s."durationMinutes",
      'price', s.price
    )
  ) as data
FROM session_data s;