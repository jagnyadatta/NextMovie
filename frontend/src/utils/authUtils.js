/**
 * Safely parses and decodes the payload of a JWT token without signature verification.
 * Note: Signature and cryptographic verification is strictly enforced on the backend.
 *
 * @param {string} token - The raw JWT token string.
 * @returns {object|null} - The parsed JSON payload, or null if invalid or malformed.
 */
export const parseJwt = (token) => {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Convert Base64URL to Base64
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    // Decode base64 to string with UTF-8 character decoding
    let jsonString;
    if (typeof atob === 'function') {
      jsonString = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } else if (typeof Buffer !== 'undefined') {
      jsonString = Buffer.from(base64, 'base64').toString('utf-8');
    } else {
      return null;
    }

    return JSON.parse(jsonString);
  } catch {
    return null;
  }
};

/**
 * Checks whether a JWT token is expired, invalid, malformed, or missing its `exp` claim.
 *
 * @param {string} token - The raw JWT token string.
 * @param {number} bufferSeconds - Optional grace buffer in seconds (default 0).
 * @returns {boolean} - Returns true if expired or invalid; false if token is unexpired.
 */
export const isTokenExpired = (token, bufferSeconds = 0) => {
  if (!token) return true;

  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== 'number') {
    return true;
  }

  const expirationMs = payload.exp * 1000;
  const currentMs = Date.now() + bufferSeconds * 1000;

  return currentMs >= expirationMs;
};

export const AUTH_TOKEN_KEY = 'nextmovie_token';
export const AUTH_USER_KEY = 'nextmovie_user';

/**
 * Clears all authentication-related keys from localStorage.
 * Cleans both primary and legacy key variants for complete backward compatibility.
 */
export const clearStoredAuth = () => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch {
    // Ignore storage access errors (e.g. incognito/sandboxed iframe)
  }
};

/**
 * Safely retrieves stored token only if it exists and is unexpired.
 * Cleans up invalid/expired entries automatically.
 *
 * @returns {string|null} - Valid unexpired token or null.
 */
export const getValidStoredToken = () => {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem('token');
    if (!token) return null;

    if (isTokenExpired(token)) {
      clearStoredAuth();
      return null;
    }
    return token;
  } catch {
    return null;
  }
};
