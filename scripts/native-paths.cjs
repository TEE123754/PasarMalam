// Capacitor on Windows emits backslashes inside Swift string literals.
// Normalize only generated SPM path strings so the source can move to a Mac.
const fs = require('node:fs');
const path = require('node:path');
const file = path.resolve(__dirname, '../apps/web/ios/App/CapApp-SPM/Package.swift');
if (fs.existsSync(file)) {
  const original = fs.readFileSync(file, 'utf8');
  const portable = original.replace(/path: "([^"\r\n]+)"/g, (_, value) => `path: "${value.replaceAll('\\', '/')}"`);
  if (portable !== original) fs.writeFileSync(file, portable);
}
console.log('Native generated Swift dependency paths normalised for macOS.');
