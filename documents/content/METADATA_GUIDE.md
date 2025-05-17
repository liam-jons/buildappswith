# Metadata Guide for Marketing Pages

This guide explains how to properly use and customize metadata for marketing pages in the BuildAppsWith platform.

## Default Metadata Structure

The platform uses a centralized metadata configuration for all marketing pages, which can be found in:

```
/app/(marketing)/metadata.ts
```

This file defines default metadata values that are applied to all marketing pages, including:

- Page titles and descriptions
- Open Graph metadata for social sharing
- Twitter card metadata
- SEO-related settings
- Viewport configuration
- Icons and theme colors

## Using the Default Metadata

The default metadata is automatically applied to all pages under the `(marketing)` route group. You don't need to do anything special to use it.

## Extending or Overriding Metadata

You can extend or override the default metadata in individual page files:

```typescript
// In a specific marketing page file (e.g., /app/(marketing)/about/page.tsx)
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | BuildAppsWith",
  description: "Learn about our mission to democratize AI development through human connection",
  openGraph: {
    title: "About BuildAppsWith",
    description: "Learn about our mission to democratize AI development",
  }
};
```

## Title Template

The default metadata includes a title template (`%s | BuildAppsWith`), which allows you to set just the page-specific part of the title:

```typescript
export const metadata: Metadata = {
  title: "About Us", // Will be rendered as "About Us | BuildAppsWith"
};
```

## Metadata for Dynamic Routes

For dynamic routes, you can generate metadata dynamically using the `generateMetadata` function:

```typescript
import { Metadata } from "next";

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = params;
  const pageData = await fetchPageData(slug);
  
  return {
    title: pageData.title,
    description: pageData.description,
    openGraph: {
      title: pageData.title,
      description: pageData.description,
      images: pageData.image ? [{ url: pageData.image }] : undefined,
    },
  };
}
```

## Structured Data

For adding structured data (JSON-LD) to improve SEO, you can add a script component in your page:

```tsx
export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "BuildAppsWith",
            url: "https://buildappswith.com",
            logo: "https://buildappswith.com/logo.png",
            // Additional structured data...
          })
        }}
      />
      {/* Page content */}
    </>
  );
}
```

## Best Practices

1. **Page Titles**: Keep titles concise (under 60 characters) and include relevant keywords
2. **Descriptions**: Write compelling descriptions (under 160 characters) that accurately summarize the page content
3. **Images**: Ensure all pages have appropriate Open Graph images (1200×630px recommended)
4. **Customization**: Always customize metadata for key marketing pages rather than relying solely on defaults
5. **Testing**: Use tools like [Open Graph Debugger](https://developers.facebook.com/tools/debug/) and [Twitter Card Validator](https://cards-dev.twitter.com/validator) to verify your metadata

## Metadata Fields Reference

| Field | Purpose | Example |
|-------|---------|---------|
| `title` | Page title shown in browser tabs | "Learn AI Development" |
| `description` | Summary of page content | "Master AI development with our community of experts" |
| `keywords` | Keywords for search engines | ["AI learning", "AI skills"] |
| `openGraph` | Social sharing metadata | Title, description, images for Facebook/LinkedIn |
| `twitter` | Twitter card metadata | Title, description, image for Twitter |
| `robots` | Instructions for search engines | Controls indexing and following behavior |
| `canonical` | Preferred URL for duplicate content | "https://buildappswith.com/about" |
| `viewport` | Mobile display settings | Controls zoom and scaling |
| `icons` | Favicon and app icons | Different sizes and formats |
| `themeColor` | Browser UI color theme | Color values for light/dark modes |

## Additional Resources

- [Next.js Metadata Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org](https://schema.org/) for structured data