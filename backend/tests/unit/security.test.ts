import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import { signToken, verifyToken } from '../../src/middleware/auth.js';
import { JWTPayload } from '../../src/types/index.js';

describe('Security Unit Tests', () => {
  it('should sign and accurately verify a valid JWT token', () => {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      sub: 'USR-TEST-01',
      email: 'test@wimd.in',
      name: 'Dr. Test Roy',
      role: 'Operations Admin'
    };

    const token = signToken(payload, '1h');
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);

    const verified = verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.sub).toBe('USR-TEST-01');
    expect(verified?.email).toBe('test@wimd.in');
    expect(verified?.role).toBe('Operations Admin');
  });

  it('should return null when verifying a malformed or tempered token', () => {
    const malformed = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.sig';
    expect(verifyToken(malformed)).toBeNull();
    expect(verifyToken('')).toBeNull();
    expect(verifyToken('not-a-token')).toBeNull();
  });

  it('should securely hash passwords and verify matching hashes with bcrypt', async () => {
    const plainText = 'SecurePassWB2026!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plainText, salt);

    expect(hash).not.toBe(plainText);
    expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);

    const isMatch = await bcrypt.compare(plainText, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await bcrypt.compare('WrongPassword123', hash);
    expect(isWrongMatch).toBe(false);
  });
});
