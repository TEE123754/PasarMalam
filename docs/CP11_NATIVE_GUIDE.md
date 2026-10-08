# CP11 — local native app preparation

8 October 2026. The owner requested skipping device/toolchain testing. Android and iOS source projects are prepared; no APK, installed Android acceptance, compiled iOS app or OS delivery is claimed. Deployment and store publication remain held.

## What is built

React/TypeScript/Vite inside Capacitor **8.4.3**, with official App **8.1.2** and Local Notifications **8.3.1** plugins. This pinned CLI avoids the xcode/uuid dependency findings observed on 8.5.3; the final npm audit has zero findings.

- `apps/web/android`: Android project, minimum SDK 24, compile/target SDK 36. Microphone and optional Android 13+ notification permissions; broad filesystem, background location, exact alarm and cleartext permissions are absent. Image selection uses the system picker. Android app backup is disabled for local demo state.
- `apps/web/ios`: Xcode project with Swift Package Manager dependency references; microphone/camera/picture-library explanations and the demo URL scheme. macOS/Xcode is still required to compile it.
- `apps/web/dist-native`: bundled fictional demo, separate from the browser `dist`. Native mode redirects root/sandbox entry to `/demo/discover`, forces fixture mode and strips Supabase/backend settings inherited from `.env`. The wrapper has no remote live-reload URL or connected Auth session.
- Back navigation, restricted `pasarmalam-demo://demo/...` links, recording cancellation on pause/visibility loss, safe-area padding and an explicit local notification test. No automatic permission request occurs on launch. Notification taps open current in-app alerts; the generic test contains no food deadline, location or private batch details.

The local native package supports fictional workflows. Hosted extraction and connected account operations are unavailable in this package; use typed review and chips. Maps and speech model downloads need internet. Native WebView speech memory/performance, image capture, keyboard layout and `navigator.locks` support must be checked on the intended devices. Existing browser tests do not prove these.

## Commands now available

From the repository root:

```powershell
npm run native:build
npm run native:sync
npm run native:preview
```

The preview is at `http://127.0.0.1:5175/demo/discover`. It checks the packaged JavaScript in a browser; it is not an installed native app. Build/sync need only Node/npm. Do not run the ordinary browser build and assume its connected environment belongs in the native package.

## Resume Android testing later

1. Install a compatible Android Studio and SDK with platform 36, platform-tools and build tools. Use its bundled Java runtime. This was skipped here; no installer or global toolchain setting was changed. [Official environment setup](https://capacitorjs.com/docs/getting-started/environment-setup).
2. Run `npm run native:build` and `npm run native:sync`. Open `apps/web/android` in Android Studio. Let Gradle resolve its pinned dependencies, then build a debug APK. The command-line equivalent, from that folder with the SDK/JDK configured, is `./gradlew.bat assembleDebug`.
3. The expected output is `app/build/outputs/apk/debug/app-debug.apk`; confirm the file exists and record its SHA-256 before claiming a build.
4. Connect a consenting test device with USB debugging; install the debug APK. Record model, Android/WebView versions and actual results in the matrix below.
5. Test the custom scheme with `adb shell am start -a android.intent.action.VIEW -d "pasarmalam-demo://demo/hawker/voice" com.pasarmalam.localdemo`. Reject token-bearing, external and unsupported links. Real Auth deep links are deliberately outside the fictional package scope.

## Resume iOS testing later

Use a Mac with compatible Xcode and its command-line tools. Run `npm ci`, `npm run native:build` and `npm run native:sync`; open `apps/web/ios/App/App.xcodeproj`. Resolve SPM packages and build/run the App scheme on a supported simulator. An actual iPhone needs the appropriate signing team and device setup. Record actual compiler output and simulator/device evidence. Windows generation of this project is source preparation only. [Official iOS configuration](https://capacitorjs.com/docs/ios/configuration).

Signing, TestFlight/store submission, public distribution and hosted origins follow a separately requested release. No paid cloud build or account purchase is needed for the preparation completed here.

## One phase-end device matrix when testing resumes

| Journey | Required evidence | Current state |
|---|---|---|
| Android/iOS debug binary and launch | Artifact hash, tool versions, actual installed/simulator launch | Skipped / pending |
| Mode isolation/restart | Root/sandbox resolves demo; no real Auth/database call; demo persistence after restart | Software checks only |
| Back, modal and deep links | Back dismisses modal/navigates; root exit confirmation; accepted/rejected custom links | Link policy tested; OS back/modal awaiting device |
| Microphone grant/deny/pause | Explicit grant, transcription or clear fallback, denied typing/chips, background stops tracks | Mocked cleanup checks only |
| Images | System picker/camera grant/deny/cancel, file validation, no broad library permission | Pending device |
| Notifications | User-triggered local test, deny/clear, actual banner/list receipt and destination | Mocked permission checks only |
| Offline and restart | Bundled shell loads; unavailable network services give fallback; no deferred real write | Pending device |
| Keyboard and safe areas | Small phone/notch/rotation, no hidden field or submit action | Pending device |
| Batch/expiry integrity | Independent preparation times, deterministic cutoffs, expired offers stop after resume | Existing domain tests; pending device |
| Connected API/Auth and native remote push | Separate approved connected build, origin/redirect/privacy setup and consented receipt | Outside fictional package; pending |

The local notification plugin schedules on the device; it does not implement server push or prove a safety timer. Native remote push requires its own provider setup and actual receipt evidence. [Official local notification API](https://capacitorjs.com/docs/apis/local-notifications).
