import crypto from 'node:crypto';
import { DATA_ENCRYPTION_KEY } from '../config.js';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Cifra un texto usando AES-256-CBC.
 * Requisito de mitigación para protección de datos sensibles.
 * 
 * @param {string} text - Texto en claro
 * @returns {string} - Texto cifrado en formato iv:encrypted
 */
export function encrypt(text) {
  if (!text) return text;
  
  // Si ya parece estar cifrado (formato iv:content), no volver a cifrar
  if (typeof text === 'string' && text.includes(':') && text.length > 40) {
     return text;
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    // Asegurar que la llave tenga 32 bytes (256 bits)
    const key = crypto.scryptSync(DATA_ENCRYPTION_KEY || 'default-secret-key-edualert-2024', 'salt', 32);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    console.error('  ❌ Error en cifrado:', err);
    return text;
  }
}

/**
 * Descifra un texto cifrado con el método anterior.
 * 
 * @param {string} text - Texto cifrado en formato iv:encrypted
 * @returns {string} - Texto en claro
 */
export function decrypt(text) {
  if (!text || typeof text !== 'string' || !text.includes(':')) {
    return text;
  }

  try {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    
    const key = crypto.scryptSync(DATA_ENCRYPTION_KEY || 'default-secret-key-edualert-2024', 'salt', 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    // Si falla el descifrado, devolvemos el original (podría no estar cifrado)
    return text;
  }
}

/**
 * Descifra recursivamente un objeto si tiene campos cifrados.
 */
export function decryptObject(obj, fields = []) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = Array.isArray(obj) ? [...obj] : { ...obj };
  
  for (const key in result) {
    if (fields.includes(key)) {
      result[key] = decrypt(result[key]);
    } else if (typeof result[key] === 'object') {
      result[key] = decryptObject(result[key], fields);
    }
  }
  
  return result;
}
