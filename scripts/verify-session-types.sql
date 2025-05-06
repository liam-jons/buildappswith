-- Check session types for Liam's profile
SELECT 
  st.id,
  st.title,
  st.description,
  st."durationMinutes",
  st.price,
  st.currency,
  st."isActive",
  st.color,
  bp."displayName" as builder_name,
  u.email as builder_email
FROM "SessionType" st
JOIN "BuilderProfile" bp ON st."builderId" = bp.id
JOIN "User" u ON bp."userId" = u.id
WHERE u."clerkId" = 'user_2wiigzHyOhaAl4PPIhkKyT2yAkx';