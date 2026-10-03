import { describe, it, expect } from 'vitest';
import { app } from '../../src/index.js';

describe('Health & Education API Integration Tests', () => {
  it('should return server health and diagnostic stats', async () => {
    const res = await app.request('/api/v1/health');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.version).toBe('1.0.0');
    expect(body.database.status).toBe('healthy');
    expect(body.database.records.doctors).toBeGreaterThan(0);
  });

  it('should list health educational topics and articles', async () => {
    const topicsRes = await app.request('/api/v1/health/topics');
    expect(topicsRes.status).toBe(200);
    const topicsBody = await topicsRes.json();
    expect(topicsBody.success).toBe(true);
    expect(topicsBody.data.length).toBeGreaterThan(0);

    const articlesRes = await app.request('/api/v1/health/articles');
    expect(articlesRes.status).toBe(200);
    const articlesBody = await articlesRes.json();
    expect(articlesBody.success).toBe(true);
    expect(articlesBody.data.length).toBeGreaterThan(0);

    const slug = articlesBody.data[0].slug;
    const articleRes = await app.request(`/api/v1/health/articles/${slug}`);
    expect(articleRes.status).toBe(200);
    const articleBody = await articleRes.json();
    expect(articleBody.success).toBe(true);
    expect(articleBody.data.slug).toBe(slug);
  });
});
