import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getSecretKey(): Buffer {
  const secret = process.env.SESSION_ENCRYPTION_KEY || 'placemint_32_character_aes_secret_key!';
  // Hash to ensure exact 32 bytes
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts Telegram MTProto session string with AES-256-GCM.
 */
export function encryptSession(plainText: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getSecretKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Combine IV:AuthTag:Ciphertext in base64
  const payload = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]);
  return payload.toString('base64');
}

/**
 * Decrypts Telegram MTProto session string with AES-256-GCM.
 */
export function decryptSession(cipherPayloadBase64: string): string {
  const rawBuffer = Buffer.from(cipherPayloadBase64, 'base64');

  const iv = rawBuffer.subarray(0, IV_LENGTH);
  const authTag = rawBuffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encryptedText = rawBuffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH).toString('hex');

  const key = getSecretKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
