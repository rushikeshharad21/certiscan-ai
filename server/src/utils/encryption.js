import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

const getKey = () => {
  return Buffer.from(process.env.AADHAAR_ENCRYPTION_KEY, 'hex');
};

const encrypt = (text) => {
  if (!text) return null;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

const decrypt = (encryptedData) => {
  if (!encryptedData) return null;

  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

const maskAadhaar = (aadhaarNumber) => {
  if (!aadhaarNumber) return null;
  const digitsOnly = aadhaarNumber.replace(/\s/g, '');
  if (digitsOnly.length < 4) return null;
  const last4 = digitsOnly.slice(-4);
  return `XXXX XXXX ${last4}`;
};

export { encrypt, decrypt, maskAadhaar };