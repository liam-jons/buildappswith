# Builder Profile Images

This directory is intended to store locally hosted images for builder profiles in the marketplace.

## Production Best Practices

For a production environment, it's recommended to:

1. **Host images locally** rather than relying on external services like randomuser.me
2. **Use consistent image sizes** (recommended 400x400px, 1:1 aspect ratio) 
3. **Apply consistent image processing** (compression, format conversion, etc.)
4. **Use semantic naming** (e.g., `{builder-id}.jpg` or `{username}.jpg`)

## Expected Image Files

The BuilderImage component expects the following files to eventually exist in this directory:

- `liam-jones.jpg` - Default image for Liam Jones
- Additional builder profile images as needed

## Image Placeholder

Until proper images are added, the BuilderImage component will fall back to displaying the builder's initials in a colored circle.

## Adding New Images

When adding new builder profile images:

1. Use high-quality source images
2. Process them to a standard size (400x400px recommended)
3. Optimize for web (compress without significant quality loss)
4. Name them according to the builder's ID or username
5. Update the URL mapping in the BuilderImage component if needed

## Image Performance

The Next.js Image component (`next/image`) is configured to optimize these images automatically with:

- Responsive size generation
- Modern format conversion (WebP/AVIF)
- Lazy loading
- Client-side caching

No additional optimization should be needed beyond placing appropriate source images in this directory.
