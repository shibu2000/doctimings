import bcrypt from 'bcryptjs';
import type { Context } from 'hono';
import { and, desc, eq, gt, inArray, isNull, sql } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import { signToken } from '../middleware/auth.js';
import { recordAudit } from '../lib/audit.js';
import { getAccess, isOwnerOf } from '../lib/access.js';
import { badRequest, currentUser, fail, newId, notFound, validBody } from '../lib/http.js';
import { generateCode, hashCode, inviteExpiry } from '../lib/invites.js';
import type {
  ActivateInput,
  ChangePasswordInput,
  ClaimInput,
  EstablishmentInviteInput,
  DoctorInviteInput,
  ReviewClaimInput
} from '../validators/accessValidator.js';
import type { UserRole } from '../types/index.js';

type Invitation = typeof schema.invitations.$inferSelect;

const forbidden = (c: Context, message: string) => fail(c, 403, 'FORBIDDEN', message);

const digits = (value: string) => value.replace(/\D/g, '').slice(-10);
const normalizeReg = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');

const openInvitations = (filter: ReturnType<typeof eq>) =>
  getDb()
    .select()
    .from(schema.invitations)
    .where(and(filter, isNull(schema.invitations.usedAt), isNull(schema.invitations.revokedAt), gt(schema.invitations.expiresAt, new Date())))
    .orderBy(desc(schema.invitations.createdAt));

const publicInvitation = ({ codeHash: _, ...invitation }: Invitation) => invitation;

const createInvitation = async (values: Omit<typeof schema.invitations.$inferInsert, 'id' | 'codeHash' | 'expiresAt'>) => {
  const code = generateCode();
  const [invitation] = await getDb()
    .insert(schema.invitations)
    .values({ ...values, id: newId('INV'), codeHash: await hashCode(code), expiresAt: inviteExpiry() })
    .returning();
  return { invitation: publicInvitation(invitation), code };
};

const refreshAccountStatus = async (establishmentId: string) => {
  const db = getDb();
  const [owners, invites] = await Promise.all([
    db
      .select({ id: schema.establishmentMembers.id })
      .from(schema.establishmentMembers)
      .where(and(eq(schema.establishmentMembers.establishmentId, establishmentId), eq(schema.establishmentMembers.role, 'Owner'))),
    openInvitations(eq(schema.invitations.establishmentId, establishmentId))
  ]);
  const accountStatus = owners.length ? 'Account Active' : invites.some(i => i.role === 'Owner') ? 'Invitation Pending' : 'Platform Managed';
  await db.update(schema.establishments).set({ accountStatus }).where(eq(schema.establishments.id, establishmentId));
};

export const revokeInvitesCreatedBy = (userId: string, establishmentId?: string) =>
  getDb()
    .update(schema.invitations)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(schema.invitations.createdBy, userId),
        isNull(schema.invitations.usedAt),
        isNull(schema.invitations.revokedAt),
        ...(establishmentId ? [eq(schema.invitations.establishmentId, establishmentId)] : [])
      )
    );

const memberView = async (establishmentId: string) => {
  const db = getDb();
  const members = await db
    .select({
      id: schema.establishmentMembers.id,
      role: schema.establishmentMembers.role,
      createdAt: schema.establishmentMembers.createdAt,
      userId: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      phone: schema.users.phone,
      status: schema.users.status,
      lastActive: schema.users.lastActive
    })
    .from(schema.establishmentMembers)
    .innerJoin(schema.users, eq(schema.users.id, schema.establishmentMembers.userId))
    .where(eq(schema.establishmentMembers.establishmentId, establishmentId));
  const invites = await openInvitations(eq(schema.invitations.establishmentId, establishmentId));
  return { members, invitations: invites.map(publicInvitation) };
};

