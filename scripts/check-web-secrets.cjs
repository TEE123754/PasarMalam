const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const item = path.join(dir, entry.name);
  return entry.isDirectory() ? files(item) : [item];
});
const envFile = path.join(root, 'apps/api/.env');
const secrets = fs.existsSync(envFile) ? fs.readFileSync(envFile, 'utf8').split(/\r?\n/).flatMap((line) => {
  const match = line.match(/^(?:SUPABASE_SECRET_KEY|SUPABASE_JWT_SECRET|DATABASE_URL|DEMO_SEED_PASSWORD|MORPHEUS_API_KEY|LOCAL_LLM_KEY|VAPID_PRIVATE_KEY|MEDIA_SIGNING_SECRET|AGENT_DISPATCH_SECRET|AGENT_DATABASE_PASSWORD)\s*=\s*(.+)$/);
  return match ? [match[1].trim().replace(/^['"]|['"]$/g, '')].filter((value) => value.length >= 12) : [];
}) : [];
let violations = 0;
for (const file of files(path.join(root, 'apps/web/dist'))) {
  if (!/\.(?:js|html|css|json|map)$/.test(file)) continue;
  const data = fs.readFileSync(file, 'utf8');
  let unsafe = /sb_secret_[A-Za-z0-9_-]{10,}/.test(data) || secrets.some((secret) => data.includes(secret));
  for (const jwt of data.matchAll(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)) {
    try { unsafe ||= JSON.parse(Buffer.from(jwt[0].split('.')[1], 'base64url')).role === 'service_role'; } catch { /* Non-token strings are ignored. */ }
  }
  if (unsafe) { violations++; console.error(`Privileged credential detected in ${path.relative(root, file)}`); }
}
if (violations) process.exit(1);
console.log('Frontend credential scan passed (configured private values and privileged token formats).');
