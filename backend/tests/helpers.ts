import { app } from '../src/index.js';
import { signToken } from '../src/middleware/auth.js';
import type { UserRole } from '../src/types/index.js';

export const OWNER_EMAIL = 'shibudhara147@gmail.com';
export const OWNER_PASSWORD = 'owner-password-123';

const header = (sub: string, role: UserRole) => ({
  Authorization: `Bearer ${signToken({ sub, email: `${sub}@example.com`, name: `Test ${role}`, role })}`
});

export const adminAuth = () => header('USR-OWNER-SHIBU', 'Super Admin');
export const staffAuth = () => header('USR-STAFF-TEST', 'Staff');
export const patientAuth = () => header('USR-PATIENT-TEST', 'Patient');

export const call = async (method: string, path: string, options: { body?: unknown; headers?: Record<string, string> } = {}) => {
  const res = await app.request(`/api/v1${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  return { status: res.status, body: await res.json() };
};
