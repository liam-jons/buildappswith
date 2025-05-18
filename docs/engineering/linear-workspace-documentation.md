# Buildappswith Linear Workspace Organization

## 1. Overview

This document outlines the structure and organization of the Buildappswith Linear workspace, which serves as the project management system for the platform's development. The workspace is organized to align with PRD 3.1's implementation roadmap and supports the Session-based workflow (Planning, Implementation, Review).

## 2. Cycles

Cycles are time-boxed development periods that align with the phases outlined in PRD 3.1 Section 6 (Implementation Roadmap).

### 2.1 Current Cycles

| Cycle | Number | Dates | Focus | PRD Alignment |
|-------|--------|-------|-------|---------------|
| **Foundation** | 1 | April 30 - June 2, 2025 | Establishing core platform functionality and initial market presence | Phase 1 (Section 6.2) |
| **Expansion** | 2 | June 3 - June 24, 2025 | Building on foundation with enhanced functionality and community growth | Phase 2 (Section 6.3) |
| **Optimisation** | 3 | July 17 - July 18, 2025 | Refining platform based on user feedback and performance data | Phase 3 (Section 6.4) |
| **Cycle 4** | 4 | July 18 - July 25, 2025 | Not yet specified | Future development |

### 2.2 Cycle Usage Guidelines

- Assign issues to the appropriate cycle based on implementation timeline
- Issues without a specific timeline can remain unassigned to a cycle
- Cycles should be reviewed at completion to ensure all issues are properly resolved
- New cycles should be created as development progresses to Phase 4 and beyond

## 3. Label System

The workspace uses a comprehensive set of labels to categorize issues effectively.

### 3.1 Type Labels

| Label | Color | Usage |
|-------|-------|-------|
| **type:** | #4cb782 (Green) | Parent label for type categorization |
| **feature** | #BB87FC (Purple) | New functionality being added to the platform |
| **improvement** | #4EA7FC (Blue) | Improvements to existing functionality |
| **bug** | #EB5757 (Red) | Issues with existing functionality that need correction |

### 3.2 Priority Labels

| Label | Color | Usage |
|-------|-------|-------|
| **priority:** | #eb5757 (Red) | Parent label for priority categorization |
| **P0** | #eb5757 (Red) | Critical priority - blockers that prevent core functionality |
| **P1** | #eb5757 (Red) | High priority - important issues on the critical path |
| **P2** | #eb5757 (Red) | Medium priority - standard priority issues |
| **P3** | #eb5757 (Red) | Low priority - issues that can be addressed if time permits |

### 3.3 Phase Labels

| Label | Color | Usage |
|-------|-------|-------|
| **phase:** | #f2c94c (Yellow) | Parent label for phase categorization |
| **foundation** | #f2c94c (Yellow) | Issues in the Foundation phase |
| **expansion** | #f2c94c (Yellow) | Issues in the Expansion phase |
| **optimisation** | #f2c94c (Yellow) | Issues in the Optimization phase |

### 3.4 Complexity Labels

| Label | Color | Usage |
|-------|-------|-------|
| **complexity:** | #26b5ce (Teal) | Parent label for complexity categorization |
| **simple** | #26b5ce (Teal) | Simple issues requiring minimal effort |
| **moderate** | #26b5ce (Teal) | Moderately complex issues |
| **complex** | #26b5ce (Teal) | Issues with significant complexity |
| **very-complex** | #26b5ce (Teal) | Highly complex issues requiring significant effort |

### 3.5 Domain Labels

| Label | Color | Usage |
|-------|-------|-------|
| **domain:** | #5e6ad2 (Blue) | Parent label for domain categorization |
| **profile** | #5e6ad2 (Blue) | Profile management functionality |
| **booking** | #5e6ad2 (Blue) | Session booking and calendar functionality |
| **payment** | #5e6ad2 (Blue) | Payment processing and integration |
| **trust** | #5e6ad2 (Blue) | Trust architecture and validation components |
| **learning** | #5e6ad2 (Blue) | Educational content and learning experiences |
| **community** | #5e6ad2 (Blue) | Community engagement and knowledge sharing |
| **marketplace** | #5e6ad2 (Blue) | Marketplace functionality |
| **integration** | #5e6ad2 (Blue) | Integration with external systems |

### 3.6 Status Labels

| Label | Color | Usage |
|-------|-------|-------|
| **status:** | #f7c8c1 (Light Red) | Parent label for status categorization |
| **blocked** | #f7c8c1 (Light Red) | Issues that cannot proceed due to dependencies |
| **needs-review** | #f7c8c1 (Light Red) | Issues that require review before proceeding |
| **ready-for-implementation** | #f7c8c1 (Light Red) | Issues that are fully specified and ready to be implemented |

## 4. Workflow States

Workflow states track the progress of issues through the development lifecycle.

### 4.1 Standard Workflow States

