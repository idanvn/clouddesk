/**
 * Security Utilities
 *
 * This file contains security-related functions for input validation,
 * sanitization, rate limiting, and secure logging.
 */

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

/**
 * Validates email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const trimmedEmail = email.trim();

  // Check length (RFC 5321)
  if (trimmedEmail.length === 0 || trimmedEmail.length > 254) {
    return false;
  }

  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmedEmail)) {
    return false;
  }

  // Additional validation: check for common typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = trimmedEmail.split('@')[1]?.toLowerCase();

  // Check for common typos like gmail.con, gmial.com
  const typoPatterns = {
    'gmail.con': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
  };

  if (typoPatterns[domain]) {
    return { valid: false, suggestion: typoPatterns[domain] };
  }

  return true;
};

/**
 * Sanitizes email address
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '';
  }
  return email.trim().toLowerCase();
};

// ============================================================================
// URL VALIDATION
// ============================================================================

/**
 * Valid Google domains whitelist
 */
const GOOGLE_DOMAINS = [
  'drive.google.com',
  'docs.google.com',
  'sheets.google.com',
  'slides.google.com',
  'mail.google.com',
  'calendar.google.com',
  'meet.google.com',
  'accounts.google.com',
  'www.googleapis.com',
  'googleapis.com',
];

/**
 * Validates that a URL belongs to a trusted Google domain
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid Google URL
 */
export const isValidGoogleUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);

    // Must be HTTPS
    if (urlObj.protocol !== 'https:') {
      return false;
    }

    // Check if hostname matches any Google domain
    return GOOGLE_DOMAINS.some(domain =>
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
};

/**
 * Validates and sanitizes an email ID for Gmail URL construction
 * @param {string} emailId - Email ID to validate
 * @returns {string|null} - Sanitized email ID or null if invalid
 */
export const sanitizeEmailId = (emailId) => {
  if (!emailId || typeof emailId !== 'string') {
    return null;
  }

  // Gmail IDs should only contain alphanumeric characters
  if (!/^[a-zA-Z0-9]+$/.test(emailId)) {
    return null;
  }

  return encodeURIComponent(emailId);
};

// ============================================================================
// QUERY SANITIZATION
// ============================================================================

/**
 * Sanitizes search query for Google Drive API
 * @param {string} query - Search query to sanitize
 * @returns {string} - Sanitized query
 */
export const sanitizeDriveQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return '';
  }

  let sanitized = query.trim();

  // Limit length to prevent abuse
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }

  // Escape single quotes for Drive API (Drive uses single quotes in queries)
  sanitized = sanitized.replace(/'/g, "\\'");

  // Remove potential SQL-like injection attempts (even though Drive API is safe)
  const dangerousPatterns = [
    /--/g,           // SQL comments
    /\/\*/g,         // Multi-line comments start
    /\*\//g,         // Multi-line comments end
    /;[\s]*drop/gi,  // Drop commands
    /;[\s]*delete/gi // Delete commands
  ];

  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized;
};

/**
 * Valid Gmail search operators
 */
const GMAIL_VALID_OPERATORS = [
  'from:', 'to:', 'cc:', 'bcc:', 'subject:', 'label:',
  'has:', 'is:', 'in:', 'before:', 'after:', 'older:',
  'newer:', 'older_than:', 'newer_than:', 'deliveredto:',
  'category:', 'size:', 'larger:', 'smaller:', 'filename:',
  'list:', 'rfc822msgid:'
];

/**
 * Sanitizes search query for Gmail API with whitelist-based validation
 * @param {string} query - Search query to sanitize
 * @returns {string} - Sanitized query
 */
