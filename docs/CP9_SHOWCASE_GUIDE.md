# CP9 — English showcase, recording and rehearsal guide

Prepared 8 October 2026. Stay local. Do not submit/publish, deploy or contact a supervisor/organiser through this workflow. The pack is ready to use; official rules and the human deliverables remain pending.

## 1. Prepare the machine and evidence

Open `http://localhost:5174/demo/presentation` for a rehearsal separate from existing `127.0.0.1` demo storage, or use the usual `http://127.0.0.1:5174/demo/presentation` after saving/closing other demo tabs on that origin yourself. Both reach the existing local frontend; this is not deployment. Use the visible fictional banner throughout. Save any existing demo work before **Reset complete local demo**: it clears the disposable browser demo, never connected accounts. Use one tab on that origin for scenario navigation: simulated time is tab-scoped but demo storage is shared, so other tabs polling different clocks can interfere. Do not run a connected database reseed for presentation preparation.

From the studio, download **CP9 showcase pack**. Its seven scenes have contiguous 0–300-second timings, captions, checks and English narration. The source is [the storyboard JSON](../contracts/cp9-showcase-pack.json). **Five minutes is provisional until official rules are confirmed.** Practice speaking with pauses; shorten words or scene transitions after timing an actual student delivery.

Read [the evidence map and declaration drafts](CP9_EVIDENCE_PACK.md). Fill private team/rules/history information only when verified. CP7 human accuracy/feedback/speed/cost remain unmeasured. CP8 photo smoke used one supplied illustration; its forecast example is synthetic. Do not describe nominal 90% coverage as achieved: observed fictional holdout coverage is 6/8.

## 2. Rehearse the seven scenes

| Time | Screen/action | Evidence boundary |
| --- | --- | --- |
| 0:00–0:30 | Studio **fresh** → discovery → stall detail; show dietary/declaration transparency | Fictional market/reviews/artwork |
| 0:30–1:25 | Voice → labelled scripted sample/local quick entry → unresolved time clarification → corrected Malaysia date/PM → inspect/confirm | Typed/scripted rehearsal is not live speech inference |
| 1:25–2:10 | Batch audit: compare earlier batch with newly created batch, preparation and original deadline | Keep this scene in the same workspace; no reset between voice and audit |
| 2:10–3:05 | Studio **clearance** → alerts/clearance → select an eligible pending draft without an active offer → manual approve → customer Offers | 30-minute warning; **reminder** is the 15-minute creation cutoff and blocks new offers. Reset replaces previous fixture |
| 3:05–3:40 | Studio **expired** → Offers (no active expired offers); **missing-handling** → inspect blocked declaration | Simulated time; do not claim a real-food safety verdict |
| 3:40–4:20 | Evaluation **Not measured**; optional planning report with synthetic label/errors | Software tests and one vision smoke are not a human or real forecast benchmark |
| 4:20–5:00 | Studio business/pilot; explain hypotheses and next validation | Pilot/partners/results fictional; eligibility/history/TRL unconfirmed |

The studio's **expired** button seeds the ordinary fictional workspace at its anchor and advances 61 minutes with current synthetic weather. It demonstrates engine delisting. It does not age the exact manually approved offer from the previous reset. For a continuous no-reset expiry recording, open `/demo/admin` on the same tab/origin and use **Advance 40 minutes** after the clearance approval; retain the batch/offer IDs and confirm before/after screens. This local technical path was observed in CP9: the offer ended and customer Offers became empty. Weather became stale and conservatively shortened windows too; explain that fail-closed result honestly. If recording only reset scenarios, state their separate-fixture limitation clearly.

Record the actual reason for blocked offers or clarification. Never move preparation later, extend a deadline or bypass a safety/dietary rule to make a nicer video. Missing/stale handling/weather, network failures and unknown stock have honest fallbacks. A reset is for a separately labelled fictional scene, not a way to claim an interrupted save succeeded.

## 3. Record with a participating student

Use an already available local screen recorder. If needed, OBS Studio's [official quick-start guide](https://obsproject.com/kb/quick-start-guide) describes window capture, microphone selection and checking a short recording. Prefer capturing the app window so private tabs/terminal/environment files stay outside the frame. This guide does not install software or grant microphone/camera permission automatically.

Practical local target: 1920×1080 or legible 1280×720, 30 fps, English student microphone narration, visible fictional/simulated captions. These are preparation choices, not competition format requirements. Use a recorder preset suitable for the machine; keep the original recording and export a review copy in the officially required format once known. Do not replace student narration with generated speech.

1. A participating student confirms they consent to being recorded, checks the microphone and chooses whether to show their face. Keep private details out of frame.
2. Make one short setup clip to check text readability, sound, cursor and capture boundaries. Fix the setup before recording the complete phase workflow; do not rerun application test suites while recording.
3. Record the complete script. Only claim actual microphone transcription/model extraction if that exact consented flow succeeds on screen. Otherwise keep the typed/scripted caption and narration.
4. Keep raw takes privately in `.local-evaluation/cp9/`. Record observed duration and who reviewed the recording; do not fill these fields from planned timings.
5. Produce a complete backup of the core workflow. The existing eight-second diagram clips are supplementary and are not that backup.
6. Watch the exported file locally from start to finish. Check narration, readable captions, before/after batch timer, actual approval and customer visibility, expiry/unknown hard stop and honest metrics. Record skipped/failed steps; a video file's existence is not acceptance.

## 4. Backup and intended-device rehearsal

Keep a local copy of the reviewed video, captions, storyboard and evidence map. Open it in a local player before the presentation. A captured video is the offline fallback; cached web readiness alone is not proof of an actual disconnected-device journey. Do not simulate a successful microphone or notification delivery in a backup.

Rehearse once on the intended presentation computer/phone/projector after the pack is built. Record device/OS/browser, date, network, student operator, elapsed duration, each scene's pass/fail, deviations and backup playback result. Run only affected failed scenes again after repairs. Preserve original observations in the log instead of overwriting failures with success.

Fallback narration: “The model is unavailable, so I will demonstrate the clearly labelled manual confirmation path.” “This backup is a recorded fictional demonstration; it is not a live user study.” “The safety policy still requires qualified review.”

## 5. Private collection templates

Run the preparation command once; it creates missing templates and never overwrites existing ones:

```powershell
uv run --project apps/api python scripts/cp9_prepare.py
```

Files are ignored under `.local-evaluation/cp9/`: `entry-details.json`, `rehearsal.csv` and `video-review.csv`. Start with blank/unverified values. Give the local folder path when completed; do not send student documents/IDs in chat. If a key/password appears in any captured frame, exclude that take and use a clean recording.

Remaining before CP9 acceptance: official-rule review, real team/supervisor eligibility, confirmed previous-version declaration, reviewed TRL evidence assessment, actual student English video, complete backup, intended-device rehearsal and supplied-image publication rights. CP7 measured claims need its actual recordings/users/devices/costs; CP8 forecast claims need real history. No deployment or external submission is included.
