import { afterAll, beforeAll } from 'vitest';
import { setDb } from '../src/db/index.js';
import { createLocalDb } from '../src/db/local.js';
import * as schema from '../src/db/schema.js';
import { OWNER_PASSWORD } from './helpers.js';

process.env.JWT_SECRET = 'test-secret-value-that-is-long-enough';

let close: (() => Promise<void>) | undefined;

beforeAll(async () => {
  const local = await createLocalDb({ ownerPassword: OWNER_PASSWORD });
  setDb(local.db);
  close = local.close;
  const past = new Date(Date.now() - 60_000);
  await local.db.insert(schema.users).values([
    { id: 'USR-STAFF-TEST', name: 'Test Staff', email: 'staff-test@example.com', phone: '9000000002', passwordHash: 'x', role: 'Staff', status: 'Active', updatedAt: past },
    { id: 'USR-PATIENT-TEST', name: 'Test Patient', email: 'patient-test@example.com', phone: '9000000003', passwordHash: 'x', role: 'Patient', status: 'Active', updatedAt: past }
  ]);
  await local.db.update(schema.users).set({ updatedAt: past });
});

afterAll(async () => {
  await close?.();
});
