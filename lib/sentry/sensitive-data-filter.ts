/**
 * Sensitive data filtering configuration for Sentry
 * Implements comprehensive PII protection while preserving debugging context
 * @version 1.0.0
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Data types that should be filtered
 */
enum SensitiveDataType {
  // Identity information
  EMAIL = 'email',
  PHONE = 'phone',
  NAME = 'name',
  ADDRESS = 'address',

  // Authentication data
  PASSWORD = 'password',
  TOKEN = 'token',
  COOKIE = 'cookie',
  SESSION = 'session',

  // Financial information
  CREDIT_CARD = 'creditCard',
  BANK_ACCOUNT = 'bankAccount',
  PAYMENT_DETAILS = 'paymentDetails',

  // Personal identifiers
  SSN = 'ssn',
  PASSPORT = 'passport',
  LICENSE = 'license',

  // Location data
  GEOLOCATION = 'geolocation',
  IP_ADDRESS = 'ipAddress',
}

/**
 * Patterns to identify common PII
 */
const sensitiveDataPatterns = {
  [SensitiveDataType.EMAIL]: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  [SensitiveDataType.PHONE]: /(\+\d{1,3}[\s.-])?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
  [SensitiveDataType.CREDIT_CARD]: /\b(?:\d{4}[ -]?){3}(?:\d{4})\b/g,
  [SensitiveDataType.SSN]: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g,
  [SensitiveDataType.IP_ADDRESS]: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
};

/**
 * Specific field names that should be filtered regardless of value
 */
const sensitiveFieldNames = {
  [SensitiveDataType.PASSWORD]: ['password', 'passwd', 'pwd', 'secret', 'credential'],
  [SensitiveDataType.TOKEN]: ['token', 'auth', 'jwt', 'apiKey', 'api_key', 'access_token', 'refresh_token'],
  [SensitiveDataType.NAME]: ['firstName', 'first_name', 'lastName', 'last_name', 'fullName', 'full_name'],
  [SensitiveDataType.ADDRESS]: ['address', 'street', 'city', 'zipCode', 'zip_code', 'postalCode', 'postal_code'],
  [SensitiveDataType.SESSION]: ['sessionId', 'session_id', 'sessionToken', 'session_token'],
  [SensitiveDataType.PAYMENT_DETAILS]: ['ccNumber', 'cc_number', 'cvv', 'cvc', 'expiryDate', 'expiry_date'],
  [SensitiveDataType.GEOLOCATION]: ['lat', 'latitude', 'lng', 'longitude', 'geo', 'location'],
};

/**
 * Filter sensitive data from an error event
 * @param event Sentry event to filter
 */
function filterSensitiveData(event: Sentry.Event): Sentry.Event {
  try {
    // Clone the event to avoid modifying the original
    const filteredEvent = { ...event };

    // Filter request data if present
    if (filteredEvent.request) {
      filteredEvent.request = filterSensitiveObjectData(filteredEvent.request);
    }

    // Filter user data if present
    if (filteredEvent.user) {
      filteredEvent.user = filterSensitiveUserData(filteredEvent.user);
    }

    // Filter tags if present
    if (filteredEvent.tags) {
      filteredEvent.tags = filterSensitiveObjectData(filteredEvent.tags);
    }

    // Filter contexts if present
    if (filteredEvent.contexts) {
      Object.keys(filteredEvent.contexts).forEach(key => {
        if (typeof filteredEvent.contexts[key] === 'object') {
          filteredEvent.contexts[key] = filterSensitiveObjectData(filteredEvent.contexts[key]);
        }
      });
    }

    // Filter breadcrumbs if present
    if (filteredEvent.breadcrumbs) {
      filteredEvent.breadcrumbs = filteredEvent.breadcrumbs.map(breadcrumb => {
        // Filter data in breadcrumbs
        if (breadcrumb.data) {
          breadcrumb.data = filterSensitiveObjectData(breadcrumb.data);
        }

        // Filter sensitive data in breadcrumb messages
        if (breadcrumb.message) {
          breadcrumb.message = filterSensitiveTextData(breadcrumb.message);
        }

        return breadcrumb;
      });
    }

    return filteredEvent;
  } catch (error) {
    // If something goes wrong during filtering, return the original event
    console.error('Error filtering sensitive data:', error);
    return event;
  }
}

/**
 * Filter sensitive data from a user object
 * @param userData User data object
 */
function filterSensitiveUserData(userData: any): any {
  if (!userData || typeof userData !== 'object') {
    return userData;
  }

  const filteredUser = { ...userData };

  // Always filter email (keep first 3 chars + domain)
  if (typeof filteredUser.email === 'string') {
    filteredUser.email = maskEmail(filteredUser.email);
  }

  // Always filter ip_address
  if (typeof filteredUser.ip_address === 'string') {
    filteredUser.ip_address = maskIpAddress(filteredUser.ip_address);
  }

  // Filter other user fields
  return filterSensitiveObjectData(filteredUser);
}

