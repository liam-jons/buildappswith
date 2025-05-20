➜  buildappswith git:(feature/auth-cleanup1) ✗ pnpm lint 

> buildappswith@1.0.142 lint /Users/liamj/Documents/development/buildappswith
> next lint


./app/(marketing)/privacy/page.tsx
52:133  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
116:92  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./app/(platform)/community/page.tsx
21:55  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./app/not-found.tsx
7:9  Error: Do not use an `<a>` element to navigate to `/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages

./app/test/public-resources/page.tsx
57:15  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
89:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
93:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./components/auth/auth-error-boundary.tsx
154:6  Warning: React Hook useEffect has missing dependencies: 'getToken' and 'sentryClient'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps

./components/auth/auth-status.tsx
62:13  Error: Do not use an `<a>` element to navigate to `/sign-in/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
66:15  Error: Do not use an `<a>` element to navigate to `/sign-up/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
206:11  Error: Do not use an `<a>` element to navigate to `/sign-in/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
237:11  Error: Do not use an `<a>` element to navigate to `/sign-in/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages

./components/auth/loading-state.tsx
48:6  Warning: React Hook React.useEffect has a missing dependency: 'isLoaded'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/auth/progressive-loading-state.tsx
48:6  Warning: React Hook useEffect has a missing dependency: 'stage'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
58:16  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
77:18  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./components/auth/protected-route.tsx
35:7  Error: React Hook "useHasAllRoles" is called conditionally. React Hooks must be called in the exact same order in every component render.  react-hooks/rules-of-hooks
36:7  Error: React Hook "useHasAnyRole" is called conditionally. React Hooks must be called in the exact same order in every component render.  react-hooks/rules-of-hooks

./components/auth/role-protected.tsx
33:7  Error: React Hook "useHasAllRoles" is called conditionally. React Hooks must be called in the exact same order in every component render.  react-hooks/rules-of-hooks
34:7  Error: React Hook "useHasAnyRole" is called conditionally. React Hooks must be called in the exact same order in every component render.  react-hooks/rules-of-hooks

./components/error-boundaries/global-error-boundary.tsx
98:15  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./components/landing/cta-section.tsx
125:19  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./components/landing/performance-optimizations.tsx
45:37  Warning: The ref value 'imageRef.current' will likely have changed by the time this effect cleanup function runs. If this ref points to a node rendered by React, copy 'imageRef.current' to a variable inside the effect, and use that variable in the cleanup function.  react-hooks/exhaustive-deps
52:7  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
125:32  Warning: The ref value 'ref.current' will likely have changed by the time this effect cleanup function runs. If this ref points to a node rendered by React, copy 'ref.current' to a variable inside the effect, and use that variable in the cleanup function.  react-hooks/exhaustive-deps

./components/landing/skills-carousel.tsx
72:23  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./components/landing/skills-tree-section.tsx
37:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
57:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./components/landing/ui/testimonial-scroll.tsx
37:7  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./components/magicui/particles.tsx
181:6  Warning: React Hook useEffect has missing dependencies: 'animate' and 'initCanvas'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
185:6  Warning: React Hook useEffect has a missing dependency: 'onMouseMove'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
190:6  Warning: React Hook useEffect has a missing dependency: 'initCanvas'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/marketing/marketing-hero.tsx
106:11  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
111:11  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./components/marketing/ui/testimonial-card.tsx
42:7  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./components/marketing/ui/trust-proof-companies.tsx
43:17  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./components/marketplace/components/builder-dashboard/builder-dashboard.tsx
554:22  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
573:22  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./components/platform/viewing-preferences.tsx
95:6  Warning: React Hook useEffect has a missing dependency: 'applyAllPreferences'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/profile/builder-profile.tsx
519:29  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
519:116  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
557:29  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
557:110  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
595:29  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
595:115  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
633:29  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
633:113  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities

./components/profile/client-dashboard.tsx
138:65  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./components/scheduling/calendly/calendly-embed.tsx
230:6  Warning: React Hook useEffect has a missing dependency: 'initCalendly'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/scheduling/calendly/calendly-session-type-list.tsx
83:6  Warning: React Hook useEffect has a missing dependency: 'fetchSessionTypes'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./components/scheduling/client/booking-calendar.tsx
341:26  Error: 'Calendar' is not defined.  react/jsx-no-undef

./components/scheduling/client/booking-flow.tsx
510:24  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./components/scheduling/client/calendly-session-type-selector.tsx
94:43  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
114:43  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
137:41  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./components/trust/trust-overview.tsx
125:84  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./lib/datadog/mocks/node-modules.js
93:1  Warning: Assign object to a variable before exporting as module default  import/no-anonymous-default-export

./lib/learning/utils.ts
78:7  Error: Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
 ELIFECYCLE  Command failed with exit code 1.
