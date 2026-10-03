import { describe, it, expect } from 'vitest';
import { app } from '../../src/index.js';
import { getAdminAuthHeader } from '../helpers.js';

describe('Reports & Crowdsourced Feedback API Integration Tests', () => {
  it('should allow public users to submit discrepancy reports', async () => {
    const res = await app.request('/api/v1/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId: 'DOC-BWN-101',
        establishmentId: 'EST-BWN-842',
        issueType: 'doc_unavailable',
        issueTitle: 'Doctor chamber closed earlier than scheduled',
        description: 'Visited clinic at 19:15 but assistant said doctor had left early today.',
        severity: 'medium',
        reporterPhone: '+91 98321 55555'
      })
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBeDefined();
    expect(body.data.status).toBe('pending');
  });

  it('should allow admin to inspect and update report status', async () => {
    const listRes = await app.request('/api/v1/reports', {
      method: 'GET',
      headers: getAdminAuthHeader()
    });

    expect(listRes.status).toBe(200);
    const listBody = await listRes.json();
    expect(listBody.success).toBe(true);
    expect(listBody.data.length).toBeGreaterThan(0);

    const reportId = listBody.data[0].id;

    const updateRes = await app.request(`/api/v1/reports/${reportId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify({
        status: 'verified',
        resolutionNotes: 'Verified with clinic compounder over phone call.'
      })
    });

    expect(updateRes.status).toBe(200);
    const updateBody = await updateRes.json();
    expect(updateBody.data.status).toBe('verified');
  });
});
