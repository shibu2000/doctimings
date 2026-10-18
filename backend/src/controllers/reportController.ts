import type { Context } from 'hono';
import { desc, eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import { CreateReportInput, UpdateReportInput } from '../validators/reportValidator.js';
import { recordAudit } from '../lib/audit.js';
import { currentUser, newId, notFound, paginate, validBody } from '../lib/http.js';

const withNames = async <T extends { doctorId: string | null; establishmentId: string | null }>(reports: T[]) => {
  const db = getDb();
  const [doctors, establishments] = await Promise.all([
    db.select({ id: schema.doctors.id, name: schema.doctors.fullName, specialty: schema.doctors.specialty }).from(schema.doctors),
    db.select({ id: schema.establishments.id, name: schema.establishments.name }).from(schema.establishments)
  ]);
  const doctorMap = new Map(doctors.map(d => [d.id, d]));
  const establishmentMap = new Map(establishments.map(e => [e.id, e.name]));
  return reports.map(r => ({
    ...r,
    doctorName: (r.doctorId && doctorMap.get(r.doctorId)?.name) || null,
    doctorSpecialty: (r.doctorId && doctorMap.get(r.doctorId)?.specialty) || null,
    establishmentName: (r.establishmentId && establishmentMap.get(r.establishmentId)) || null
  }));
};

export const reportController = {
  submitReport: async (c: Context) => {
    const body = validBody<CreateReportInput>(c);
    const user = currentUser(c);
    const db = getDb();

    const [report] = await db
      .insert(schema.reports)
      .values({
        id: newId('RPT'),
        doctorId: body.doctorId || null,
        establishmentId: body.establishmentId || null,
        issueType: body.issueType,
        issueTitle: body.issueTitle,
        description: body.description,
        severity: body.severity,
        status: 'pending',
        source: user ? 'Registered User' : 'Mobile App Patient',
        reporterPhone: body.reporterPhone || null
      })
      .returning();

    await recordAudit(db, user, {
      action: 'Submitted report',
      entityType: 'Report',
      entityId: report.id,
      entityName: report.issueTitle,
      details: report.issueType
    });

    return c.json(
      {
        success: true,
        message: 'Report submitted successfully. Our operations team will verify this promptly.',
        data: report
      },
      201
    );
  },

  getReports: async (c: Context) => {
    const { status, severity, issueType, doctorId, establishmentId } = c.req.query();
    const page = Number(c.req.query('page')) || 1;
    const limit = Math.min(Number(c.req.query('limit')) || 20, 500);
    const matches = (value: string, filter?: string) =>
      !filter || filter === 'All' || value.toLowerCase() === filter.toLowerCase();

    const list = (await getDb().select().from(schema.reports).orderBy(desc(schema.reports.createdAt))).filter(
      r =>
        matches(r.status, status) &&
        matches(r.severity, severity) &&
        matches(r.issueType, issueType) &&
        (!doctorId || r.doctorId === doctorId) &&
        (!establishmentId || r.establishmentId === establishmentId)
    );

    const result = paginate(list, page, limit);
    return c.json({ success: true, data: await withNames(result.data), pagination: result.pagination });
  },

  getReportById: async (c: Context) => {
    const id = c.req.param('id')!;
    const db = getDb();
    const [report] = await db.select().from(schema.reports).where(eq(schema.reports.id, id));
    if (!report) return notFound(c, `Report ${id} was not found`);

    const [[doctor], [establishment]] = await Promise.all([
      report.doctorId ? db.select().from(schema.doctors).where(eq(schema.doctors.id, report.doctorId)) : Promise.resolve([]),
      report.establishmentId
        ? db.select().from(schema.establishments).where(eq(schema.establishments.id, report.establishmentId))
        : Promise.resolve([])
    ]);

    return c.json({ success: true, data: { ...report, doctor: doctor ?? null, establishment: establishment ?? null } });
  },

  updateReportStatus: async (c: Context) => {
    const id = c.req.param('id')!;
    const body = validBody<UpdateReportInput>(c);
    const db = getDb();
    const [existing] = await db.select().from(schema.reports).where(eq(schema.reports.id, id));
    if (!existing) return notFound(c, `Report ${id} was not found`);

    const [report] = await db
      .update(schema.reports)
      .set({
        status: body.status,
        ...(body.resolutionNotes !== undefined ? { resolutionNotes: body.resolutionNotes } : {}),
        updatedAt: new Date()
      })
      .where(eq(schema.reports.id, id))
      .returning();

    await recordAudit(db, currentUser(c), {
      action: `Report ${body.status}`,
      entityType: 'Report',
      entityId: id,
      entityName: report.issueTitle,
      details: body.resolutionNotes ?? ''
    });

    return c.json({ success: true, message: `Report status updated to ${body.status}`, data: report });
  }
};
