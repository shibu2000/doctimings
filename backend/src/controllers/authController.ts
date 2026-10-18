import bcrypt from 'bcryptjs';
import type { Context } from 'hono';
import { eq, sql } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import { signToken } from '../middleware/auth.js';
import { LoginInput, RegisterInput, CreateUserInput, UpdateUserInput } from '../validators/authValidator.js';
import { recordAudit } from '../lib/audit.js';
import { currentUser, fail, newId, notFound, validBody } from '../lib/http.js';
import type { UserRole } from '../types/index.js';
import { revokeInvitesCreatedBy } from './accessController.js';

type User = typeof schema.users.$inferSelect;

const publicUser = (u: User) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  status: u.status,
  lastActive: u.lastActive
});

const findByEmail = async (email: string) => {
  const [user] = await getDb()
    .select()
    .from(schema.users)
    .where(sql`lower(${schema.users.email}) = ${email.toLowerCase()}`);
  return user;
};

const issueToken = (u: User) => signToken({ sub: u.id, email: u.email, name: u.name, role: u.role as UserRole });

let dummyHash: Promise<string> | null = null;
const burnPasswordCheck = async (password: string) => {
  dummyHash ??= bcrypt.hash('placeholder-password-never-used', 10);
  await bcrypt.compare(password, await dummyHash).catch(() => false);
};

const invalidCredentials = (c: Context) => fail(c, 401, 'INVALID_CREDENTIALS', 'Invalid email address or password');

export const authController = {
  login: async (c: Context) => {
    const { email, password } = validBody<LoginInput>(c);
    const db = getDb();
    const user = await findByEmail(email);
    if (!user) {
      await burnPasswordCheck(password);
      return invalidCredentials(c);
    }

    const valid = await bcrypt.compare(password, user.passwordHash).catch(() => false);
    if (!valid) return invalidCredentials(c);
    if (user.status !== 'Active') {
      return fail(c, 403, 'ACCOUNT_SUSPENDED', 'This account has been suspended');
    }

    const lastActive = new Date().toISOString();
    await db.update(schema.users).set({ lastActive }).where(eq(schema.users.id, user.id));
    await recordAudit(db, { sub: user.id, name: user.name }, {
      action: 'Signed in',
      entityType: 'User',
      entityId: user.id,
      entityName: user.name
    });

    return c.json({ success: true, data: { token: issueToken(user), user: publicUser({ ...user, lastActive }) } });
  },

  register: async (c: Context) => {
    const data = validBody<RegisterInput>(c);
    if (await findByEmail(data.email)) {
      return fail(c, 409, 'EMAIL_ALREADY_EXISTS', 'An account with this email address already exists');
    }

    const [user] = await getDb()
      .insert(schema.users)
      .values({
        id: newId('USR'),
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        passwordHash: await bcrypt.hash(data.password, 10),
        role: 'Patient',
        status: 'Active',
        lastActive: new Date().toISOString()
      })
      .returning();

    return c.json({ success: true, data: { token: issueToken(user), user: publicUser(user) } }, 201);
  },

  me: async (c: Context) => {
    const session = currentUser(c)!;
    const [user] = await getDb().select().from(schema.users).where(eq(schema.users.id, session.sub));
    if (!user) return notFound(c, 'User account not found');
    return c.json({ success: true, data: publicUser(user) });
  },

  getUsers: async (c: Context) => {
    const users = await getDb().select().from(schema.users).orderBy(schema.users.name);
    return c.json({ success: true, data: users.map(publicUser) });
  },

  createUser: async (c: Context) => {
    const data = validBody<CreateUserInput>(c);
    const db = getDb();
    if (await findByEmail(data.email)) {
      return fail(c, 409, 'EMAIL_ALREADY_EXISTS', 'An account with this email address already exists');
    }

    const [user] = await db
      .insert(schema.users)
      .values({
        id: newId('USR'),
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        passwordHash: await bcrypt.hash(data.password, 10),
        role: data.role,
        status: 'Active'
      })
      .returning();

    await recordAudit(db, currentUser(c), {
      action: 'Added team member',
      entityType: 'User',
      entityId: user.id,
      entityName: user.name,
      details: user.role
    });

    return c.json({ success: true, data: publicUser(user) }, 201);
  },

  updateUser: async (c: Context) => {
    const id = c.req.param('id')!;
    const { password, ...updates } = validBody<UpdateUserInput>(c);
    const db = getDb();
    const session = currentUser(c)!;

    const [existing] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    if (!existing) return notFound(c, 'User account not found');
    if (id === session.sub && (updates.status === 'Suspended' || (updates.role && updates.role !== existing.role))) {
      return fail(c, 400, 'VALIDATION_ERROR', 'You cannot suspend or change the role of your own account');
    }

    const [user] = await db
      .update(schema.users)
      .set({
        ...updates,
        ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, id))
      .returning();

    if (updates.status === 'Suspended') await revokeInvitesCreatedBy(id);

    await recordAudit(db, session, {
      action: 'Updated team member',
      entityType: 'User',
      entityId: id,
      entityName: user.name,
      details: [...Object.keys(updates), ...(password ? ['password'] : [])].join(', ')
    });

    return c.json({ success: true, data: publicUser(user) });
  }
};
