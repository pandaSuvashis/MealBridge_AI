import assert from 'node:assert/strict';
import { once } from 'node:events';
import express from 'express';
import test from 'node:test';
import { requireSupabaseAuth } from '../src/middleware/auth.js';

test('protected API requests reject missing bearer tokens', async () => {
  const app = express();
  app.use('/api', requireSupabaseAuth);
  app.get('/api/private', (_req, res) => res.json({ success: true }));

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/private`);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
      success: false,
      error: { code: 'AUTH_REQUIRED', message: 'Sign in to access this resource.' },
    });
  } finally {
    server.close();
    await once(server, 'close');
  }
});
