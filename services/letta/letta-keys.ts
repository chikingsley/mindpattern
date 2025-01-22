import { randomBytes } from 'crypto';

export class LettaKeyManager {
  private static KEY_PREFIX = 'letta_key_';
  
  /**
   * Generate a new Letta API key - use this once when setting up your server
   * Format: letta_key_{32_random_bytes_hex}
   */
  static generateKey(): string {
    const randomString = randomBytes(32).toString('hex');
    return `${this.KEY_PREFIX}${randomString}`;
  }

  /**
   * Validate a Letta API key format
   */
  static isValidKey(key: string | undefined): boolean {
    return typeof key === 'string' && 
           key.startsWith(this.KEY_PREFIX) && 
           key.length === this.KEY_PREFIX.length + 64; // 32 bytes = 64 hex chars
  }

  /**
   * Extract the key ID (random part) from a full key
   */
  static extractKeyId(key: string): string | null {
    if (!this.isValidKey(key)) return null;
    return key.slice(this.KEY_PREFIX.length);
  }
} 