export const sanitizeGmailQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return '';
  }

  let sanitized = query.trim();

  // Limit length to prevent abuse
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>{}\\]/g, '');

  // Split into tokens and validate each
  const tokens = sanitized.match(/(?:[^\s"]+|"[^"]*")+/g) || [];

  const validatedTokens = tokens.filter(token => {
    const lowerToken = token.toLowerCase();

    // Allow boolean operators
    if (['and', 'or', 'not', '-'].includes(lowerToken)) {
      return true;
    }

    // Allow quoted phrases (search terms)
    if (token.startsWith('"') && token.endsWith('"')) {
      return true;
    }

    // Allow valid Gmail operators
    if (GMAIL_VALID_OPERATORS.some(op => lowerToken.startsWith(op))) {
      return true;
    }

    // Allow plain search terms (alphanumeric, common punctuation)
    if (/^[a-zA-Z0-9@._-]+$/.test(token)) {
      return true;
    }

    return false;
  });

  return validatedTokens.join(' ');
};

/**
 * Sanitizes filename for download
 * @param {string} filename - Filename to sanitize
 * @returns {string} - Safe filename
 */
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return 'download';
  }

  // Remove path traversal attempts
  let sanitized = filename.replace(/[/\\]/g, '');

  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, '');

  // Limit length (most filesystems support 255)
  if (sanitized.length > 255) {
    const extension = sanitized.split('.').pop();
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    sanitized = nameWithoutExt.substring(0, 250) + '.' + extension;
  }

  return sanitized || 'download';
};

/**
 * Validates and sanitizes numeric input
 * @param {number|string} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} defaultValue - Default if invalid
 * @returns {number} - Validated number
 */
export const validateNumericInput = (value, min = 0, max = 9999, defaultValue = 365) => {
  const num = parseInt(value, 10);

  if (isNaN(num)) {
    return defaultValue;
  }

  if (num < min) {
    return min;
  }

  if (num > max) {
    return max;
  }

  return num;
};

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Rate limiter class for API calls
 */
class RateLimiter {
  constructor(maxRequests, timeWindowMs) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
    this.requests = new Map(); // key -> array of timestamps
  }

  /**
   * Check if operation is allowed under rate limit
   * @param {string} key - Unique key for the operation
   * @returns {boolean} - True if allowed
   */
  isAllowed(key) {
    const now = Date.now();
    const requestTimes = this.requests.get(key) || [];

    // Remove old requests outside time window
    const recentRequests = requestTimes.filter(time => now - time < this.timeWindow);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    return true;
  }

  /**
   * Get remaining requests for a key
   * @param {string} key - Operation key
   * @returns {number} - Number of remaining requests
   */
  getRemaining(key) {
    const now = Date.now();
    const requestTimes = this.requests.get(key) || [];
    const recentRequests = requestTimes.filter(time => now - time < this.timeWindow);
    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  /**
   * Get time until next request is allowed
   * @param {string} key - Operation key
   * @returns {number} - Milliseconds until reset
   */
  getTimeUntilReset(key) {
    const requestTimes = this.requests.get(key) || [];
    if (requestTimes.length === 0) {
      return 0;
    }
    const oldestRequest = requestTimes[0];
    const resetTime = oldestRequest + this.timeWindow;
    return Math.max(0, resetTime - Date.now());
  }

  /**
   * Clear all rate limit data
   */
  reset() {
    this.requests.clear();
  }
}

// Create rate limiters for different operations
export const driveRateLimiter = new RateLimiter(10, 1000);  // 10 requests per second
export const gmailRateLimiter = new RateLimiter(5, 1000);   // 5 requests per second
export const bulkOpLimiter = new RateLimiter(3, 60000);     // 3 bulk operations per minute

// ============================================================================
// SECURE LOGGING
// ============================================================================

const isDevelopment = import.meta.env.MODE === 'development';

/**
 * Secure logger that respects environment
 */
export const logger = {
  /**
   * Log debug information (development only)
   */
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },

  /**
   * Log info (development only)
   */
  info: (message, ...args) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  /**
   * Log warning
   */
  warn: (message, ...args) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    } else {
      console.warn(message); // Generic message only
    }
  },

  /**
   * Log error (sanitized in production)
   */
  error: (message, error) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      // Production: Log generic message only, no stack traces
      console.error(message);

      // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
      // if (window.Sentry) {
      //   window.Sentry.captureException(error);
      // }
    }
  }
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Maps API errors to user-friendly messages
 * @param {Error} error - Error object
 * @param {string} context - Context of the error
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyError = (error, context = 'Operation') => {
  // Check for HTTP status codes
  if (error.status || error.code) {
    const status = error.status || error.code;

    const statusMessages = {
      400: 'Invalid request. Please check your input and try again.',
      401: 'Your session has expired. Please sign in again.',
      403: 'You don\'t have permission to perform this action.',
      404: 'The requested item was not found.',
      409: 'This operation conflicts with the current state. Please refresh and try again.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'Google services are experiencing issues. Please try again later.',
      503: 'Service temporarily unavailable. Please try again in a few moments.',
    };

    if (statusMessages[status]) {
      return `${context} failed: ${statusMessages[status]}`;
    }
  }

  // Check for specific error messages
  if (error.message) {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return `${context} failed: Network error. Please check your internet connection.`;
    }

    if (message.includes('quota')) {
      return `${context} failed: API quota exceeded. Please try again later.`;
    }

    if (message.includes('timeout')) {
      return `${context} failed: Request timed out. Please try again.`;
    }

    if (message.includes('permission')) {
      return `${context} failed: Permission denied. Please check your access rights.`;
    }
  }

  // Generic fallback
  return `${context} failed: An unexpected error occurred. Please try again.`;
};

