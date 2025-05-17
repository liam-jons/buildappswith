➜  buildappswith git:(feature/build-errors) ✗ pnpm build

> buildappswith@1.0.142 build /Users/liamj/Documents/development/buildappswith
> prisma generate && next build

Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.6.0) to ./node_modules/.prisma/client in 49ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Need your database queries to be 1000x faster? Accelerate offers you that and more: https://pris.ly/tip-2-accelerate

   ▲ Next.js 15.3.1
   - Environments: .env.production.local, .env.local, .env.production, .env
   - Experiments (use with caution):
     ✓ scrollRestoration
     · clientTraceMetadata

   Creating an optimized production build ...
[@sentry/nextjs] DEPRECATION WARNING: It is recommended renaming your `sentry.client.config.ts` file, or moving its content to `instrumentation-client.ts`. When using Turbopack `sentry.client.config.ts` will no longer work. Read more about the `instrumentation-client.ts` file: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client

warn - The class `delay-[var(--delay)]` is ambiguous and matches multiple utilities.
warn - If this is content and not a class, replace it with `delay-&lsqb;var(--delay)&rsqb;` to silence this warning.

warn - The class `duration-[var(--transition-length)]` is ambiguous and matches multiple utilities.
warn - If this is content and not a class, replace it with `duration-&lsqb;var(--transition-length)&rsqb;` to silence this warning.
 ✓ Compiled successfully in 29.0s
   Skipping validation of types
   Skipping linting
 ✓ Collecting page data    
Error occurred prerendering page "/community". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of undefined (reading 'map')
    at o (/Users/liamj/Documents/development/buildappswith/.next/server/chunks/7976.js:1:5581)
    at ek (/Users/liamj/Documents/development/buildappswith/node_modules/.pnpm/next@15.3.1_@babel+core@7.26.10_@opentelemetry+api@1.8.0_@playwright+test@1.52.0_react-_3039b744aa7720852471c23854274826/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:17:13337)
    at e (/Users/liamj/Documents/development/buildappswith/node_modules/.pnpm/next@15.3.1_@babel+core@7.26.10_@opentelemetry+api@1.8.0_@playwright+test@1.52.0_react-_3039b744aa7720852471c23854274826/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:17:17246)
    at e$ (/Users/liamj/Documents/development/buildappswith/node_modules/.pnpm/next@15.3.1_@babel+core@7.26.10_@opentelemetry+api@1.8.0_@playwright+test@1.52.0_react-_3039b744aa7720852471c23854274826/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:17:17708)
    at Array.toJSON (/Users/liamj/Documents/development/buildappswith/node_modules/.pnpm/next@15.3.1_@babel+core@7.26.10_@opentelemetry+api@1.8.0_@playwright+test@1.52.0_react-_3039b744aa7720852471c23854274826/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:17:14854)
    at stringify (<anonymous>)
    at eF (/Users/liamj/Documents/development/buildappswith/node_modules/.pnpm/next@15.3.1_@babel+core@7.26.10_@opentelemetry+api@1.8.0_@playwright+test@1.52.0_react-_3039b744aa7720852471c23854274826/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:17:26079)
    at eq (/Users/liamj/Documents/development/buildappswith/node_modules/.pnpm/next@15.3.1_@babel+core@7.26.10_@opentelemetry+api@1.8.0_@playwright+test@1.52.0_react-_3039b744aa7720852471c23854274826/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:17:26391)
    at ez (/Users/liamj/Documents/development/buildappswith/node_modules/.pnpm/next@15.3.1_@babel+core@7.26.10_@opentelemetry+api@1.8.0_@playwright+test@1.52.0_react-_3039b744aa7720852471c23854274826/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:17:26887)
    at /Users/liamj/Documents/development/buildappswith/node_modules/.pnpm/next@15.3.1_@babel+core@7.26.10_@opentelemetry+api@1.8.0_@playwright+test@1.52.0_react-_3039b744aa7720852471c23854274826/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:17:14528
Export encountered an error on /(platform)/community/page: /community, exiting the build.
 ⨯ Next.js build worker exited with code: 1 and signal: null
 ELIFECYCLE  Command failed with exit code 1.
