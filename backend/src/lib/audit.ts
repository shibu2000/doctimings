import type { Database } from '../db/index.js';
import * as schema from '../db/schema.js';
import type { JWTPayload } from '../types/index.js';
import { newId } from './http.js';

export interface AuditEntry {
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  details?: string;
}

export const recordAudit = async (db: Database, actor: Pick<JWTPayload, 'sub' | 'name'> | undefined, entry: AuditEntry) => {
  await db.insert(schema.auditLogs).values({
    id: newId('LOG'),
    actorId: actor?.sub ?? 'PUBLIC',
    actorName: actor?.name ?? 'Public user',
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    entityName: entry.entityName.slice(0, 150),
    details: entry.details ?? ''
  });
};
