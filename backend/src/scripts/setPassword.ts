import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema.js';

const [email, password] = process.argv.slice(2);
const url = process.env.DATABASE_URL;

if (!email || !password || password.length < 8) {
  console.error('Usage: npm run user:password -- <email> <new password (8+ characters)>');
  process.exit(1);
}
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = postgres(url, { max: 1 });
const db = drizzle(client, { schema });

const run = async () => {
  const passwordHash = await bcrypt.hash(password, 10);
  const updated = await db
    .update(schema.users)
    .set({ passwordHash, status: 'Active', updatedAt: new Date() })
    .where(sql`lower(${schema.users.email}) = ${email.toLowerCase()}`)
    .returning({ id: schema.users.id, role: schema.users.role });
  if (!updated.length) {
    console.error(`No user found with email ${email}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Password updated for ${email} (${updated[0].role}) on ${new URL(url).host}`);
};

run()
  .catch(err => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => client.end());
