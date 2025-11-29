/**
 * Return URL Utility Module
 *
 * Provides secure storage and retrieval of return URLs for post-authentication
 * and post-purchase navigation. Implements security measures to prevent
 * open redirect attacks.
 *
 * Security Features:
 * - Only allows relative URLs starting with "/"
 * - Rejects protocol-relative URLs (//evil.com)
 * - Rejects javascript: and data: URLs
 * - Implements 30-minute expiry for stored URLs
 * - Uses sessionStorage for temporary storage
 */

const STORAGE_KEY = 'waterballsa_return_url';
const EXPIRY_DURATION_MS = 30 * 60 * 1000; // 30 minutes

interface StoredReturnUrl {
  url: string;
  timestamp: number;
}

/**
 * Validates if a URL is safe for redirects
 *
 * Safe URLs must be:
 * - Relative URLs starting with "/"
 * - Not protocol-relative URLs (//evil.com)
 * - Not javascript: or data: URLs
 *
 * @param url - The URL to validate
 * @returns true if the URL is safe, false otherwise
 */
function isSafeURL(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Must start with / to be a relative URL
  if (!url.startsWith('/')) {
    return false;
  }

  // Reject protocol-relative URLs (//evil.com)
  if (url.startsWith('//')) {
    return false;
  }

  // Reject javascript: URLs
  if (url.toLowerCase().includes('javascript:')) {
    return false;
  }

  // Reject data: URLs
  if (url.toLowerCase().includes('data:')) {
    return false;
  }

  // Additional security: reject URLs with multiple slashes at start
  // This prevents edge cases like ///evil.com
  if (url.match(/^\/\/+/)) {
    return false;
  }

  return true;
}

/**
 * Stores a return URL in sessionStorage with timestamp
 *
 * @param url - The URL to store (must be a safe relative URL)
 * @throws Error if the URL is not safe
 */
function store(url: string): void {
  if (!isSafeURL(url)) {
    throw new Error(`Unsafe URL rejected: ${url}`);
  }

  const data: StoredReturnUrl = {
    url,
    timestamp: Date.now(),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // Handle sessionStorage errors (quota exceeded, disabled, etc.)
    console.error('Failed to store return URL:', error);
  }
}

/**
 * Retrieves the stored return URL if it exists and hasn't expired
 *
 * @returns The stored URL if valid and not expired, null otherwise
 */
function get(): string | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const data: StoredReturnUrl = JSON.parse(stored);

    // Check if expired
    const now = Date.now();
    if (now - data.timestamp > EXPIRY_DURATION_MS) {
      // Clean up expired entry
      clear();
      return null;
    }

    // Validate URL before returning (defense in depth)
    if (!isSafeURL(data.url)) {
      // Clean up invalid entry
      clear();
      return null;
    }

    return data.url;
  } catch (error) {
    // Handle JSON parse errors or sessionStorage errors
    console.error('Failed to retrieve return URL:', error);
    clear();
    return null;
  }
}

/**
 * Clears the stored return URL from sessionStorage
 */
function clear(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Handle sessionStorage errors
    console.error('Failed to clear return URL:', error);
  }
}

/**
 * Return URL utility object with all methods
 */
export const returnUrlUtils = {
  store,
  get,
  clear,
  isSafeURL,
};

/**
 * Export individual functions for convenience
 */
export { isSafeURL, store, get, clear };
