// ==============================================================================
// nia mobility - Cryptographic Password Hashing & Verification Service
// Uses Web Crypto API (SHA-256 + Random Salt) - Zero External Dependencies
// Developed by Denory Codespace
// ==============================================================================

/**
 * Hash a plaintext password with a random 16-byte salt using SHA-256.
 * Returns salt:hash in hex format.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) return '';
  
  // Generate 16 bytes of cryptographically secure random salt
  const salt = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(salt);
  } else {
    for (let i = 0; i < 16; i++) {
      salt[i] = Math.floor(Math.random() * 256);
    }
  }

  const saltHex = Array.from(salt)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const encoder = new TextEncoder();
  const data = encoder.encode(`${saltHex}:${password}`);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return `${saltHex}:${hashHex}`;
}

/**
 * Verify a candidate password against a stored password string.
 * Supports salt:hash format and handles legacy plaintext seamlessly.
 */
export async function verifyPassword(password: string, storedHash?: string): Promise<boolean> {
  if (!storedHash) return true; // Account has no password set
  if (!password) return false;

  // Handle legacy plaintext passwords from older records
  if (!storedHash.includes(':')) {
    return password === storedHash;
  }

  const [saltHex, expectedHash] = storedHash.split(':');
  if (!saltHex || !expectedHash) return false;

  const encoder = new TextEncoder();
  const data = encoder.encode(`${saltHex}:${password}`);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex === expectedHash;
}
