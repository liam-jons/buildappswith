/**
 * Image helper utilities for marketplace components
 */

/**
 * Validates if a string is a valid image URL
 */
export function isValidImageUrl(url?: string | null): boolean {
  if (!url) return false;
  
  // Check for local path
  if (url.startsWith('/')) return true;
  
  // Check for remote URL
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gets the fallback text (initials) from a name
 */
export function getInitials(text: string): string {
  if (!text) return '';
  
  // For single names, return the first letter
  if (!text.includes(' ')) {
    return text.charAt(0).toUpperCase();
  }
  
  // For multiple names, get first letter of first and last name
  const nameParts = text.split(' ').filter(Boolean);
  
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }
  
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];
  
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
}

/**
 * Gets a default avatar URL if the provided URL is invalid
 */
export function getDefaultAvatarUrl(url?: string | null): string {
  if (isValidImageUrl(url)) {
    return url as string;
  }
  
  return '/images/default-avatar.svg';
}