// ============================================================================
// OAUTH CSRF PROTECTION
// ============================================================================

/**
 * Generate a cryptographically secure random state parameter
 * @returns {string} - Random state string
 */
export const generateStateParameter = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Store state parameter in session storage
 * @param {string} state - State parameter
 */
export const storeOAuthState = (state) => {
  try {
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_state_timestamp', Date.now().toString());
  } catch (error) {
    logger.error('Failed to store OAuth state', error);
  }
};

/**
 * Verify state parameter matches stored value
 * @param {string} state - State parameter to verify
 * @returns {boolean} - True if valid
 */
export const verifyOAuthState = (state) => {
  try {
    const storedState = sessionStorage.getItem('oauth_state');
    const timestamp = parseInt(sessionStorage.getItem('oauth_state_timestamp') || '0', 10);

    // State should be used within 10 minutes
    const isExpired = Date.now() - timestamp > 10 * 60 * 1000;

    if (isExpired) {
      logger.warn('OAuth state expired');
      return false;
    }

    if (state !== storedState) {
      logger.error('OAuth state mismatch - possible CSRF attack');
      return false;
    }

    // Clear after verification
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_state_timestamp');

    return true;
  } catch (error) {
    logger.error('Failed to verify OAuth state', error);
    return false;
  }
};

// ============================================================================
// OPERATION LIMITS
// ============================================================================

/**
 * Check if bulk operation size is safe
 * @param {number} itemCount - Number of items
 * @param {number} maxItems - Maximum allowed items
 * @returns {object} - { allowed: boolean, message: string }
 */
export const checkBulkOperationLimit = (itemCount, maxItems = 1000) => {
  if (itemCount === 0) {
    return {
      allowed: false,
      message: 'No items to process.'
    };
  }

  if (itemCount > maxItems) {
    return {
      allowed: false,
      message: `Too many items (${itemCount}). Maximum is ${maxItems} per operation. Please process in smaller batches.`
    };
  }

  if (itemCount > 100) {
    return {
      allowed: true,
      warning: `You are about to process ${itemCount} items. This may take several minutes.`
    };
  }

  return { allowed: true };
};

// ============================================================================
// INPUT LENGTH VALIDATION
// ============================================================================

/**
 * Validate string length
 * @param {string} input - Input to validate
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {object} - { valid: boolean, message?: string }
 */
export const validateLength = (input, maxLength, fieldName = 'Input') => {
  if (!input || typeof input !== 'string') {
    return { valid: false, message: `${fieldName} is required.` };
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { valid: false, message: `${fieldName} cannot be empty.` };
  }

  if (trimmed.length > maxLength) {
    return {
      valid: false,
      message: `${fieldName} is too long. Maximum ${maxLength} characters allowed.`
    };
  }

  return { valid: true };
};

// ============================================================================
// MEMORY CLEANUP
// ============================================================================

/**
 * Clear sensitive data from memory
 * @param {Array} arrays - Arrays to clear
 */
export const clearSensitiveData = (...arrays) => {
  arrays.forEach(arr => {
    if (Array.isArray(arr)) {
      arr.length = 0;
    }
  });
};

// Export all utilities
export default {
  validateEmail,
  sanitizeEmail,
  isValidGoogleUrl,
  sanitizeEmailId,
  sanitizeDriveQuery,
  sanitizeGmailQuery,
  sanitizeFilename,
  validateNumericInput,
  driveRateLimiter,
  gmailRateLimiter,
  bulkOpLimiter,
  logger,
  getUserFriendlyError,
  generateStateParameter,
  storeOAuthState,
  verifyOAuthState,
  checkBulkOperationLimit,
  validateLength,
  clearSensitiveData
};
