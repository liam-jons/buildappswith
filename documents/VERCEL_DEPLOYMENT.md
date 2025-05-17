# Vercel Deployment Guide for Buildappswith

This guide provides comprehensive instructions for setting up and configuring Vercel deployment for the Buildappswith platform.

## Initial Vercel Project Setup

1. **Create a New Vercel Project**
   - Log in to [Vercel](https://vercel.com)
   - Click "Add New" > "Project"
   - Import the GitHub repository for Buildappswith
   - Configure the following settings:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: pnpm run build
     - Output Directory: .next
     - Install Command: pnpm install --frozen-lockfile

2. **Configure Environment Variables**
   - Add the following environment variables in Vercel:
     ```
     NEXT_PUBLIC_APP_URL=https://buildappswith.vercel.app (or your custom domain)
     ```
   - For environment-specific variables, configure them separately for Production and Preview environments

3. **Set Up Custom Domains (For Production)**
   - Navigate to the "Domains" tab in your Vercel project
   - Add your domain (e.g., buildappswith.com)
   - Follow the instructions to verify domain ownership
   - Configure DNS settings as instructed

## GitHub Integration

1. **Generate Vercel Tokens and Secrets**
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Create a new token with scope: `Full Account Access`
   - Copy the token value

2. **Add Secrets to GitHub Repository**
   - Go to your GitHub repository > Settings > Secrets and variables > Actions
   - Add the following secrets:
     - `VERCEL_TOKEN`: [Your Vercel token]
     - `VERCEL_ORG_ID`: [Your Vercel organization ID]
     - `VERCEL_PROJECT_ID`: [Your Vercel project ID]

   To find your Org ID and Project ID:
   - Create a temporary `.vercel` configuration by running:
     ```bash
     vercel link
     ```
   - Then check the generated `.vercel/project.json` file

## Deployment Workflows

Our GitHub Actions workflows include:

1. **Continuous Integration (CI)**
   - Runs on pull requests to `develop` and `main`
   - Performs linting, type checking, and building
   - Runs tests and accessibility checks

2. **Continuous Deployment (CD)**
   - Runs when code is pushed to `develop` or `main`
   - Deploys automatically to Vercel
   - Creates Preview deployments for `develop` branch
   - Creates Production deployments for `main` branch

## Deployment Previews

For each pull request to the `develop` branch, Vercel automatically creates a preview deployment with a unique URL.

Benefits of preview deployments:
- Test changes in an isolated environment
- Share preview URLs with team members for review
- Verify that changes work correctly in a production-like environment

## Production Deployment

Production deployments occur when:
- Code is merged to the `main` branch
- The CD workflow completes successfully

The process:
1. Code is pushed to `main` branch
2. CI workflow validates the code
3. CD workflow deploys to Vercel production environment
4. A comment is added to the commit with the deployment URL

## Vercel Configuration Optimizations

Our `vercel.json` file includes:
- NextJS framework configuration
- Build commands using pnpm
- Security headers for the application
- Caching strategies for static assets
- Rewrite rules for routing
- Environment variables

## Troubleshooting Common Issues

### 1. Deployment Failures
- Check the Vercel deployment logs for specific error messages
- Verify that all environment variables are correctly set
- Ensure the build command completes successfully locally

### 2. Module Resolution Issues
- Check import paths to ensure they match the configured aliases
- Verify that the `tsconfig.json` path aliases match your import statements
- Run the build locally to identify any path resolution issues

### 3. Static Asset References
- Use absolute paths for files in the public directory
- Prefix paths with the appropriate environment variable for dynamic URLs
- Ensure all assets are properly included in the build

### 4. UI Component Import Issues
- Verify that Shadcn/Magic UI components are correctly installed
- Use the proper import syntax with configured path aliases
- Install components individually using the CLI if necessary

## Best Practices

1. **Always test locally before pushing to the repository**
   - Run `pnpm run build` to verify your changes build correctly

2. **Use environment variables for configuration**
   - Avoid hardcoding URLs, API endpoints, or sensitive information

3. **Monitor deployments and performance**
   - Use Vercel Analytics to track performance metrics
   - Set up alerts for deployment failures or performance issues

4. **Keep dependencies up to date**
   - Regularly update dependencies to benefit from security patches and improvements
   - Test thoroughly after dependency updates

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
