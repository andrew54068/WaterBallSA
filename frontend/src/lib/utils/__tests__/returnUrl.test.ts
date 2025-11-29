/**
 * Unit tests for returnUrl utility module
 *
 * Tests cover:
 * - Store/get/clear operations
 * - URL expiry after 30 minutes
 * - URL validation (safe/unsafe URLs)
 * - Edge cases and error handling
 */

import { returnUrlUtils, isSafeURL, store, get, clear } from '../returnUrl';

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('returnUrl utility', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    mockSessionStorage.clear();
    jest.clearAllMocks();
  });

  describe('isSafeURL', () => {
    it('should return true for valid relative URLs', () => {
      expect(isSafeURL('/lessons/123')).toBe(true);
      expect(isSafeURL('/curriculums/456')).toBe(true);
      expect(isSafeURL('/about')).toBe(true);
      expect(isSafeURL('/profile/settings')).toBe(true);
      expect(isSafeURL('/lessons/123?param=value')).toBe(true);
      expect(isSafeURL('/lessons/123#section')).toBe(true);
    });

    it('should return false for protocol-relative URLs', () => {
      expect(isSafeURL('//evil.com')).toBe(false);
      expect(isSafeURL('//example.com/path')).toBe(false);
      expect(isSafeURL('///evil.com')).toBe(false);
      expect(isSafeURL('////evil.com')).toBe(false);
    });

    it('should return false for absolute URLs', () => {
      expect(isSafeURL('http://evil.com')).toBe(false);
      expect(isSafeURL('https://evil.com')).toBe(false);
      expect(isSafeURL('ftp://evil.com')).toBe(false);
    });

    it('should return false for javascript: URLs', () => {
      expect(isSafeURL('javascript:alert(1)')).toBe(false);
      expect(isSafeURL('JavaScript:alert(1)')).toBe(false);
      expect(isSafeURL('JAVASCRIPT:alert(1)')).toBe(false);
      expect(isSafeURL('/path?redirect=javascript:alert(1)')).toBe(false);
    });

    it('should return false for data: URLs', () => {
      expect(isSafeURL('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeURL('DATA:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeURL('/path?data:image/png')).toBe(false);
    });

    it('should return false for invalid input', () => {
      expect(isSafeURL('')).toBe(false);
      expect(isSafeURL(null as any)).toBe(false);
      expect(isSafeURL(undefined as any)).toBe(false);
      expect(isSafeURL(123 as any)).toBe(false);
      expect(isSafeURL({} as any)).toBe(false);
    });

    it('should return false for URLs not starting with /', () => {
      expect(isSafeURL('lessons/123')).toBe(false);
      expect(isSafeURL('about')).toBe(false);
      expect(isSafeURL('www.example.com')).toBe(false);
    });
  });

  describe('store', () => {
    it('should store a valid URL in sessionStorage', () => {
      store('/lessons/123');

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'waterballsa_return_url',
        expect.any(String)
      );

      const storedData = JSON.parse(
        mockSessionStorage.getItem('waterballsa_return_url') as string
      );

      expect(storedData).toHaveProperty('url', '/lessons/123');
      expect(storedData).toHaveProperty('timestamp');
      expect(typeof storedData.timestamp).toBe('number');
    });

    it('should update the timestamp when storing a new URL', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      store('/lessons/123');

      const storedData = JSON.parse(
        mockSessionStorage.getItem('waterballsa_return_url') as string
      );

      expect(storedData.timestamp).toBe(now);

      jest.restoreAllMocks();
    });

    it('should throw error for unsafe URLs', () => {
      expect(() => store('//evil.com')).toThrow('Unsafe URL rejected');
      expect(() => store('http://evil.com')).toThrow('Unsafe URL rejected');
      expect(() => store('javascript:alert(1)')).toThrow('Unsafe URL rejected');
      expect(() => store('data:text/html,<script>')).toThrow('Unsafe URL rejected');
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle sessionStorage errors gracefully', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockSessionStorage.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw, but log error
      expect(() => store('/lessons/123')).not.toThrow();
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to store return URL:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });
  });

  describe('get', () => {
    it('should retrieve a stored URL that has not expired', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      store('/lessons/123');

      // Advance time by 10 minutes (less than 30 minute expiry)
      jest.spyOn(Date, 'now').mockReturnValue(now + 10 * 60 * 1000);

      const retrieved = get();
      expect(retrieved).toBe('/lessons/123');

      jest.restoreAllMocks();
    });

    it('should return null if no URL is stored', () => {
      const retrieved = get();
      expect(retrieved).toBeNull();
    });

    it('should return null and clear expired URLs', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      store('/lessons/123');

      // Advance time by 31 minutes (more than 30 minute expiry)
      jest.spyOn(Date, 'now').mockReturnValue(now + 31 * 60 * 1000);

      const retrieved = get();
      expect(retrieved).toBeNull();
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('waterballsa_return_url');

      jest.restoreAllMocks();
    });

    it('should return null exactly at expiry boundary', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      store('/lessons/123');

      // Advance time by exactly 30 minutes + 1ms
      jest.spyOn(Date, 'now').mockReturnValue(now + 30 * 60 * 1000 + 1);

      const retrieved = get();
      expect(retrieved).toBeNull();

      jest.restoreAllMocks();
    });

    it('should validate stored URL and clear if unsafe', () => {
      // Manually inject unsafe URL (simulating tampering or legacy data)
      mockSessionStorage.setItem(
        'waterballsa_return_url',
        JSON.stringify({
          url: '//evil.com',
          timestamp: Date.now(),
        })
      );

      const retrieved = get();
      expect(retrieved).toBeNull();
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('waterballsa_return_url');
    });

    it('should handle malformed JSON gracefully', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      mockSessionStorage.setItem('waterballsa_return_url', 'invalid-json');

      const retrieved = get();
      expect(retrieved).toBeNull();
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to retrieve return URL:',
        expect.any(Error)
      );
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('waterballsa_return_url');

      consoleError.mockRestore();
    });

    it('should handle sessionStorage errors gracefully', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      mockSessionStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const retrieved = get();
      expect(retrieved).toBeNull();
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to retrieve return URL:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });
  });

  describe('clear', () => {
    it('should remove the stored URL from sessionStorage', () => {
      store('/lessons/123');
      expect(mockSessionStorage.getItem('waterballsa_return_url')).not.toBeNull();

      clear();
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('waterballsa_return_url');
      expect(mockSessionStorage.getItem('waterballsa_return_url')).toBeNull();
    });

    it('should not throw if no URL is stored', () => {
      expect(() => clear()).not.toThrow();
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('waterballsa_return_url');
    });

    it('should handle sessionStorage errors gracefully', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      mockSessionStorage.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      expect(() => clear()).not.toThrow();
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to clear return URL:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });
  });

  describe('returnUrlUtils object', () => {
    it('should expose all utility methods', () => {
      expect(returnUrlUtils).toHaveProperty('store');
      expect(returnUrlUtils).toHaveProperty('get');
      expect(returnUrlUtils).toHaveProperty('clear');
      expect(returnUrlUtils).toHaveProperty('isSafeURL');

      expect(typeof returnUrlUtils.store).toBe('function');
      expect(typeof returnUrlUtils.get).toBe('function');
      expect(typeof returnUrlUtils.clear).toBe('function');
      expect(typeof returnUrlUtils.isSafeURL).toBe('function');
    });

    it('should work correctly when using methods from object', () => {
      returnUrlUtils.store('/lessons/456');
      const retrieved = returnUrlUtils.get();
      expect(retrieved).toBe('/lessons/456');

      returnUrlUtils.clear();
      const afterClear = returnUrlUtils.get();
      expect(afterClear).toBeNull();
    });
  });

  describe('integration tests', () => {
    it('should handle complete store-get-clear cycle', () => {
      // Store URL
      store('/lessons/123');
      expect(get()).toBe('/lessons/123');

      // Clear URL
      clear();
      expect(get()).toBeNull();
    });

    it('should handle multiple store operations', () => {
      store('/lessons/123');
      expect(get()).toBe('/lessons/123');

      // Store a different URL (should overwrite)
      store('/curriculums/456');
      expect(get()).toBe('/curriculums/456');
    });

    it('should handle expiry in real-world scenario', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      // User clicks login from lesson page
      store('/lessons/123');

      // User completes login 5 minutes later
      jest.spyOn(Date, 'now').mockReturnValue(now + 5 * 60 * 1000);
      expect(get()).toBe('/lessons/123');

      // User is redirected successfully
      clear();
      expect(get()).toBeNull();

      jest.restoreAllMocks();
    });

    it('should reject tampering attempts', () => {
      // Attacker tries to inject malicious URL
      expect(() => store('//attacker.com/phishing')).toThrow();

      // Attacker manually modifies sessionStorage
      mockSessionStorage.setItem(
        'waterballsa_return_url',
        JSON.stringify({
          url: 'http://attacker.com',
          timestamp: Date.now(),
        })
      );

      // System should reject and clear
      expect(get()).toBeNull();
      expect(mockSessionStorage.getItem('waterballsa_return_url')).toBeNull();
    });

    it('should handle edge case URLs', () => {
      // Valid complex URLs
      expect(isSafeURL('/lessons/123?returnTo=/curriculums/456')).toBe(true);
      expect(isSafeURL('/search?q=test&filter=active')).toBe(true);
      expect(isSafeURL('/profile#settings')).toBe(true);
      expect(isSafeURL('/path/to/resource')).toBe(true);

      // Invalid edge cases
      expect(isSafeURL('///multiple-slashes')).toBe(false);
      expect(isSafeURL('/./relative')).toBe(true); // This is actually safe
      expect(isSafeURL('/../parent')).toBe(true); // This is also safe (browser will handle)
    });
  });

  describe('security tests', () => {
    it('should prevent open redirect attacks', () => {
      const maliciousUrls = [
        '//evil.com',
        '///evil.com',
        'http://evil.com',
        'https://evil.com',
        '//evil.com/path',
        'javascript:alert(document.cookie)',
        'data:text/html,<script>alert(1)</script>',
      ];

      maliciousUrls.forEach((url) => {
        expect(isSafeURL(url)).toBe(false);
        expect(() => store(url)).toThrow();
      });
    });

    it('should only allow same-origin relative URLs', () => {
      const safeUrls = [
        '/lessons/123',
        '/curriculums/456',
        '/profile/settings',
        '/api/data',
        '/path/to/resource?param=value',
        '/anchor#section',
      ];

      safeUrls.forEach((url) => {
        expect(isSafeURL(url)).toBe(true);
        expect(() => store(url)).not.toThrow();
      });
    });

    it('should handle URL encoding attacks', () => {
      // Encoded versions of malicious URLs should still be rejected
      expect(isSafeURL('/%2F/evil.com')).toBe(true); // Actually safe, just encoded slash
      expect(isSafeURL('/javascript%3Aalert(1)')).toBe(false); // Contains 'javascript:'
    });

    it('should expire old URLs to prevent session fixation', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      store('/lessons/123');

      // Simulate attacker getting old session after 35 minutes
      jest.spyOn(Date, 'now').mockReturnValue(now + 35 * 60 * 1000);

      expect(get()).toBeNull();

      jest.restoreAllMocks();
    });
  });
});
