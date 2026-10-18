import type { Context } from 'hono';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import { ADMIN_ROLES, STAFF_ROLES, type JWTPayload } from '../types/index.js';

type Doctor = typeof schema.doctors.$inferSelect;

export interface Access {
  user: JWTPayload;
  platform: boolean;
  admin: boolean;
  memberships: Map<string, 'Owner' | 'Staff'>;
  doctorId: string | null;
}

export const getAccess = async (c: Context): Promise<Access> => {
  const cached = c.get('access');
  if (cached) return cached;
  const user = c.get('user');
  const platform = (STAFF_ROLES as readonly string[]).includes(user.role);
  const access: Access = {
    user,
    platform,
    admin: (ADMIN_ROLES as readonly string[]).includes(user.role),
    memberships: new Map(),
    doctorId: null
  };
  if (!platform) {
    const db = getDb();
    const [members, links] = await Promise.all([
      db.select().from(schema.establishmentMembers).where(eq(schema.establishmentMembers.userId, user.sub)),
      db.select().from(schema.doctorLinks).where(eq(schema.doctorLinks.userId, user.sub))
    ]);
    for (const m of members) access.memberships.set(m.establishmentId, m.role as 'Owner' | 'Staff');
    access.doctorId = links[0]?.doctorId ?? null;
  }
  c.set('access', access);
  return access;
};

export const accessIfSignedIn = async (c: Context) => (c.get('user') ? getAccess(c) : null);

export const isPubliclyListed = (doctor: Pick<Doctor, 'isActive' | 'verificationStatus'>) =>
  doctor.isActive && doctor.verificationStatus !== 'Needs Review';

export const canSeeDoctor = (access: Access | null, doctor: Doctor) =>
  isPubliclyListed(doctor) ||
  Boolean(access && (access.platform || access.doctorId === doctor.id || doctor.affiliatedEstablishmentIds.some(id => access.memberships.has(id))));

export const canManageEstablishment = (access: Access, establishmentId: string) =>
  access.platform || access.memberships.has(establishmentId);

export const isOwnerOf = (access: Access, establishmentId: string) =>
  access.platform || access.memberships.get(establishmentId) === 'Owner';

export const canManageSitting = (access: Access, doctorId: string, establishmentId: string) =>
  canManageEstablishment(access, establishmentId) || access.doctorId === doctorId;

export const PROFILE_FIELDS_FOR_PARTNERS = ['specialty', 'qualifications', 'experienceYears', 'languages', 'photoUrl'] as const;

export const PROFILE_FIELDS_FOR_DOCTOR = [...PROFILE_FIELDS_FOR_PARTNERS, 'primaryPhone', 'email'] as const;

export const isDoctorClaimed = async (doctorId: string) => {
  const [link] = await getDb().select({ id: schema.doctorLinks.id }).from(schema.doctorLinks).where(eq(schema.doctorLinks.doctorId, doctorId));
  return Boolean(link);
};

export const canEditDoctorProfile = async (access: Access, doctor: Doctor) => {
  if (access.platform || access.doctorId === doctor.id) return true;
  if (!doctor.affiliatedEstablishmentIds.length) return false;
  if (!doctor.affiliatedEstablishmentIds.every(id => access.memberships.has(id))) return false;
  return !(await isDoctorClaimed(doctor.id));
};