/**
 * Filter sensitive data from an object recursively
 * @param obj Object to filter
 */
function filterSensitiveObjectData(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // Don't try to filter non-plain objects
  if (obj instanceof Date || Array.isArray(obj)) {
    return obj;
  }

  const filteredObj = { ...obj };

  // Process each key in the object
  Object.keys(filteredObj).forEach(key => {
    const value = filteredObj[key];

    // Check if key matches any sensitive field names
    if (isSensitiveFieldName(key)) {
      filteredObj[key] = '[FILTERED]';
    }
    // Check if string value contains sensitive patterns
    else if (typeof value === 'string' && containsSensitivePattern(value)) {
      filteredObj[key] = filterSensitiveTextData(value);
    }
    // Recursively filter nested objects
    else if (value && typeof value === 'object') {
      filteredObj[key] = filterSensitiveObjectData(value);
    }
  });

  return filteredObj;
}

/**
 * Filter sensitive data from a text string
 * @param text Text to filter
 */
function filterSensitiveTextData(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let filteredText = text;

  // Apply all sensitive data patterns
  Object.entries(sensitiveDataPatterns).forEach(([type, pattern]) => {
    filteredText = filteredText.replace(pattern, match => {
      switch (type) {
        case SensitiveDataType.EMAIL:
          return maskEmail(match);
        case SensitiveDataType.CREDIT_CARD:
          return maskCreditCard(match);
        case SensitiveDataType.PHONE:
          return maskPhone(match);
        case SensitiveDataType.IP_ADDRESS:
          return maskIpAddress(match);
        default:
          return '[FILTERED]';
      }
    });
  });

  return filteredText;
}

/**
 * Check if a field name is sensitive
 * @param fieldName Field name to check
 */
function isSensitiveFieldName(fieldName: string): boolean {
  fieldName = fieldName.toLowerCase();
  
  return Object.values(sensitiveFieldNames).some(fields => 
    fields.some(field => fieldName === field.toLowerCase() || 
      fieldName.includes(field.toLowerCase()))
  );
}

/**
 * Check if text contains any sensitive data patterns
 * @param text Text to check
 */
function containsSensitivePattern(text: string): boolean {
  return Object.values(sensitiveDataPatterns).some(pattern => 
    pattern.test(text)
  );
}

/**
 * Mask an email address (keep domain and first 3 chars)
 * @param email Email to mask
 */
function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '[FILTERED_EMAIL]';
  
  const localPart = parts[0];
  const domain = parts[1];
  
  if (localPart.length <= 3) {
    return `${localPart}@${domain}`;
  }
  
  return `${localPart.substring(0, 3)}***@${domain}`;
}

/**
 * Mask a credit card number (keep last 4 digits)
 * @param ccNum Credit card number to mask
 */
function maskCreditCard(ccNum: string): string {
  // Remove any spaces or dashes
  const cleanCC = ccNum.replace(/[ -]/g, '');
  if (cleanCC.length < 4) return '[FILTERED_CC]';
  
  const lastFour = cleanCC.slice(-4);
  return `****-****-****-${lastFour}`;
}

/**
 * Mask a phone number (keep last 4 digits)
 * @param phone Phone number to mask
 */
function maskPhone(phone: string): string {
  // Extract digits
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '[FILTERED_PHONE]';
  
  const lastFour = digits.slice(-4);
  return `***-***-${lastFour}`;
}

/**
 * Mask an IP address (keep first octet)
 * @param ip IP address to mask
 */
function maskIpAddress(ip: string): string {
  const octets = ip.split('.');
  if (octets.length !== 4) return '[FILTERED_IP]';
  
  return `${octets[0]}.***.***.**`;
}

/**
 * Configure Sentry with sensitive data filtering
 * @param sentryInstance Sentry instance to configure
 */
export function configureSentryDataFiltering(sentryConfig: any = {}) {
  return {
    ...sentryConfig,
    
    // Process error events before sending to Sentry
    beforeSend: (event: Sentry.Event): Sentry.Event | null => {
      // Skip processing in local development if needed
      if (process.env.NODE_ENV === 'development' && process.env.SENTRY_FILTER_LOCAL !== 'true') {
        return event;
      }

      // Apply filtering
      return filterSensitiveData(event);
    },

    // Process breadcrumbs to filter sensitive data
    beforeBreadcrumb: (breadcrumb: Sentry.Breadcrumb): Sentry.Breadcrumb | null => {
      // Skip specific breadcrumb types where filtering isn't needed
      if (breadcrumb.category === 'ui.click' || breadcrumb.category === 'navigation') {
        return breadcrumb;
      }

      // Filter data in breadcrumb
      if (breadcrumb.data) {
        breadcrumb.data = filterSensitiveObjectData(breadcrumb.data);
      }

      // Filter messages that might contain PII
      if (breadcrumb.message) {
        breadcrumb.message = filterSensitiveTextData(breadcrumb.message);
      }

      return breadcrumb;
    },
  };
}

export default configureSentryDataFiltering;