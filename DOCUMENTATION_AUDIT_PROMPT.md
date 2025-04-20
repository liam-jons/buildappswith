# Documentation Audit Session Prompt

Use this prompt to start your next session focused on comprehensive documentation audit and alignment with PRD 2.0.

## Session Context

You're continuing work on the Buildappswith project, which has just been successfully deployed to production. The immediate next phase focuses on ensuring all documentation accurately reflects the current codebase and aligns with PRD 2.0, not the original PRD.

## Primary Session Objectives

1. **Documentation Audit**: Review all existing documentation files for accuracy against the current codebase
2. **PRD 2.0 Alignment**: Ensure all documentation matches PRD 2.0 specifications, not the original PRD
3. **Code-to-Doc Verification**: Verify each documented feature exists in the current codebase
4. **Create Missing Documentation**: Generate documentation for any undocumented features
5. **Remove Outdated Documentation**: Flag and plan removal of any documentation that doesn't match actual implementation

## Current Project State

- Successfully deployed to production
- Using Neon PostgreSQL for database (development: Buildappswith-dev, production: Buildappswith-prod)
- Environment variable updated from DATABASE_URL to PRODUCTION_DATABASE_URL
- MCP server OAuth issue: Receiving "invalid redirect uri" error (non-blocking)
- Using Next.js 15.3.1 with Prisma 6.6.0
- Build process now includes Prisma generation step

## Files to Audit

1. **Core Documentation Files**:
   - `Buildappswith: Product Requirements Document 2.0.docx`
   - `README.md`
   - `CHANGELOG.md`
   - `DEPLOYMENT.md`
   - `LAUNCH_CHECKLIST.md`
   - `COMPONENT_STATUS.md`
   - `SESSION_TEMPLATE.md`
   - `DECISIONS.md`
   - `NEXT_UPDATE_GUIDE.md`

2. **Configuration Files**:
   - `deployment-checklist.md`
   - `env.production.template`
   - All `.env` example files

3. **Technical Documentation**:
   - `docs/` directory contents
   - `SCRIPTS_DOCUMENTATION.md`
   - Any TypeScript type definition files with documentation

## Specific Audit Tasks

1. **Implementation Verification**:
   - Verify each feature documented in PRD 2.0 exists in the codebase
   - Check all API endpoints match documentation
   - Validate database schema matches documentation
   - Confirm authentication flows are as documented

2. **Code Review**:
   - Scan actual implementation for undocumented features
   - Review component structure against documented architecture
   - Verify all environment variables are documented
   - Check if all scripts are properly documented

3. **Update Documentation**:
   - Remove references to features that were planned but not implemented
   - Add documentation for new features added during development
   - Update technical specifications to match actual implementation
   - Ensure all examples and code snippets are current

4. **Archive Management**:
   - Move outdated documentation to appropriate archive files
   - Ensure ARCHIVE files are not updated with new content
   - Create new documentation files where needed

## Request Format

When starting the session, present this context and add:

"I need to conduct a comprehensive documentation audit to ensure all documentation accurately reflects the current codebase and aligns with PRD 2.0. The focus is on:

1. Verifying every documented feature exists in the code
2. Adding documentation for any undocumented features
3. Removing or updating documentation that doesn't match implementation
4. Ensuring all documentation aligns with PRD 2.0, not the original PRD

Please begin by analyzing the main documentation files and create a systematic plan for this audit. For each file, I need:
- Features documented but not implemented
- Features implemented but not documented
- Documentation that needs updates
- Documentation that should be removed

Let's start with the PRD 2.0 and README.md files, then proceed through the rest systematically."

## Important Notes

- All documentation should reflect PRD 2.0 vision, not the original PRD
- Focus is on accuracy and alignment with the actual codebase
- Avoid updating archived documentation files
- Maintain technical accuracy over aspirational features
- Document actual implementation, not planned features

## Expected Deliverables

1. Documentation Audit Report highlighting all discrepancies
2. Updated documentation files reflecting actual implementation
3. List of obsolete documentation to be archived or removed
4. New documentation for any undocumented features
5. Final verification that all documentation aligns with PRD 2.0
