const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export const INVITE_TTL_DAYS = 7;

const LIMIT = 256 - (256 % ALPHABET.length);

export const generateCode = () => {
  let chars = '';
  while (chars.length < 10) {
    for (const byte of crypto.getRandomValues(new Uint8Array(16))) {
      if (byte < LIMIT && chars.length < 10) chars += ALPHABET[byte % ALPHABET.length];
    }
  }
  return `${chars.slice(0, 5)}-${chars.slice(5)}`;
};

export const normalizeCode = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, '');

export const hashCode = async (code: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalizeCode(code)));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
};

export const inviteExpiry = () => new Date(Date.now() + INVITE_TTL_DAYS * 86400000);
