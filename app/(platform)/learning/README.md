# Learning Platform Section

This directory contains the routes and pages related to the learning experience on the Buildappswith platform. It implements the educational component outlined in PRD 3.1, with a focus on practical AI literacy and progressive mastery.

## Directory Structure

```
/learning
├── timeline/            # AI capability timeline pages
│   ├── page.tsx         # Main timeline page
│   └── [category]/      # Category-specific timeline views
├── modules/             # Learning modules and courses
│   ├── page.tsx         # Module listing page
│   └── [id]/            # Specific module content
├── dashboard/           # Learning progress dashboard
│   └── page.tsx         # User learning status and recommendations
└── page.tsx             # Main learning hub page
```

## Key Pages

1. **Learning Hub** (`page.tsx`)
   - Entry point to learning resources
   - Personalized learning recommendations
   - Progress tracking and achievement visualization
   - Access to timeline, modules, and skills tracking

2. **Timeline** (`timeline/page.tsx`)
   - Interactive visualization of AI capabilities
   - Filtering by category, status, and time period
   - Detailed explanations and examples
   - Practical applications of capabilities

3. **Modules** (`modules/page.tsx`)
   - Structured learning experiences
   - Progress tracking and completion status
   - Topic-based organization
   - Difficulty level indicators

4. **Learning Dashboard** (`dashboard/page.tsx`)
   - Personal learning progress visualization
   - Skill development tracking
   - Recommendations based on interests and gaps
   - Achievement showcase

## Implementation Notes

- All pages use server-side rendering for improved SEO and performance
- Learning progress is stored in the database associated with user profiles
- Public access is provided for basic timeline and introductory modules
- Advanced content requires authentication for progress tracking
