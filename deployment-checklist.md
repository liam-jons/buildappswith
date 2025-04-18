# Buildappswith Deployment Checklist

## Pre-Deployment

- [ ] Update the version number in `package.json`
- [ ] Update the CHANGELOG.md with latest changes
- [ ] Install all dependencies with `pnpm install`
- [ ] Verify Tailwind CSS v3.4.17 is installed (NOT v4)
- [ ] Verify PostCSS configuration is correct for Tailwind CSS v3
- [ ] Run linter with `pnpm lint` and fix any issues
- [ ] Run type checking with `pnpm type-check` and fix any issues
- [ ] Run tests with `pnpm test` and ensure all pass
- [ ] Perform a clean build with `pnpm build:clean`

## Database Preparation

- [ ] Run `pnpm prisma:generate` to update Prisma client
- [ ] Run `pnpm prisma:push` to update database schema
- [ ] Run `pnpm db:sync` to synchronize database
- [ ] Verify database connections and configurations
- [ ] Create database backup before deployment

## Environment Variables

- [ ] Verify all required environment variables are set in Vercel:
  - [ ] `DATABASE_URL`
  - [ ] `NEXTAUTH_URL` 
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
  - [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (if used)
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] Any other service-specific variables

## GitHub Workflow

- [ ] Verify GitHub secrets are configured correctly:
  - [ ] `VERCEL_PROJECT_ID`
  - [ ] `VERCEL_ORG_ID`
  - [ ] `VERCEL_TOKEN`
  - [ ] `DATABASE_URL`

## Deployment

- [ ] Merge final changes to the develop branch
- [ ] Create a release branch (if applicable)
- [ ] Run test build with `./test-build.sh`
- [ ] Deploy to staging environment
- [ ] Perform smoke tests on staging
- [ ] Deploy to production environment
- [ ] Verify deployment on production

## Post-Deployment

- [ ] Monitor application for errors
- [ ] Verify all main functionality is working:
  - [ ] Authentication flows
  - [ ] Builder profiles
  - [ ] Learning hub
  - [ ] Project creation
  - [ ] Client dashboard
- [ ] Check performance metrics
- [ ] Tag the release in Git
- [ ] Update documentation if necessary
- [ ] Notify team of successful deployment

## Rollback Procedure (if needed)

1. Identify the issue requiring rollback
2. Revert to the previous stable version in version control:
   ```bash
   git revert HEAD~1..HEAD
   ```
3. Rebuild and redeploy the previous version
4. Restore database to previous state if necessary
5. Verify the rollback fixed the issue
6. Document the rollback and reasons

## Notes

- Make sure the Magic UI components are rendering correctly
- Pay special attention to accessibility features
- Ensure database synchronization completes successfully
- Verify that all GitHub Actions workflows complete successfully
