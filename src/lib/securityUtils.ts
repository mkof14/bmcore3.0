/**
 * Security Utilities - Protection against common web attacks
 */

/**
 * XSS Protection - Sanitize user input
 */
export function sanitizeInput(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * SQL Injection Protection - Validate and sanitize SQL-like inputs
 */
export function validateSQLInput(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /('|")(.*?)(\1)/,
  ];

  return !sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * CSRF Token Generation
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store CSRF token
 */
export function setCSRFToken(token: string): void {
  sessionStorage.setItem('csrf_token', token);
}

/**
 * Get CSRF token
 */
export function getCSRFToken(): string | null {
  return sessionStorage.getItem('csrf_token');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  const storedToken = getCSRFToken();
  return storedToken !== null && storedToken === token;
}

/**
 * Content Security Policy violation handler.
 * Enforceable CSP is set via HTTP headers in vercel.json (and vite preview headers).
 * This listener only surfaces violations in the console / optional GA when present.
 */
export function setupCSPReporting(): void {
  document.addEventListener('securitypolicyviolation', (event) => {
    console.error('CSP Violation:', {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
    });

    // Report to analytics when GA is loaded (consent-gated)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'csp_violation', {
        blocked_uri: event.blockedURI,
        directive: event.violatedDirective,
      });
    }
  });
}

/**
 * Detect suspicious activity patterns
 */
export class ThreatDetector {
  private suspiciousPatterns = [
    // Path traversal
    /\.\.[\/\\]/,
    // Command injection
    /[;&|`$()]/,
    // Script tags
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    // Iframe injection
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    // Base64 encoded scripts
    /data:text\/html;base64,/,
  ];

  private failedAttempts: Map<string, number> = new Map();
  private readonly maxAttempts = 5;
  private readonly resetTime = 15 * 60 * 1000; // 15 minutes

  detectThreat(input: string, identifier: string): boolean {
    const isSuspicious = this.suspiciousPatterns.some(pattern => pattern.test(input));

    if (isSuspicious) {
      this.recordFailedAttempt(identifier);
      return true;
    }

    return false;
  }

  recordFailedAttempt(identifier: string): void {
    const attempts = (this.failedAttempts.get(identifier) || 0) + 1;
    this.failedAttempts.set(identifier, attempts);

    if (attempts >= this.maxAttempts) {
      this.blockUser(identifier);
    }

    // Auto-clear after reset time
    setTimeout(() => {
      this.failedAttempts.delete(identifier);
    }, this.resetTime);
  }

  blockUser(identifier: string): void {
    console.error(`User blocked due to suspicious activity: ${identifier}`);

    // Store in localStorage to persist across sessions
    const blockedUntil = Date.now() + this.resetTime;
    localStorage.setItem(`blocked_${identifier}`, blockedUntil.toString());

    // Trigger security event
    window.dispatchEvent(new CustomEvent('security:user-blocked', {
      detail: { identifier, blockedUntil }
    }));
  }

  isBlocked(identifier: string): boolean {
    const blockedUntil = localStorage.getItem(`blocked_${identifier}`);

    if (!blockedUntil) return false;

    const unblockTime = parseInt(blockedUntil, 10);

    if (Date.now() > unblockTime) {
      localStorage.removeItem(`blocked_${identifier}`);
      return false;
    }

    return true;
  }
}

/**
 * Password strength validator
 */
export interface PasswordStrength {
  score: number; // 0-100
  feedback: string[];
  isValid: boolean;
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 20;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }

  if (password.length >= 12) {
    score += 10;
  }

  // Complexity checks
  if (/[a-z]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Include lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Include uppercase letters');
  }

  if (/[0-9]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Include numbers');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Include special characters');
  }

  // Pattern checks
  if (!/(.)\1{2,}/.test(password)) {
    score += 10;
  } else {
    feedback.push('Avoid repeated characters');
  }

  // Common passwords check (basic)
  const commonPasswords = ['password', '12345678', 'qwerty', 'admin', 'letmein'];
  if (!commonPasswords.some(common => password.toLowerCase().includes(common))) {
    score += 10;
  } else {
    feedback.push('Avoid common passwords');
  }

  return {
    score,
    feedback,
    isValid: score >= 70,
  };
}

/**
 * Email validation with security checks
 */
export function validateSecureEmail(email: string): boolean {
  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
  ];

  return !suspiciousPatterns.some(pattern => pattern.test(email));
}

/**
 * URL validation and sanitization
 */
export function validateURL(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    // Block suspicious TLDs
    const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq'];
    if (suspiciousTLDs.some(tld => parsed.hostname.endsWith(tld))) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Secure random string generator
 */
export function generateSecureRandom(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Initialize all security measures
 */
export function initializeSecurity(): void {
  // Setup CSP reporting
  setupCSPReporting();

  // Generate and store CSRF token
  const csrfToken = generateCSRFToken();
  setCSRFToken(csrfToken);

  // Add security headers to all fetch requests
  const originalFetch = window.fetch;
  window.fetch = function(input, init = {}) {
    const headers = new Headers(init.headers || {});

    // Add CSRF token
    const token = getCSRFToken();
    if (token) {
      headers.set('X-CSRF-Token', token);
    }

    // Add custom security header
    headers.set('X-Requested-With', 'XMLHttpRequest');

    return originalFetch(input, {
      ...init,
      headers,
    });
  };

  console.log('🔒 Security measures initialized');
}

// Global threat detector instance
export const threatDetector = new ThreatDetector();
