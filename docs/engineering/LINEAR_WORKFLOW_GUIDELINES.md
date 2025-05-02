## Workflow Guidelines

### Session Transitions

#### Planning → Implementation
- All architecture decisions must be documented
- Linear issues must be created for all tasks
- Each issue must have clear acceptance criteria
- Implementation cannot begin until issues are properly defined
- Human user must approve the plan before transition
- Update issue states from "Backlog" to "Todo" for the initial implementation tasks

#### Implementation → Review
- At least some issues must be in "In Progress" or "Done" state
- Basic functionality must be working
- Tests must be implemented for completed features
- Implementation details must be documented in Linear
- Human user must confirm readiness for review

#### Review → Planning (Next Component)
- All relevant issues must be updated to reflect current status
- Implementation must be documented
- Next steps must be clearly identified
- Any new issues discovered during review must be created
- Human user must approve transition to next component
- New component planning should begin with a new parent issue

### Within-Session Guidelines

#### Planning Session
- Begin by understanding the component requirements through PRD
- Create a Linear project if one doesn't exist for the component
- Create a parent issue for the component and child issues for tasks
- Document all design decisions as comments on relevant issues
- Create visual aids where appropriate and link in issue descriptions
- Use Linear labels to categorize issues appropriately
- Establish clear acceptance criteria for each issue

#### Implementation Session
- Always check the current status of relevant issues before starting
- Implement one issue at a time, focusing on highest priority
- Update issue status from "Todo" to "In Progress" when starting work
- Document challenges and implementation decisions as comments
- Create new issues for discovered sub-tasks or bugs
- Update issue status to "In Review" when ready for verification
- Reference issue IDs in code comments for traceability

#### Review Session
- Retrieve all relevant issues using appropriate queries
- Verify implementation against issue acceptance criteria
- Document test results as comments on issues
- Update issue status to "Done" for completed and verified tasks
- Create new issues for identified improvements
- Generate a summary report of component status
- Prepare transition plan for next session

## Special Cases and Techniques

### Handling Failed Chat Sessions
- Use Linear as the source of truth to recover context
- Check issue status to determine progress
- Review issue comments for recent updates
- Use the recovery template to resume work
- Document the recovery process in issue comments

### Cross-Component Dependencies
- Use Linear issue relationships to track dependencies
- Create explicit dependency links between issues
- Document dependency requirements in issue descriptions
- Track blocked issues with appropriate status and comments

### Documentation Updates
- Maintain in-code documentation alongside Linear
- Update README files to reflect current component status
- Keep architecture documents in sync with implementation
- Document significant decisions both in code comments and Linear

## Using Linear Effectively

### Key Linear Commands

```
linear_getViewer             - Get current user information
linear_getOrganization       - Get organization details
linear_getTeams              - List available teams
linear_getProjects           - List existing projects
linear_createProject         - Create a new project
linear_getWorkflowStates     - Get workflow states for a team
linear_getLabels             - Get available labels
linear_createIssue           - Create a new issue
linear_updateIssue           - Update an existing issue
linear_getIssueById          - Get details for a specific issue
linear_searchIssues          - Search for issues with filters
linear_createComment         - Add a comment to an issue
linear_addIssueLabel         - Add a label to an issue
```

### Issue Naming Conventions
- Use clear, action-oriented titles (e.g., "Implement user authentication flow")
- Include component name in issue title for clarity
- Follow the pattern: "[Action] [Component/Feature]"

### Issue Description Structure
```
## Objective
[Clear statement of what this issue accomplishes]

## Acceptance Criteria
- [ ] [Specific, testable criterion 1]
- [ ] [Specific, testable criterion 2]
- [ ] [Specific, testable criterion 3]

## Implementation Notes
[Key information for implementation]

## Related Issues
- [Issue ID 1]
- [Issue ID 2]

## References
- [Link to relevant documentation]
```

### Status Tracking
- **Backlog**: Issues identified but not yet ready to work on
- **Todo**: Fully specified and ready for implementation
- **In Progress**: Currently being implemented
- **In Review**: Implementation complete, awaiting verification
- **Done**: Fully implemented and verified
- **Canceled**: No longer needed or superseded by other work

## Important Notes

- Always check Linear for the current status before starting work
- Use issue IDs in all documentation and communication
- Document decisions as comments on relevant issues
- Update issue status promptly to reflect current progress
- Create new issues for discovered work rather than extending scope
- Reference existing issues rather than duplicating information
- Prioritize clear documentation over complex technical details
- When in doubt, verify the current state in Linear before proceeding