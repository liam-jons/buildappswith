# UK English Style Guide

**Version:** 1.0  
**Last Updated:** May 3, 2025  

## Overview

This document establishes the UK English (en-GB) standards for all user-facing content on the Buildappswith platform. We have adopted Oxford spelling as our standard.

## Spelling Standards

### Oxford Spelling
- Use Oxford spelling (also known as Oxford English Dictionary spelling)
- Examples: organise (not organize), colour (not color), realise (not realize)

### Key Differences from US English

#### Common Spellings
| UK English (Oxford) | US English |
|---------------------|------------|
| colour              | color      |
| flavour             | flavor     |
| behaviour           | behavior   |
| centre              | center     |
| metre               | meter      |
| programme           | program    |
| grey                | gray       |
| defence             | defense    |
| analyse             | analyze    |
| organise            | organize   |
| realise             | realize    |
| specialise          | specialize |
| catalogue           | catalog    |
| capitalise          | capitalize |

#### Technical Terms
- When referring to software programs, use "program"
- When referring to schedules or courses, use "programme"

## Grammar and Style

### Punctuation
- Use single quotation marks for primary quotes: 'example'
- Use double quotation marks for nested quotes: 'example with "nested quote"'
- Place punctuation outside quotation marks unless it's part of the quoted text

### Date Format
- DD/MM/YYYY (e.g., 03/05/2025)
- Use ordinal indicators: 3rd May 2025 (not 3rd May 2025)

### Time Format
- 24-hour clock for digital displays: 14:30
- 12-hour clock with am/pm for text: 2:30 pm

### Currency
- Use £ for British Pound Sterling
- Use proper formatting: £1,234.56

## Platform-Specific Terms

### Authentication and User Accounts
- Use "Sign in" (not "Login")
- Use "Sign out" (not "Logout")
- Use "Sign up" for registration

### Builder/Client Relationship
- "Builder" - Someone who creates applications
- "Client" - Someone who requests applications
- "Session" - Time booked with a builder
- "Booking" - The act of reserving a session

### AI and Technology Terms
- "AI" (use full form "Artificial Intelligence" on first reference)
- "App" or "Application" (not "program" in this context)
- "Platform" (for Buildappswith itself)
- "Marketplace" (for the builder discovery system)

## Code vs. Content Language

### Code
- Use US English for code variables, functions, and comments
- Example: `const colorScheme = '#FF0000';` (not `const colourScheme`)

### Comments in Code
- Use UK English for comments explaining functionality
- Example: `// Organise the validation tiers by priority`

### Documentation for Developers
- Use UK English for developer-facing documentation
- Exception: Use US English for API endpoint names

## Accessibility Considerations

### Screen Reader Text
- Use UK spelling for all alt text and ARIA labels
- Ensure consistency between visible and screen reader text

### Form Labels and Instructions
- Use UK English for all form interactions
- Example: "Postcode" (not "ZIP code")

## Editorial Guidelines

### Tone and Voice
- Professional, approachable, down to earth
- Avoid jargon where possible
- Explain technical terms on first use

### Gender-Neutral Language
- Use "they/them" as singular pronouns when gender is unknown
- Avoid gendered terms: "workforce" (not "manpower")

### Inclusive Language
- Use "AI builder" or "developer" instead of "AI guy/girl"
- Use "community" instead of "guys" when addressing groups

## Implementation Notes

### Automated Tools
For ensuring consistency:
- VS Code plugin: "Code Spell Checker" with UK English dictionary
- ESLint plugin for style consistency
- Automated spell checking in CI/CD pipeline

### Content Management
- All CMS content must follow these guidelines
- Regular audits of user-facing strings
- Style guide reference in contributor documentation

## Exceptions

### Brand Names
- Preserve original spelling for all brand names
- Example: "Google" (not "Gooogle")

### Technical Terms
- Use industry-standard spelling for technical terms
- Example: "JavaScript" (not "JavaScrypt")

### External Content
- Quotes from US sources retain original spelling
- External API responses may use US spelling

## Review Process

1. All content changes must be reviewed against this guide
2. Use grammar checking tools set to UK English
3. Final review by content team before publication

This style guide will be updated as needed to address new edge cases and maintain consistency across the platform.