| State | Type | Position | Color | Description |
|-------|------|----------|-------|-------------|
| **Backlog** | backlog | 0 | #bec2c8 (Gray) | Issues identified but not yet ready for work |
| **Todo** | unstarted | 1 | #e2e2e2 (Light Gray) | Fully specified and ready for implementation |
| **In Progress** | started | 2 | #f2c94c (Yellow) | Currently being implemented |
| **In Review** | started | 1002 | #0f783c (Green) | Pull request is being reviewed |
| **Done** | completed | 3 | #5e6ad2 (Blue) | Fully implemented and verified |
| **Canceled** | canceled | 4 | #95a2b3 (Gray) | No longer needed |
| **Duplicate** | canceled | 5 | #95a2b3 (Gray) | Duplicate of another issue |

### 4.2 State Transition Requirements

#### Backlog → Todo
- Issue must have clear description and acceptance criteria
- Dependencies must be identified
- Implementation approach must be outlined

#### Todo → In Progress
- Implementation session must be active
- Resources must be available
- Any blocking issues must be resolved

#### In Progress → In Review
- Implementation must be complete
- Basic testing must be performed
- Documentation must be updated

#### In Review → Done
- All acceptance criteria must be verified
- Review comments must be addressed
- Final documentation must be complete

## 5. Projects

The workspace includes projects to organize issues around major platform components and initiatives.

### 5.1 Current Projects

| Project | State | Description | PRD Alignment |
|---------|-------|-------------|---------------|
| **MVP Revenue Foundation** | Started | The revenue-generating core of the MVP, focused on establishing Liam Jons' profile as the foundation for marketplace growth | PRD 3.1 Core Components |
| **Transparent Trust Architecture** | Started | Implementation of the simplified trust architecture focusing on concrete outcomes and transparent verification | Section 3.1 |
| **Learning Experience Design** | Started | Implementation of the learning experience focused on practical application, critical thinking, and adaptability | Section 3.2 |
| **Marketplace Interaction Model** | Started | Implementation of the marketplace model emphasizing quality matching and transparent collaboration | Section 3.3 |
| **Community Engagement System** | Started | Implementation of the community system for knowledge sharing, collaborative problem-solving, and collective growth | Section 3.4 |
| **Integration Framework** | Backlog | Enabling seamless connection with third-party platforms and services, creating a cohesive ecosystem while minimizing development complexity | Section 3.5 |
| **Linear Onboarding** | Backlog | Linear workspace setup and onboarding tasks | N/A |

### 5.2 Project Usage Guidelines

- Group related issues under appropriate projects
- Create new projects for major platform components
- Align project creation with PRD 3.1 core components
- Use projects to track progress on specific initiatives

## 6. Issue Templates

Issue templates provide consistent structure for different types of work. Templates are created using Linear's native template feature.

### 6.1 Current Templates

The workspace includes the following templates:

1. **Bug Description Template**
2. **Feature Implementation Template**
3. **Architecture Document Template**

### 6.2 Template Usage Guidelines

- Use the appropriate template for each issue type
- Ensure all required fields are completed
- Maintain consistent documentation standards
- Include Traditional Timeline and Actual Timeline fields to track development efficiency

## 7. Session-Based Workflow

The workspace supports a session-based workflow with three distinct session types:

### 7.1 Planning Session

- Focus on designing architecture, creating specifications, and establishing success criteria
- Create issues with appropriate templates, labels, and project assignments
- Break down work into manageable tasks with clear acceptance criteria
- Document decisions and dependencies

### 7.2 Implementation Session

- Focus on coding the designed component according to specifications
- Update issue status as work progresses
- Document implementation details and challenges
- Create subtasks for any discovered work items

### 7.3 Review Session

- Focus on testing, documentation, and verification
- Confirm that implementation meets acceptance criteria
- Document test results and any issues discovered
- Plan next steps for refinement or improvement

## 8. Working with Linear

### 8.1 Issue Creation Best Practices

- Use the appropriate template for the issue type
- Assign relevant labels (phase, domain, priority, complexity)
- Include clear acceptance criteria
- Estimate traditional timeline for comparison purposes
- Add the issue to the appropriate project and cycle

### 8.2 Issue Management

- Update issue status as work progresses
- Record actual implementation time after completion
- Link related issues to maintain context
- Document key decisions as comments
- Add appropriate labels when status changes (e.g., blocked, needs-review)

### 8.3 Referencing Linear Issues

- Always reference Linear issues by their ID (e.g., BUI-123)
- Include issue references in code comments for traceability
- Document relationships between issues in Linear comments
- Use Linear issues as the source of truth for task status

## 9. References

- PRD 3.1 Implementation Roadmap (Section 6)
- LINEAR_WORKFLOW_GUIDELINES.md
- BUI-40 "Linear Workspace Organization Enhancement"
- BUI-67 "Linear Workspace Organization Documentation"

**Note**: This document supersedes all other Linear-specific documentation. If there are any discrepancies between this document and other Linear documentation, this document should be considered the authoritative source of truth.