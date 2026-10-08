# CP11 acceptance — 8 October 2026

**Fictional native wrapper preparation complete. Binary/toolchain and device testing skipped at the owner's request.** `C01-07` remains partial/unchecked; overall **124 checked / 27 open**. Deployment stays held.

## Delivered

Android and iOS source projects generated with pinned Capacitor 8.4.3, App 8.1.2 and Local Notifications 8.3.1. Separate `dist-native` build forces fictional mode, redirects root/sandbox entry to the demo, strips developer Supabase/backend configuration and starts new sessions at the documented 20:30 Malaysia scenario. The packaged demo hides the browser's real-app exit link.

Implemented restricted demo deep links, back/modal handling, pause/visibility cancellation of microphone tracks and speech operations, explicit local-notification grant/deny/clear flow, iOS usage descriptions and safe-area CSS. Android microphone/notification permissions are explicit; app backup disabled. SPM dependency paths generated on Windows are normalised after sync for transfer to macOS. See [native guide](CP11_NATIVE_GUIDE.md).

Connected native Auth/API origins, real Auth links and remote push are not configured in the isolated fictional package. No native API key is needed for this preparation. Browser connected services retain their existing configuration.

## Phase-end gate

After implementation, ESLint, TypeScript/native and browser production builds, Android/iOS source generation and sync, source/config/copied-index parity, native/browser credential scans and repository secret scan passed. Final dependency audit reported zero vulnerabilities after pinning 8.4.3; 8.5.3 initially introduced a CLI xcode/uuid finding.

**57 distinct frontend tests passed** across native policy/permissions, recorder, voice workflow, freshness and browser push. Six are new native checks: approved versus rejected scheme paths, forced fictional mode/evening scenario, denied notification without re-prompt, explicit granted local test, browser native-permission refusal and late microphone grant after pause. Existing safety regressions cover independent batch times and clearance expiry. These are software/mock checks, not device evidence.

```powershell
npm run lint --workspace apps/web
npm run test --workspace apps/web -- src/native/native.test.ts src/voice/recorder.test.ts src/voice/workflow.test.ts src/freshness/engine.test.ts src/advanced/push.test.ts
npm run native:build
npm run native:sync
node scripts/check-native-config.cjs
node scripts/check-web-secrets.cjs --native
npm run build
node scripts/check-web-secrets.cjs
node scripts/check-repo-secrets.cjs
```

Focused repairs: initial TypeScript failure used an incomplete delivered-notification object; changed to the plugin's ID-based removal. Browser rehearsal found late-night seeded promotion initialization failing; native mode now sets the fictional evening clock. Removed misleading real-app exit from the package, normalised Swift paths and finished pause UI cleanup. Only affected native/recorder tests and builds were repeated; passed broader domain tests were not rerun. Existing Zod annotation and bundle-size warnings remain; WASM is approximately 26.9 MB before compression and intended-device speech performance is unmeasured.

## Browser source preview

Separate local preview on port 5175: root redirected to `/demo/discover`; `/sandbox/profile` also redirected to the demo and loaded 31 fictional stalls. Native test panel displayed, with notification permission control disabled in a browser. No OS permission was requested. This is browser execution of the packaged bundle, not an Android/iOS launch. [Screenshot](screenshots/cp11-native-preview.png).

Final source checks also parsed the Android manifest and iOS plist successfully. Generated bundles and copied platform assets are excluded from Git; source projects remain reviewable.

## Skipped and pending

Android Studio, SDK and Java were absent from the inspected command path and normal installation locations. No SDK installation, Gradle compilation, APK, device install or remote build was attempted after the owner said “Skip this.” Windows cannot compile the iOS project; Mac/Xcode, simulator/iPhone, signing and actual permission/keyboard/offline/native delivery checks remain pending. Resume using the [device matrix](CP11_NATIVE_GUIDE.md). No database migration, real referral, hosting or store submission occurred.

Final handoff review (8 October 2026): React listener cleanup, explicit permission controls, fixture routing and source/document consistency reviewed. No further source repair was required, so successful phase tests/builds were not repeated. The interrupted turn did not invalidate the recorded 57-case software gate. Device/toolchain work remains skipped as requested.
