import crypto from 'crypto';

// Encryption utilities for sensitive data (PHI - Protected Health Information)
// Uses AES-256-GCM for encryption with proper authentication

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

/**
 * Derive a cryptographic key from the encryption secret
 */
function getKey(encryptionSecret: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(encryptionSecret, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt sensitive data
 * @param data - The data to encrypt
 * @param encryptionSecret - The encryption secret from environment
 * @returns Encrypted data with salt, IV, and auth tag combined
 */
export const encryptData = (data: string, encryptionSecret: string): string => {
  try {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getKey(encryptionSecret, salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();

    // Combine salt + iv + tag + encrypted
    const combined = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'hex')
    ]);

    return combined.toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Decrypt sensitive data
 * @param encryptedData - The encrypted data (base64 encoded)
 * @param encryptionSecret - The encryption secret from environment
 * @returns Decrypted original data
 */
export const decryptData = (encryptedData: string, encryptionSecret: string): string => {
  try {
    const combined = Buffer.from(encryptedData, 'base64');

    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, TAG_POSITION);
    const tag = combined.subarray(TAG_POSITION, ENCRYPTED_POSITION);
    const encrypted = combined.subarray(ENCRYPTED_POSITION);

    const key = getKey(encryptionSecret, salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Hash sensitive identifiers for comparison without storing original data
 * @param data - The data to hash
 * @returns Hashed data
 */
export const hashSensitiveData = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Generate a secure random token
 * @param length - Length of the token in bytes
 * @returns Secure random token as hex string
 */
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Validate encryption secret is properly configured
 */
export const validateEncryptionSecret = (secret: string): boolean => {
  return secret && secret.length >= 32;
};