export const accessController = {
  establishmentAccess: async (c: Context) => {
    const establishmentId = c.req.param('id')!;
    if (!isOwnerOf(await getAccess(c), establishmentId)) return forbidden(c, 'Only the owner can see the team');
    return c.json({ success: true, data: await memberView(establishmentId) });
  },

  inviteToEstablishment: async (c: Context) => {
    const establishmentId = c.req.param('id')!;
    const body = validBody<EstablishmentInviteInput>(c);
    const access = await getAccess(c);
    const [establishment] = await getDb().select().from(schema.establishments).where(eq(schema.establishments.id, establishmentId));
    if (!establishment) return notFound(c, 'Establishment not found');
    if (!isOwnerOf(access, establishmentId)) return forbidden(c, 'Only the owner can invite people');
    if (body.role === 'Owner' && !access.platform) return forbidden(c, 'Only DocTimings can hand over ownership');

    const result = await createInvitation({
      kind: 'establishment',
      establishmentId,
      role: body.role,
      name: body.name,
      phone: body.phone,
      createdBy: access.user.sub
    });
    await refreshAccountStatus(establishmentId);
    await recordAudit(getDb(), access.user, {
      action: body.role === 'Owner' ? 'Created owner invite' : 'Created staff invite',
      entityType: 'Establishment',
      entityId: establishmentId,
      entityName: establishment.name,
      details: `${body.name} (${body.phone})`
    });

    return c.json({ success: true, data: result }, 201);
  },

  removeMember: async (c: Context) => {
    const establishmentId = c.req.param('id')!;
    const memberId = c.req.param('memberId')!;
    const db = getDb();
    const access = await getAccess(c);
    if (!isOwnerOf(access, establishmentId)) return forbidden(c, 'Only the owner can remove people');

    const [member] = await db
      .select()
      .from(schema.establishmentMembers)
      .where(and(eq(schema.establishmentMembers.id, memberId), eq(schema.establishmentMembers.establishmentId, establishmentId)));
    if (!member) return notFound(c, 'Team member not found');
    if (member.role === 'Owner' && !access.platform) return forbidden(c, 'Only DocTimings can remove an owner');

    await db.delete(schema.establishmentMembers).where(eq(schema.establishmentMembers.id, memberId));
    await db.update(schema.users).set({ updatedAt: new Date() }).where(eq(schema.users.id, member.userId));
    await revokeInvitesCreatedBy(member.userId, establishmentId);
    await refreshAccountStatus(establishmentId);
    await recordAudit(db, access.user, {
      action: 'Removed establishment access',
      entityType: 'Establishment',
      entityId: establishmentId,
      entityName: establishmentId,
      details: `${member.role} ${member.userId}`
    });

    return c.json({ success: true, message: 'Access removed' });
  },

  revokeInvitation: async (c: Context) => {
    const id = c.req.param('id')!;
    const db = getDb();
    const access = await getAccess(c);
    const [invitation] = await db.select().from(schema.invitations).where(eq(schema.invitations.id, id));
    if (!invitation || invitation.usedAt || invitation.revokedAt) return notFound(c, 'Invite not found or already used');

    const allowed = invitation.establishmentId
      ? isOwnerOf(access, invitation.establishmentId) && (invitation.role !== 'Owner' || access.platform)
      : access.platform;
    if (!allowed) return forbidden(c, 'You cannot cancel this invite');

    await db.update(schema.invitations).set({ revokedAt: new Date() }).where(eq(schema.invitations.id, id));
    if (invitation.establishmentId) await refreshAccountStatus(invitation.establishmentId);
    return c.json({ success: true, message: 'Invite cancelled' });
  },

  doctorAccess: async (c: Context) => {
    const doctorId = c.req.param('id')!;
    const db = getDb();
    const [links, invites, claims] = await Promise.all([
      db
        .select({ id: schema.doctorLinks.id, userId: schema.users.id, name: schema.users.name, email: schema.users.email, phone: schema.users.phone, createdAt: schema.doctorLinks.createdAt })
        .from(schema.doctorLinks)
        .innerJoin(schema.users, eq(schema.users.id, schema.doctorLinks.userId))
        .where(eq(schema.doctorLinks.doctorId, doctorId)),
      openInvitations(eq(schema.invitations.doctorId, doctorId)),
      db.select().from(schema.doctorClaims).where(eq(schema.doctorClaims.doctorId, doctorId)).orderBy(desc(schema.doctorClaims.createdAt))
    ]);
    return c.json({ success: true, data: { account: links[0] ?? null, invitations: invites.map(publicInvitation), claims } });
  },

  inviteDoctor: async (c: Context) => {
    const doctorId = c.req.param('id')!;
    const body = validBody<DoctorInviteInput>(c);
    const db = getDb();
    const [doctor] = await db.select().from(schema.doctors).where(eq(schema.doctors.id, doctorId));
    if (!doctor) return notFound(c, 'Doctor not found');
    const [link] = await db.select().from(schema.doctorLinks).where(eq(schema.doctorLinks.doctorId, doctorId));
    if (link) return fail(c, 409, 'ALREADY_CLAIMED', 'This profile already has an account. Remove it first.');

    await db
      .update(schema.invitations)
      .set({ revokedAt: new Date() })
      .where(and(eq(schema.invitations.doctorId, doctorId), isNull(schema.invitations.usedAt), isNull(schema.invitations.revokedAt)));
    const result = await createInvitation({ kind: 'doctor', doctorId, role: 'Doctor', name: body.name || doctor.fullName, phone: body.phone || doctor.primaryPhone, createdBy: currentUser(c)!.sub });
    await recordAudit(db, currentUser(c), { action: 'Created doctor access code', entityType: 'Doctor', entityId: doctorId, entityName: doctor.fullName });
    return c.json({ success: true, data: result }, 201);
  },

  unlinkDoctor: async (c: Context) => {
    const doctorId = c.req.param('id')!;
    const db = getDb();
    const [link] = await db.select().from(schema.doctorLinks).where(eq(schema.doctorLinks.doctorId, doctorId));
    if (!link) return notFound(c, 'This profile has no account');
    await db.delete(schema.doctorLinks).where(eq(schema.doctorLinks.id, link.id));
    await db.update(schema.users).set({ updatedAt: new Date() }).where(eq(schema.users.id, link.userId));
    await recordAudit(db, currentUser(c), { action: 'Removed doctor account', entityType: 'Doctor', entityId: doctorId, entityName: doctorId });
    return c.json({ success: true, message: 'Account removed from profile' });
  },

  activate: async (c: Context) => {
    const body = validBody<ActivateInput>(c);
    const db = getDb();
    const codeHash = await hashCode(body.code);

    const [claimed] = await db
      .update(schema.invitations)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(schema.invitations.codeHash, codeHash),
          isNull(schema.invitations.usedAt),
          isNull(schema.invitations.revokedAt),
          gt(schema.invitations.expiresAt, new Date())
        )
      )
      .returning();
    if (!claimed) return fail(c, 400, 'INVALID_CODE', 'This code is wrong, expired or already used. Ask for a new one.');

    const release = () => db.update(schema.invitations).set({ usedAt: null }).where(eq(schema.invitations.id, claimed.id));

    let user: typeof schema.users.$inferSelect;
    try {
      if (claimed.kind === 'doctor') {
        const [link] = await db.select().from(schema.doctorLinks).where(eq(schema.doctorLinks.doctorId, claimed.doctorId!));
        if (link) {
          await release();
          return fail(c, 409, 'ALREADY_CLAIMED', 'This doctor profile already has an account');
        }
      }

      const [existing] = await db.select().from(schema.users).where(sql`lower(${schema.users.email}) = ${body.email.toLowerCase()}`);
      if (existing) {
        const valid = await bcrypt.compare(body.password, existing.passwordHash).catch(() => false);
        if (!valid || existing.role !== 'Partner' || existing.status !== 'Active') {
          await release();
          return fail(c, 409, 'EMAIL_IN_USE', 'This email already has an account. Enter that account’s password, or use another email.');
        }
        if (claimed.kind === 'doctor') {
          const [ownLink] = await db.select().from(schema.doctorLinks).where(eq(schema.doctorLinks.userId, existing.id));
          if (ownLink) {
            await release();
            return fail(c, 409, 'ALREADY_LINKED', 'This account is already linked to a doctor profile');
          }
        }
        user = existing;
      } else {
        [user] = await db
          .insert(schema.users)
          .values({
            id: newId('USR'),
            name: body.name,
            email: body.email.toLowerCase(),
            phone: body.phone,
            passwordHash: await bcrypt.hash(body.password, 10),
            role: 'Partner',
            status: 'Active',
            lastActive: new Date().toISOString()
          })
          .returning();
      }

      if (claimed.kind === 'establishment') {
        const [membership] = await db
          .select()
          .from(schema.establishmentMembers)
          .where(and(eq(schema.establishmentMembers.userId, user.id), eq(schema.establishmentMembers.establishmentId, claimed.establishmentId!)));
        if (!membership) {
          await db.insert(schema.establishmentMembers).values({
            id: newId('MEM'),
            userId: user.id,
            establishmentId: claimed.establishmentId!,
            role: claimed.role,
            invitedBy: claimed.createdBy
          });
        } else if (membership.role === 'Staff' && claimed.role === 'Owner') {
          await db.update(schema.establishmentMembers).set({ role: 'Owner' }).where(eq(schema.establishmentMembers.id, membership.id));
        }
        await refreshAccountStatus(claimed.establishmentId!);
      } else {
        await db.insert(schema.doctorLinks).values({ id: newId('DLK'), userId: user.id, doctorId: claimed.doctorId! });
        await db
          .update(schema.doctorClaims)
          .set({ status: 'completed' })
          .where(and(eq(schema.doctorClaims.doctorId, claimed.doctorId!), eq(schema.doctorClaims.status, 'approved')));
        await db
          .update(schema.invitations)
          .set({ revokedAt: new Date() })
          .where(and(eq(schema.invitations.doctorId, claimed.doctorId!), isNull(schema.invitations.usedAt)));
      }
      await db.update(schema.invitations).set({ usedBy: user.id }).where(eq(schema.invitations.id, claimed.id));
    } catch (err) {
      await release();
      throw err;
    }

    await recordAudit(db, { sub: user.id, name: user.name }, {
      action: claimed.kind === 'doctor' ? 'Activated doctor account' : `Joined establishment as ${claimed.role}`,
      entityType: claimed.kind === 'doctor' ? 'Doctor' : 'Establishment',
      entityId: (claimed.doctorId ?? claimed.establishmentId)!,
      entityName: user.name
    });

    const token = signToken({ sub: user.id, email: user.email, name: user.name, role: user.role as UserRole });
    return c.json({
      success: true,
      data: { token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, status: user.status } }
    });
  },

  partnerMe: async (c: Context) => {
    const access = await getAccess(c);
    const db = getDb();
    const establishmentIds = [...access.memberships.keys()];
    const [establishments, doctor] = await Promise.all([
      establishmentIds.length
        ? db.select().from(schema.establishments).where(inArray(schema.establishments.id, establishmentIds))
        : Promise.resolve([]),
      access.doctorId ? db.select().from(schema.doctors).where(eq(schema.doctors.id, access.doctorId)) : Promise.resolve([])
    ]);
    const doctorPlaces =
      doctor[0] && doctor[0].affiliatedEstablishmentIds.length
        ? await db.select().from(schema.establishments).where(inArray(schema.establishments.id, doctor[0].affiliatedEstablishmentIds))
        : [];

    return c.json({
      success: true,
      data: {
        user: { id: access.user.sub, name: access.user.name, email: access.user.email, role: access.user.role },
        establishments: establishments.map(e => ({ ...e, memberRole: access.memberships.get(e.id) })),
        doctor: doctor[0] ? { ...doctor[0], establishments: doctorPlaces } : null
      }
    });
  },

  changePassword: async (c: Context) => {
    const { currentPassword, newPassword } = validBody<ChangePasswordInput>(c);
    const db = getDb();
    const session = currentUser(c)!;
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, session.sub));
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash).catch(() => false))) {
      return badRequest(c, 'Current password is not correct');
    }
    await db
      .update(schema.users)
      .set({ passwordHash: await bcrypt.hash(newPassword, 10), updatedAt: new Date() })
      .where(eq(schema.users.id, user.id));
    const token = signToken({ sub: user.id, email: user.email, name: user.name, role: user.role as UserRole });
    await recordAudit(db, session, { action: 'Changed password', entityType: 'User', entityId: user.id, entityName: user.name });
    return c.json({ success: true, data: { token } });
  },

  submitClaim: async (c: Context) => {
    const body = validBody<ClaimInput>(c);
    const db = getDb();
    const [doctor] = await db.select().from(schema.doctors).where(eq(schema.doctors.id, c.req.param('id')!));
    if (!doctor) return notFound(c, 'Doctor profile not found');
    const [link] = await db.select().from(schema.doctorLinks).where(eq(schema.doctorLinks.doctorId, doctor.id));
    if (link) return fail(c, 409, 'ALREADY_CLAIMED', 'This profile has already been claimed. Contact DocTimings if this is wrong.');

    const pending = await db
      .select()
      .from(schema.doctorClaims)
      .where(and(eq(schema.doctorClaims.doctorId, doctor.id), inArray(schema.doctorClaims.status, ['pending', 'approved'])));
    if (pending.some(p => digits(p.phone) === digits(body.phone))) {
      return fail(c, 409, 'ALREADY_REQUESTED', 'A request from this phone number is already waiting for review');
    }
    if (pending.length >= 5) return fail(c, 429, 'TOO_MANY_REQUESTS', 'Too many open requests for this profile');

    const [claim] = await db
      .insert(schema.doctorClaims)
      .values({
        id: newId('CLM'),
        doctorId: doctor.id,
        claimantName: body.claimantName,
        phone: body.phone,
        email: body.email || null,
        registrationNumber: body.registrationNumber,
        message: body.message
      })
      .returning({ id: schema.doctorClaims.id, status: schema.doctorClaims.status });

    await recordAudit(db, undefined, { action: 'Requested profile claim', entityType: 'Doctor', entityId: doctor.id, entityName: doctor.fullName, details: body.claimantName });
    return c.json({ success: true, message: 'Request received. DocTimings will call the number on record to confirm.', data: claim }, 201);
  },

  listClaims: async (c: Context) => {
    const status = c.req.query('status') || 'pending';
    const db = getDb();
    const claims = await db
      .select()
      .from(schema.doctorClaims)
      .where(status === 'all' ? sql`true` : eq(schema.doctorClaims.status, status))
      .orderBy(desc(schema.doctorClaims.createdAt));
    const doctors = claims.length
      ? await db.select().from(schema.doctors).where(inArray(schema.doctors.id, [...new Set(claims.map(cl => cl.doctorId))]))
      : [];
    const byId = new Map(doctors.map(d => [d.id, d]));
    return c.json({
      success: true,
      data: claims.map(claim => {
        const doctor = byId.get(claim.doctorId);
        return {
          ...claim,
          doctor: doctor ? { id: doctor.id, fullName: doctor.fullName, specialty: doctor.specialty, registrationNumber: doctor.registrationNumber, primaryPhone: doctor.primaryPhone } : null,
          checks: {
            registrationMatches: Boolean(doctor?.registrationNumber) && normalizeReg(doctor!.registrationNumber) === normalizeReg(claim.registrationNumber),
            phoneMatches: Boolean(doctor?.primaryPhone) && digits(doctor!.primaryPhone) === digits(claim.phone)
          }
        };
      })
    });
  },

  reviewClaim: async (c: Context) => {
    const id = c.req.param('id')!;
    const { decision, note } = validBody<ReviewClaimInput>(c);
    const db = getDb();
    const session = currentUser(c)!;
    const [claim] = await db.select().from(schema.doctorClaims).where(eq(schema.doctorClaims.id, id));
    if (!claim || claim.status !== 'pending') return notFound(c, 'Request not found or already reviewed');
    const [doctor] = await db.select().from(schema.doctors).where(eq(schema.doctors.id, claim.doctorId));
    if (decision === 'approve') {
      const [link] = await db.select().from(schema.doctorLinks).where(eq(schema.doctorLinks.doctorId, claim.doctorId));
      if (link) return fail(c, 409, 'ALREADY_CLAIMED', 'This profile already has an account');
    }

    const [updated] = await db
      .update(schema.doctorClaims)
      .set({ status: decision === 'approve' ? 'approved' : 'rejected', reviewNote: note ?? null, reviewedBy: session.sub, reviewedAt: new Date() })
      .where(and(eq(schema.doctorClaims.id, id), eq(schema.doctorClaims.status, 'pending')))
      .returning({ id: schema.doctorClaims.id });
    if (!updated) return notFound(c, 'Request not found or already reviewed');

    let invite: Awaited<ReturnType<typeof createInvitation>> | null = null;
    if (decision === 'approve') {
      await db
        .update(schema.invitations)
        .set({ revokedAt: new Date() })
        .where(and(eq(schema.invitations.doctorId, claim.doctorId), isNull(schema.invitations.usedAt), isNull(schema.invitations.revokedAt)));
      invite = await createInvitation({ kind: 'doctor', doctorId: claim.doctorId, role: 'Doctor', name: claim.claimantName, phone: claim.phone, createdBy: session.sub });
    }

    await recordAudit(db, session, {
      action: decision === 'approve' ? 'Approved profile claim' : 'Rejected profile claim',
      entityType: 'Doctor',
      entityId: claim.doctorId,
      entityName: doctor?.fullName ?? claim.doctorId,
      details: note ?? ''
    });

    return c.json({ success: true, data: { status: decision === 'approve' ? 'approved' : 'rejected', invite } });
  }
};
