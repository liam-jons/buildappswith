#!/bin/bash

# Clear Next.js cache
rm -rf .next

# Run build to update the redirects
pnpm build

# Start the development server
pnpm dev