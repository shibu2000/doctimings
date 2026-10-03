import { signToken } from '../src/middleware/auth.js';

export const getAdminAuthHeader = (): { Authorization: string } => {
  const token = signToken({
    sub: 'USR-ADMIN-01',
    email: 'admin@whereismydoctor.internal',
    name: 'Shibu Dhara',
    role: 'Super Admin'
  });
  return { Authorization: `Bearer ${token}` };
};

export const getPatientAuthHeader = (): { Authorization: string } => {
  const token = signToken({
    sub: 'USR-PATIENT-01',
    email: 'patient@example.com',
    name: 'Rahul Sen',
    role: 'Patient'
  });
  return { Authorization: `Bearer ${token}` };
};
