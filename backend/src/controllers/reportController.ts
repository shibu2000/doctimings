import type { Context } from 'hono';
import { memoryStore } from '../db/index.js';
import { CreateReportInput, UpdateReportInput } from '../validators/reportValidator.js';
import { JWTPayload } from '../types/index.js';

export const reportController = {
  submitReport: async (c: Context) => {
    const body = (c.get('validatedBody') || (await c.req.json())) as CreateReportInput;
    const user = c.get('user') as JWTPayload | undefined;

    const newReport = {
      id: `RPT-${Date.now().toString().slice(-6)}`,
      doctorId: body.doctorId || null,
      establishmentId: body.establishmentId || null,
      issueType: body.issueType,
      issueTitle: body.issueTitle,
      description: body.description,
      severity: body.severity || 'medium',
      status: 'pending',
      source: user ? 'Registered User' : 'Mobile App Patient',
      reporterPhone: body.reporterPhone || null,
      resolutionNotes: null,
      createdAt: new Date().toISOString()
    };

    memoryStore.reports.unshift(newReport);

    memoryStore.auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actorId: user?.sub || 'GUEST',
      actorName: user?.name || 'Public Patient',
      action: 'Create',
      entityType: 'Report',
      entityId: newReport.id,
      entityName: newReport.issueTitle,
      details: `Crowdsourced report filed: ${newReport.issueType}`
    });

    return c.json(
      {
        success: true,
        message: 'Report submitted successfully. Our operations team will verify this promptly.',
        data: newReport
      },
      201
    );
  },

  getReports: async (c: Context) => {
    const status = c.req.query('status');
    const severity = c.req.query('severity');
    const issueType = c.req.query('issueType');
    const doctorId = c.req.query('doctorId');
    const establishmentId = c.req.query('establishmentId');
    const page = Number(c.req.query('page')) || 1;
    const limit = Number(c.req.query('limit')) || 20;

    let list = [...memoryStore.reports];

    if (status && status !== 'All') {
      list = list.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }

    if (severity && severity !== 'All') {
      list = list.filter(r => r.severity.toLowerCase() === severity.toLowerCase());
    }

    if (issueType && issueType !== 'All') {
      list = list.filter(r => r.issueType.toLowerCase() === issueType.toLowerCase());
    }

    if (doctorId) {
      list = list.filter(r => r.doctorId === doctorId);
    }

    if (establishmentId) {
      list = list.filter(r => r.establishmentId === establishmentId);
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paged = list.slice(startIndex, startIndex + limit);

    const enriched = paged.map(r => {
      const doc = r.doctorId ? memoryStore.doctors.find(d => d.id === r.doctorId) : null;
      const est = r.establishmentId ? memoryStore.establishments.find(e => e.id === r.establishmentId) : null;

      return {
        ...r,
        doctorName: doc ? doc.fullName : null,
        doctorSpecialty: doc ? doc.specialty : null,
        establishmentName: est ? est.name : null
      };
    });

    return c.json({
      success: true,
      data: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  },

  getReportById: async (c: Context) => {
    const id = c.req.param('id');
    const report = memoryStore.reports.find(r => r.id === id);

    if (!report) {
      return c.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Report ${id} not found`
          }
        },
        404
      );
    }

    const doc = report.doctorId ? memoryStore.doctors.find(d => d.id === report.doctorId) : null;
    const est = report.establishmentId ? memoryStore.establishments.find(e => e.id === report.establishmentId) : null;

    return c.json({
      success: true,
      data: {
        ...report,
        doctor: doc || null,
        establishment: est || null
      }
    });
  },

  updateReportStatus: async (c: Context) => {
    const id = c.req.param('id');
    const body = (c.get('validatedBody') || (await c.req.json())) as UpdateReportInput;
    const user = c.get('user') as JWTPayload | undefined;

    const report = memoryStore.reports.find(r => r.id === id);
    if (!report) {
      return c.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Report ${id} not found`
          }
        },
        404
      );
    }

    report.status = body.status;
    if (body.resolutionNotes) {
      report.resolutionNotes = body.resolutionNotes;
    }

    memoryStore.auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actorId: user?.sub || 'SYSTEM',
      actorName: user?.name || 'Administrator',
      action: 'Update',
      entityType: 'Report',
      entityId: id || '',
      entityName: report.issueTitle,
      details: `Report status updated to ${body.status}`
    });

    return c.json({
      success: true,
      message: `Report status updated to ${body.status}`,
      data: report
    });
  }
};
