# Session Continuity Template

Use this template at the beginning of each development session to maintain continuity.

```
# Buildappswith Session: [DATE]

## Project Status

**Current Phase:** [PHASE] - [BRIEF DESCRIPTION]

**Version:** [VERSION]

**Repository:** /Users/liamj/Documents/Development/buildappswith

## Focus Component

Today we're focusing on **[COMPONENT NAME]** which is currently in **[STATUS]** state.

### Component Description
[BRIEF DESCRIPTION OF THE COMPONENT'S PURPOSE AND FUNCTIONALITY]

### Recent Progress
- [ITEM 1]
- [ITEM 2]
- [ITEM 3]

### Goals for This Session
- [ ] [GOAL 1]
- [ ] [GOAL 2]
- [ ] [GOAL 3]

### Key Requirements
- [REQUIREMENT 1]
- [REQUIREMENT 2]
- [REQUIREMENT 3]

## Reference Information

### Related Components
- [RELATED COMPONENT 1] - [STATUS]
- [RELATED COMPONENT 2] - [STATUS]

### Relevant Decisions
- [DECISION ID] - [BRIEF DESCRIPTION]

### Accessibility Requirements
- [SPECIFIC ACCESSIBILITY CONSIDERATIONS]

## Current Implementation Challenges

[DESCRIBE ANY CURRENT CHALLENGES OR QUESTIONS THAT NEED TO BE ADDRESSED]

## Next Up After This Component

[BRIEFLY DESCRIBE WHAT SHOULD BE TACKLED NEXT]
```

## Example

```
# Buildappswith Session: April 22, 2025

## Project Status

**Current Phase:** Phase 1 (Foundation) - MVP development

**Version:** 0.1.1

**Repository:** /Users/liamj/Documents/Development/buildappswith

## Focus Component

Today we're focusing on **Builder Profile Creation** which is currently in **Planning** state.

### Component Description
The Builder Profile Creation system allows AI developers to create comprehensive profiles showcasing their expertise, validation tier, and portfolio. It forms the foundation of the marketplace validation system.

### Recent Progress
- Completed landing page implementation
- Set up project documentation
- Created initial component wireframes

### Goals for This Session
- [ ] Implement basic profile creation form
- [ ] Create profile display component
- [ ] Set up profile storage schema

### Key Requirements
- Must support all three validation tiers
- Portfolio section for project showcases
- Integration with scheduling systems for free sessions
- Accessibility for all user abilities

## Reference Information

### Related Components
- Validation System - Not Started
- Portfolio Gallery - Not Started
- Scheduling Integration - Not Started

### Relevant Decisions
- DES-004 - "Race to top" validation visualization
- FEAT-001 - Tiered builder validation system
- FEAT-005 - Free educational sessions for unemployed

### Accessibility Requirements
- Form validation must be screen reader compatible
- All interactive elements must support keyboard navigation
- Color contrast must meet WCAG AA standards

## Current Implementation Challenges

Determining the best way to integrate with external scheduling tools without adding significant complexity to the initial MVP.

## Next Up After This Component

After completing the Builder Profile Creation, we'll implement the basic Project Creation system for clients to define their requirements.
```
