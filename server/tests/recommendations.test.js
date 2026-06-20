import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../src/app.js';

const validPayload = {
  scoreRange: '580-669',
  paymentHistory: 'fair',
  utilizationRange: '30-49',
  accountCount: 4,
  recentLatePayments: 'one',
  creditGoal: 'build-score',
  timeline: '90-days'
};

describe('recommendations API', () => {
  let server;
  let baseUrl;

  before(async () => {
    server = createApp().listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it('returns a plan for a valid request', async () => {
    const response = await postRecommendation(baseUrl, validPayload);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(typeof body.profileSummary, 'string');
    assert.equal(body.actionPlan.length, 3);
    assert.ok(body.disclaimer.includes('does not provide financial'));
  });

  it('rejects missing required fields', async () => {
    const response = await postRecommendation(baseUrl, {});
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.ok(body.errors.some((error) => error.includes('scoreRange is required')));
  });

  it('rejects an invalid score range', async () => {
    const response = await postRecommendation(baseUrl, {
      ...validPayload,
      scoreRange: '900-950'
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.ok(body.errors.includes('scoreRange is invalid.'));
  });

  it('rejects invalid utilization', async () => {
    const response = await postRecommendation(baseUrl, {
      ...validPayload,
      utilizationRange: 'not-sure'
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.ok(body.errors.includes('utilizationRange is invalid.'));
  });

  it('rejects invalid timeline', async () => {
    const response = await postRecommendation(baseUrl, {
      ...validPayload,
      timeline: 'tomorrow'
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.ok(body.errors.includes('timeline is invalid.'));
  });
});

function postRecommendation(baseUrl, payload) {
  return fetch(`${baseUrl}/api/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}
