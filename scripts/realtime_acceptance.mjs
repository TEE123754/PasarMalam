/** Explicit two-client connected acceptance; restores its fictional stall edit. */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

process.loadEnvFile('apps/api/.env');
const env = process.env;
assert.equal(env.APP_ENV, 'demo');
assert.equal(new URL(env.SUPABASE_URL).hostname, `${env.DEMO_PROJECT_REF}.supabase.co`);
const clients = Array.from({ length: 3 }, () => createClient(
  env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
));
const sessions = [];
const channels = [];
let original;
let modified = false;
const evidence = { clients: 2, status: 'failed', transport: 'Supabase Postgres Changes' };
let stage = 'sign-in';
const deadline = (promise, ms, reason) => {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(reason)), ms);
  })]).finally(() => clearTimeout(timer));
};
const api = async (path, token, body) => {
  const response = await fetch(`http://127.0.0.1:8010/api/v1/${path}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body ? { method: 'POST', body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, 200, `Local ${path} status`);
  return response.json();
};
const edit = (data) => api('vendor/command', sessions[2].access_token, {
  kind: 'stall', data, request_id: crypto.randomUUID(),
});
try {
  for (const [index, name] of ['customer-a', 'customer-b', 'vendor-a'].entries()) {
    const { data, error } = await clients[index].auth.signInWithPassword({
      email: `${name}@pasarmalam.invalid`, password: env.DEMO_SEED_PASSWORD,
    });
    assert.equal(error, null, 'Fictional sign-in failed');
    sessions.push(data.session);
  }
  stage = 'workspace';
  const workspace = await api('vendor/workspace', sessions[2].access_token);
  original = workspace.stalls.find(stall => stall.id === '4a2c665e-4c74-5add-9b2a-e84b3d40534f');
  assert.ok(original, 'Expected acceptance foundation stall');
  // PostgreSQL time projections may include seconds; the editable form uses HH:mm.
  original.opens = original.opens.slice(0, 5);
  original.closes = original.closes.slice(0, 5);
  const events = [[], []];
  let started;
  let acknowledge;
  const bothReceived = new Promise(resolve => { acknowledge = resolve; });
  stage = 'subscribe';
  await Promise.all(clients.slice(0, 2).map(async (client, index) => {
    await client.realtime.setAuth(sessions[index].access_token);
    const channel = client.channel(`acceptance-${crypto.randomUUID()}`);
    channels.push([client, channel]);
    await deadline(new Promise((resolve, reject) => {
      channel.on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'discovery_versions',
        filter: `market_id=eq.${original.market_id}`,
      }, payload => {
        assert.deepEqual(Object.keys(payload.new).sort(), ['market_id', 'updated_at', 'version']);
        events[index].push({ version: payload.new.version, elapsedMs: Date.now() - started });
        if (events.every(rows => rows.length)) acknowledge();
      }).subscribe(status => {
        if (status === 'SUBSCRIBED') resolve();
        if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) reject(new Error('Realtime subscription unavailable'));
      });
    }), 15000, 'Realtime subscription timeout');
  }));
  started = Date.now();
  stage = 'edit';
  await edit({ ...original, open: !original.open });
  modified = true;
  stage = 'receive';
  await deadline(bothReceived, 15000, 'Two-client event timeout');
  assert.equal(events[0][0].version, events[1][0].version);
  const updated = await api('vendor/workspace', sessions[2].access_token);
  assert.equal(updated.stalls.find(row => row.id === original.id).open, !original.open);
  evidence.status = 'passed';
  evidence.events = events.map(rows => rows[0]);
  evidence.payload = 'market_id/version/updated_at only';
} catch (error) {
  evidence.status = 'failed; inspect service connectivity and subscription configuration';
  evidence.stage = stage;
  evidence.reason = error instanceof assert.AssertionError ? error.message : 'Connection/event timeout';
  process.exitCode = 1;
} finally {
  if (modified) {
    try { await edit(original); evidence.restored = true; }
    catch { evidence.restored = false; process.exitCode = 1; }
  }
  await Promise.all(channels.map(([client, channel]) => client.removeChannel(channel)));
  await Promise.all(clients.map(client => client.auth.signOut({ scope: 'local' })));
  for (const client of clients) client.realtime.disconnect();
  await mkdir('.local-acceptance', { recursive: true });
  await writeFile('.local-acceptance/realtime.json', JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence));
  // The SDK can retain a reconnect timer even after disconnect in Node.
  process.exit(process.exitCode ?? 0);
}
