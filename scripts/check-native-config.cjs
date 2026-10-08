// Offline source configuration gate; no SDK, binary or device claim.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../apps/web');
const config = JSON.parse(fs.readFileSync(path.join(root, 'capacitor.config.json'), 'utf8'));
assert.equal(config.webDir, 'dist-native');
assert.equal(config.appId, 'com.pasarmalam.localdemo');
assert.equal(config.server.url, undefined);
assert.equal(config.server.cleartext, undefined);
assert.equal(config.server.allowNavigation, undefined);
assert.equal(config.android.allowMixedContent, false);
const android = fs.readFileSync(path.join(root, 'android/app/src/main/AndroidManifest.xml'), 'utf8');
assert.match(android, /android:allowBackup="false"/);
assert.match(android, /android.permission.RECORD_AUDIO/);
assert.match(android, /android.permission.POST_NOTIFICATIONS/);
assert.match(android, /android:scheme="pasarmalam-demo" android:host="demo"/);
assert.doesNotMatch(android, /MANAGE_EXTERNAL_STORAGE|ACCESS_BACKGROUND_LOCATION|SCHEDULE_EXACT_ALARM|usesCleartextTraffic="true"/);
const ios = fs.readFileSync(path.join(root, 'ios/App/App/Info.plist'), 'utf8');
assert.match(ios, /NSMicrophoneUsageDescription/);
assert.match(ios, /pasarmalam-demo/);
assert.doesNotMatch(ios, /NSAllowsArbitraryLoads/);
const spm = fs.readFileSync(path.join(root, 'ios/App/CapApp-SPM/Package.swift'), 'utf8');
for (const match of spm.matchAll(/path: "([^"\r\n]+)"/g)) {
  assert.ok(!match[1].includes('\\'), 'SPM paths must be portable Swift strings');
  assert.ok(fs.existsSync(path.resolve(root, 'ios/App/CapApp-SPM', match[1], 'Package.swift')), 'Referenced plugin package must exist');
}
for (const target of ['android/app/src/main/assets/public', 'ios/App/App/public']) {
  assert.equal(fs.readFileSync(path.join(root, target, 'index.html'), 'utf8'), fs.readFileSync(path.join(root, 'dist-native/index.html'), 'utf8'));
}
console.log('Native source/config and copied index parity passed; binaries/devices remain unverified.');
