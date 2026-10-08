# PasarMalam — complete voice-recording and evaluation guide

**CP7 update (8 October 2026):** use the [expanded recording and measurement guide](CP7_MEASUREMENT_GUIDE.md) and [24-case pack](../contracts/cp7-recording-pack.json) for the final holdout. Original satay scripts remain development/practice material. Local preparation passed; actual participant/device results remain unmeasured. [Evidence](CP7_ACCEPTANCE.md).


Updated 8 October 2026. For the current local app only; no deployment required. This is a small consented evaluation using fictional food listings, not a food-safety trial.

## 1. What you need to deliver

There are two separate jobs:

| Job | What you collect | What it measures |
| --- | --- | --- |
| A. Recording collection | 24 human audio clips, verified transcripts, anonymous speaker assignments and consent records | Speech recognition and structured listing accuracy |
| B. Live paired tasks | The same listing entered by voice and typing on the same device, with actual successful confirmation and session timing records | Real time to create a listing, including corrections |

**Minimum recording set:** 10 Bahasa Melayu (BM), 10 Manglish and four English clips from at least **five different consenting speakers**. One speaker does not record all 24 clips. Each clip is one listing, at most 30 seconds and 5 MB. Use the exact clip IDs and scripts in Section 12.

For timing, aim for one voice/typing pair per script: 24 pairs, 48 task runs. This is a collection target, not a requirement to invent missing results. A smaller completed set can be reported honestly with its actual pair count. Include all five speakers where possible and balance the task order.

**You can start with Job A today using a phone recorder.** App access, microphone permission in the app and Morpheus extraction are not needed just to collect these files. If time is limited, send the recordings and metadata first; complete live timing later. Saved audio cannot substitute for live microphone timing.

## 2. People, equipment and preparation

- Recruit five adult volunteers who are comfortable with their assigned language. Use IDs `S01`–`S05`; do not put their names in filenames or evaluation results. Additional volunteers are welcome if assignments are recorded.
- Use a phone's existing recorder, or an existing desktop recorder. No paid recorder or new AI key is needed. Read the privacy notice of any cloud-backed recorder and use a local-only option for this exercise.
- Start in a quiet room. A later labelled background-noise test can be collected separately; do not mix it silently into the baseline.
- Keep a copy of this guide open or print the script table. Set aside time for practice, consent, recording and file checks; timing sessions take additional time.
- For app tasks, use a supported desktop Chrome/Edge/Firefox browser and the existing local services. Keep the device timezone at `Asia/Kuala_Lumpur` / UTC+08:00.

If services are stopped, run these from the repository root in separate PowerShell terminals:

```powershell
powershell -NoProfile -File scripts/start-local.ps1 -Service api
powershell -NoProfile -File scripts/start-local.ps1 -Service web
```

Open [evaluation](http://127.0.0.1:5174/demo/evaluation) and [voice entry](http://127.0.0.1:5174/demo/hawker/voice). The standalone demo uses fictional data. Select **Bara Senja**, whose menu contains **Chicken satay**, before task timing. Do not use root production routes or real customer information.

For a target phone, tell me its model/browser first so I can prepare a trusted local HTTPS test setup. Plain LAN HTTP is insufficient for microphone/push checks; a phone's `127.0.0.1` points to the phone, not this computer. Phone-recorder collection works independently of that setup.

## 3. Explain the task and obtain consent before recording

Use this explanation, adapting the words to the speaker's preferred language:

> We are testing PasarMalam's voice listing feature with invented food information. You will read short scripts, and optionally enter the same listings by speaking and typing. Participation is voluntary; you can stop. We will use your voice recording, an anonymous speaker ID and the task results for this evaluation. We will not publish your voice or use it for model training without separate permission. Do not say your name, phone number, address or other private information. Audio submitted through the app is transcribed on the device and removed from the app after transcription. We will separately keep the original evaluation recordings privately. If we use Morpheus extraction, the app sends the redacted transcript and menu names to that provider after explicit consent; it does not send the audio. You may decline that step.

- [ ] Ask whether the person agrees to recording and private evaluation.
- [ ] Ask separately about live timing tasks and, if used, transcript processing by Morpheus.
- [ ] Record consent date, speaker ID and the agreed scope in a private receipt. Keep any name/contact-to-ID list separately from the anonymised dataset.
- [ ] Tell participants who to contact to withdraw. Honour withdrawal by removing their retained audio/results where possible and recording the change in the evaluation inventory.
- [ ] Agree on a deletion date before collection. Suggested evaluation-only policy: delete originals 30 days after the evaluation is completed; record the actual agreed date. This is a proposed collection policy, not an app purge already configured for these external files.

No consent means no recording, upload or timing task. A public demo must not include consent receipts or identifiable voices without separate permission. This checklist is an operational consent aid, not a substitute for privacy review before a real-user study.

## 4. Assign the 24 scripts

This allocation meets the five-speaker minimum and gives four or five clips per person. Reassign a script if the person is uncomfortable with the language; keep the actual assignment in metadata.

| Speaker | BM clips | Manglish clips | English clips | Total |
| --- | --- | --- | --- | --- |
| S01 | bm-01, bm-02 | manglish-01, manglish-02 | en-01 | 5 |
| S02 | bm-03, bm-04 | manglish-03, manglish-04 | en-02 | 5 |
| S03 | bm-05, bm-06 | manglish-05, manglish-06 | en-03 | 5 |
| S04 | bm-07, bm-08 | manglish-07, manglish-08 | en-04 | 5 |
| S05 | bm-09, bm-10 | manglish-09, manglish-10 | — | 4 |

This is a read-script baseline. Natural accent, ordinary speaking speed and natural pronunciation are welcome. Do not imitate an accent, infer demographic traits, coach people to match the model or use text-to-speech/generated voices. More speakers and varied dishes can be added later as a separate extension.

## 5. Record each clip

1. Show the volunteer their script and let them read it silently. Do one unscored practice clip before the first real clip.
2. Place the microphone about 15–25 cm away, avoiding direct breath into it. Keep the distance consistent and avoid touching the phone while speaking.
3. Start recording, leave about half a second of silence, read the full listing naturally, then leave about half a second before stopping. Do not speak the clip ID or speaker ID inside the audio.
4. Say the quantity and price as natural words. For example, `RM 5.00` is “lima ringgit” in BM or “five ringgit” in English; `RM 3.50` can be “tiga ringgit lima puluh sen” or “three ringgit fifty sen”. Do not say “R M five point zero zero” unless that is your normal usage. Record the actual words in the verbatim transcript.
5. Say **all** required information: dish, quantity, unit, price, ingredients and preparation time. The price is the fictional price for the listed serving/package; do not add “per stick” or invent a different pricing basis.
6. Listen once before saving. Check that the beginning/end are present, every word is audible and the recording is not silent or heavily distorted.
7. Save the original with the filename rule below. Record your notes and any speaker deviation. Do not edit out mistakes to make an apparently perfect clip.

For the baseline, preserve the script's intended meaning and facts. If a speaker omits a field or changes the price, either retain it as a labelled deviation/extra test or collect a replacement take. Keep the original attempt and reason privately; do not quietly replace poor model results with better takes after inference.

### Audio format and length

- Preferred evaluation copy: WAV, mono, 16 kHz, 16-bit PCM. An ordinary recorder's original M4A, WAV or WebM is acceptable if it is playable; I can convert a copy later. Do not merely rename an extension to pretend it is WAV.
- Aim for approximately 8–20 seconds; the app limit is **30 seconds** and **5 MB** per file. If a clip exceeds the limit, rerecord naturally rather than speeding up the audio.
- Keep the original sample rate/file unchanged for provenance. Do not apply music, artificial voices, heavy denoising or time compression. Document any technical conversion separately.
- The app deletes its in-memory audio after transcription/cancellation/failure. It does **not** preserve a downloadable dataset for you. Use separately consented recorder files for Job A; do not assume app recording will save them.

## 6. Name files and record metadata

Keep evaluation material outside Git, preferably in a private folder outside the repository. For example:

```text
PasarMalam-voice-evaluation/
  originals/
    bm-01_S01_take01.m4a
    bm-02_S01_take01.m4a
    manglish-01_S01_take01.m4a
    en-01_S01_take01.m4a
    ...
  evaluation-copies/          # optional converted copies, originals preserved
  metadata.csv
  reference-transcripts.csv
  attempts.csv
  timings-session-S01.json
  timings-session-S02.json
  ...
  notes.md
  private-consent/            # restricted; do not publish or send unnecessarily
```

Filename pattern: **`<clip-id>_<speaker-id>_take<two-digit-number>.<real-extension>`**. Each of the 24 clip IDs has one designated baseline take. Other takes are retained privately but excluded from the 24-clip score unless explicitly selected before evaluation. The app's result import accepts each clip ID only once.

Use these CSV headers. Blank fields mean not recorded yet, not a measured zero:

```csv
clip_id,speaker_id,language,filename,take,selected_for_baseline,consent_ref,recorded_at,device,os,browser,recorder_app,format,duration_seconds,size_bytes,environment,notes
```

```csv
clip_id,speaker_id,filename,script_reference,verbatim_spoken_reference,verified_by,script_deviation,notes
```

```csv
attempt_id,clip_id,speaker_id,stage,outcome,reason,include_in_accuracy,include_in_timing,notes
```

- Date/time example: `2026-10-08T19:30:00+08:00` is a format example; use the actual recording time.
- `consent_ref` can be `consent-S01`; no legal name is needed in shared metadata. Keep the real receipt private.
- Write a verbatim reference by listening to the clip, independently of the model output. Preserve the raw version and document any scoring normalisation. Do not change the reference after seeing an error to make it match the model.
- Device/OS/browser identify technical context, not the participant. Accent notes are optional and volunteered; religion, ethnicity, identity documents and home addresses are unnecessary.

## 7. Run saved clips for accuracy — Job A

You may send the files first and let me perform this technical stage. If you run it yourself:

1. Open `/demo/hawker/voice`, select Bara Senja and choose **Load speech model**. Wait for **Speech model ready**. Initial download time is a separate cold-start observation.
2. Use the file input currently labelled **Synthetic audio file (evaluation only)**. Despite that wording, the page also instructs that recordings require speaker consent. Supply only these consented fictional-script clips, at most 5 MB and 30 seconds. The file run is not a live microphone test.
3. Choose **Transcribe and delete audio**. Save the **uncorrected recognised transcript** immediately in your notes before editing it. The retained external original remains in your private folder.
4. For an end-to-end accuracy run, extract from that uncorrected transcript. Check the fictional-information box and only check the Morpheus transcript-consent box if that participant agreed to this provider step. Choose **Extract listing fields**.
5. Record the displayed source, original extracted fields, confidence/flags and any failure **before fixing the draft**. Source must be `morpheus` or `llama.cpp` for actual LLM extraction. `quick-entry` or `scripted-example` is fallback/script evidence, not a successful model result.
6. After preserving the raw result, you may correct and confirm the fictional listing. Record whether corrections were needed and which fields changed. Score the original output, not the corrected one.
7. Repeat with the designated baseline take for each clip. Keep failures and incomplete results; do not report only successful clips.

The page does not automatically export the entire original extraction JSON or all failure metadata. Do not reconstruct a fake “raw” response by copying expected values. Supply the audio, references and actual observations; I can capture and assemble the measured result records in a controlled evaluation run.

### Fixed reference date: do not mix accuracy and app clocks

The annotation contract fixes **reference now = 1 October 2026, 20:00, Malaysia time** and every script's cook time to **1 October 2026, 18:00, UTC+08:00**. The actual recording date can be different. The frozen demo and connected current date can also differ.

- Accuracy evaluation needs a controlled inference context using that contract date. A listing interpreted on today's date is not directly comparable to the fixed-date expected timestamp.
- Do not change the PC date, move an existing batch's preparation time, extend freshness or falsely label today's result as the fixed-date result.
- For live timing, use a valid fictional listing in the demo's own clock context, keep voice and typing on the same context, and document the date used. If that clock/menu context cannot be established, record a blocked task and ask me to prepare it before collecting timed runs.
- The app importer scores against the contract date; ask me to assemble the accuracy dataset rather than manually rewriting timestamps to make a score pass.

## 8. Run live voice-versus-typing tasks — Job B

Use the same participant, clip, device, browser, menu and network for both modes. One pair is two actual tasks, not a saved audio upload plus a stopwatch estimate. Use a unique anonymous pair ID such as `S01-bm-01-p01`.

### Before each pair

1. Obtain task and provider consent, choose the matching stall and establish the valid fictional date/time context. Ensure API/extraction is available.
2. Load the speech model and grant microphone permission deliberately **before** the warm timed task. Record download/permission setup separately. The app timer does not measure that cold setup automatically.
3. Open `/demo/evaluation`. Enter **Clip**, **Pair ID (no personal name)**, **Device**, **Network** and **Task order**. Check the participant-consent box only when consent was obtained.
4. Alternate order across the 24-script table: odd-numbered rows voice-first, even-numbered rows typing-first. This produces 12 pairs of each order if all are completed. Use the selected order for both halves of a pair.

### Voice half

1. Select **Start voice task** on the evaluation screen. On the voice screen, click **Begin timed task**; selecting the task alone has not started the timer.
2. Click **Start recording (30 seconds max)**, read the assigned script live, then **Stop recording** and **Transcribe and delete audio**.
3. Preserve the uncorrected transcript/result if needed for this timing run's observations. Confirm fictional/provider consent as applicable and choose **Extract listing fields**.
4. Review and fix the dish, quantity, unit, price, ingredients, preparation date/time and action. Use **New batch**, unless a separately documented task explicitly tests menu updates. Check the final confirmation box and click **Confirm listing**.
5. The timer stops only after successful save. Correction and inference time count. A scripted sample, uploaded file or fallback without actual LLM inference does not become a valid live voice timing result.

### Typing half

1. Return to `/demo/evaluation` in the **same tab**, using its normal navigation. Choose the same clip/pair/device/network/order and **Start typing task**.
2. Click **Begin timed task**. Enter the same listing manually through the fields: dish `Chicken satay`, assigned quantity, unit `stick`, price in **sen**, ingredients and the same valid preparation time.
3. Use the same required fields, review and **Confirm listing**. Do not paste prefilled answers or use speech/LLM extraction. Normal quick-entry controls can be used if that is the defined manual interface; record that protocol and apply it consistently.
4. If typing-first was assigned, perform these typing steps first, then the voice steps. Do not force the opposite order; the app validates it.

### Avoid invalid timing

- Keep the app tab visible throughout each timed run. Switching to another tab/app or backgrounding the phone can invalidate it. Put scripts on paper or a second device; do not switch windows to read them during timing.
- Do not refresh, cancel, start another timer or reload midway. Record interruptions and failures in `attempts.csv`. Use a new pair ID for a repeat.
- If inference fails, keep the failure, allow normal fallback for usability observation, but do not label that as valid live voice/LLM timing.
- The same actual task must be completed in both modes. Do not skip corrections in one mode or change prices/context to simplify the other.
- Save the session records **before closing the tab**. They are tab/session data, not a server-side archive. The task limit is one hour; shorter routine tasks are expected.

## 9. Save timing and accuracy evidence

On `/demo/evaluation`, copy the JSON displayed under **Session timing records** to a local file such as `timings-session-S01.json`. Preserve invalid records and their reasons, not just accepted pairs.

**Copy valid timings into report input** fills the report textarea with complete valid pairs. It does not download a file or create accuracy results. Copy that textarea to a separate file as well. Its `results: []` means accuracy has not been supplied. Replace the model-description placeholder with the actual technical context when I assemble the final report.

Important current implementation limits:

- The timing recorder automatically saves warm runs with `cold: false`. Measure model-download/startup separately and identify it as a manual cold-start observation; do not pretend the app captured cold duration.
- Cancelled tasks are not guaranteed to produce a saved timing row; retain your external attempt log.
- The strict draft schema requires the original fields plus timezone, action, confidence and evidence. Screenshots of corrected fields alone do not supply that raw schema.
- The importer can calculate a report from incomplete samples; that is not proof that the 24-clip/five-speaker requirement was fulfilled. Speaker and consent counts must be checked from private metadata.
- The built-in WER strips punctuation and lowercases, but does not equate spoken-number words with digits. “lima” versus `5` can therefore count as an error. Keep verbatim references and report the normalisation rule; do not call that built-in number-format difference a semantic extraction error. Any independently normalised WER must be labelled separately.

## 10. What to send me

Provide the **local folder path** and this short handoff message; do not post credentials, participant names or private consent receipts in chat:

```text
Voice collection ready.
Folder: [actual local folder path]
Baseline clips: [actual count] / 24
Languages: BM [count], Manglish [count], English [count]
Consenting speakers: [count; anonymous IDs only]
Selected baseline takes listed in metadata.csv: yes/no
References checked by listening: yes/no
Private consent receipts retained by organiser: yes/no
Morpheus transcript processing permitted: [speaker IDs or no]
Live timing sessions available: [filenames or not yet collected]
Devices/browsers: [technical details]
Missing clips, failures and deviations: [notes]
Agreed original-audio deletion date: [actual date]
```

Files to make available: original selected clips, metadata, reference transcripts, attempt log, timing JSON if collected and technical notes. Keep the name-to-ID list and signed/identifiable consent receipts separate; an anonymised consent-status record is enough for routine scoring. If you have incomplete inputs, send what is available and identify gaps.

I will validate format/duration/size and consent scope, prepare evaluation copies if needed, run the agreed inference route, assemble actual results, calculate metrics, and update acceptance/checklists. No human score will be invented for a missing clip or speaker. This handoff does not grant publication or model-training permission.

## 11. Completion and troubleshooting

### Recording collection is ready when

- [ ] All 24 unique clip IDs have a selected human baseline take: 10 BM, 10 Manglish, four English.
- [ ] At least five different speakers consented and actual assignments are recorded.
- [ ] Every selected clip is playable, at most 30 seconds/5 MB, with no private details or generated voice.
- [ ] A listener verified the actual spoken reference; deviations and other takes are retained/documented.
- [ ] Metadata, consent status, technical context and agreed deletion date are supplied privately.

### Timing and acceptance are ready when

- [ ] Actual microphone and model inference were used for valid voice tasks; manual tasks were genuinely typed.
- [ ] Same-context paired tasks and counterbalanced order were followed; failures/interruptions are counted separately.
- [ ] Session JSON was saved before closing the tab; cold-start observations are separate.
- [ ] Raw ASR and extraction results are preserved before correction and scored with a documented reference context.
- [ ] BM and Manglish critical-field accuracy are reported **separately** against the current 80% target. Actual WER, JSON validity, ingredients, correction rate and paired median/P90 times are reported with sample counts.

Eighty percent is a target, not a guaranteed result or food-safety approval. These satay scripts are narrow: passing them does not establish broad dish coverage, noisy-market performance, accent fairness or every cheap phone's reliability. If results fall below target, the measurements are still valid; they guide fixes and a later focused reevaluation.

| Problem | What to do |
| --- | --- |
| Clip too long/large | Keep original; record a shorter natural replacement or let me convert a copy. Do not fake format by renaming. |
| Missing price/ingredients | Log the deviation and rerecord before baseline selection; do not silently insert unheard facts. |
| Microphone denied | Decide whether to grant it in the site's browser settings. Manual entry remains usable; record denial as device evidence, not a successful voice task. |
| Speech model fails/phone crashes | Save technical context/error and use fallback for usability. Do not count it as a speech pass. |
| Extract button unavailable | Check fictional/provider consent and local API status. If provider consent was declined, stop that provider step rather than bypassing it. |
| Source is quick-entry/scripted-example | Log fallback/script result. It does not satisfy live model accuracy or paired voice timing. |
| Preparation time differs by date | Stop scoring that timestamp and ask me to establish the fixed-date evaluation context; do not rewrite output to match the answer. |
| Cannot confirm | Check required fields, menu selection and non-future preparation time. Record errors; do not bypass validation. |
| Pair rejected | Check task order and identical pair/clip/device/network. Use a new pair ID for a deliberate repeat. |
| Timings disappeared | They were session data. Recover your saved JSON or mark missing; do not reconstruct times from memory. |

## 12. Exact 24 recording scripts and expected listing facts

The following table is copied from [contracts/voice-evaluation.json](../contracts/voice-evaluation.json). Speak prices/numbers naturally as explained above. All dishes are **Chicken satay**, unit **stick**, preparation **18:00 Malaysia time**. BM/Manglish ingredients are `ayam, kacang`; English ingredients are `chicken, peanuts`. The controlled accuracy date is **1 October 2026**, not the real recording date.

<!-- Exact script table follows; generated from the annotation contract, not measured results. -->

| # | Clip ID | Speaker | First timed mode | Exact script | Quantity | Price |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | bm-01 | S01 | voice | Satay ayam 5 batang RM 5.00, bahan ayam, kacang. Siap pukul 6 petang. | 5 sticks | RM 5.00 |
| 2 | bm-02 | S01 | typing | Satay ayam 10 batang RM 6.00, bahan ayam, kacang. Siap pukul 6 petang. | 10 sticks | RM 6.00 |
| 3 | bm-03 | S02 | voice | Satay ayam 20 batang RM 3.50, bahan ayam, kacang. Siap pukul 6 petang. | 20 sticks | RM 3.50 |
| 4 | bm-04 | S02 | typing | Satay ayam 12 batang RM 8.00, bahan ayam, kacang. Siap pukul 6 petang. | 12 sticks | RM 8.00 |
| 5 | bm-05 | S03 | voice | Satay ayam 8 batang RM 5.00, bahan ayam, kacang. Siap pukul 6 petang. | 8 sticks | RM 5.00 |
| 6 | bm-06 | S03 | typing | Satay ayam 3 batang RM 6.00, bahan ayam, kacang. Siap pukul 6 petang. | 3 sticks | RM 6.00 |
| 7 | bm-07 | S04 | voice | Satay ayam 5 batang RM 3.50, bahan ayam, kacang. Siap pukul 6 petang. | 5 sticks | RM 3.50 |
| 8 | bm-08 | S04 | typing | Satay ayam 10 batang RM 8.00, bahan ayam, kacang. Siap pukul 6 petang. | 10 sticks | RM 8.00 |
| 9 | bm-09 | S05 | voice | Satay ayam 20 batang RM 5.00, bahan ayam, kacang. Siap pukul 6 petang. | 20 sticks | RM 5.00 |
| 10 | bm-10 | S05 | typing | Satay ayam 12 batang RM 6.00, bahan ayam, kacang. Siap pukul 6 petang. | 12 sticks | RM 6.00 |
| 11 | manglish-01 | S01 | voice | Chicken satay 8 batang RM 3.50, bahan ayam, kacang. Ready pukul 6 petang lah. | 8 sticks | RM 3.50 |
| 12 | manglish-02 | S01 | typing | Chicken satay 3 batang RM 8.00, bahan ayam, kacang. Ready pukul 6 petang lah. | 3 sticks | RM 8.00 |
| 13 | manglish-03 | S02 | voice | Chicken satay 5 batang RM 5.00, bahan ayam, kacang. Ready pukul 6 petang lah. | 5 sticks | RM 5.00 |
| 14 | manglish-04 | S02 | typing | Chicken satay 10 batang RM 6.00, bahan ayam, kacang. Ready pukul 6 petang lah. | 10 sticks | RM 6.00 |
| 15 | manglish-05 | S03 | voice | Chicken satay 20 batang RM 3.50, bahan ayam, kacang. Ready pukul 6 petang lah. | 20 sticks | RM 3.50 |
| 16 | manglish-06 | S03 | typing | Chicken satay 12 batang RM 8.00, bahan ayam, kacang. Ready pukul 6 petang lah. | 12 sticks | RM 8.00 |
| 17 | manglish-07 | S04 | voice | Chicken satay 8 batang RM 5.00, bahan ayam, kacang. Ready pukul 6 petang lah. | 8 sticks | RM 5.00 |
| 18 | manglish-08 | S04 | typing | Chicken satay 3 batang RM 6.00, bahan ayam, kacang. Ready pukul 6 petang lah. | 3 sticks | RM 6.00 |
| 19 | manglish-09 | S05 | voice | Chicken satay 5 batang RM 3.50, bahan ayam, kacang. Ready pukul 6 petang lah. | 5 sticks | RM 3.50 |
| 20 | manglish-10 | S05 | typing | Chicken satay 10 batang RM 8.00, bahan ayam, kacang. Ready pukul 6 petang lah. | 10 sticks | RM 8.00 |
| 21 | en-01 | S01 | voice | Chicken satay 20 sticks RM 5.00, ingredients chicken, peanuts. Cooked at 6 pm. | 20 sticks | RM 5.00 |
| 22 | en-02 | S02 | typing | Chicken satay 12 sticks RM 6.00, ingredients chicken, peanuts. Cooked at 6 pm. | 12 sticks | RM 6.00 |
| 23 | en-03 | S03 | voice | Chicken satay 8 sticks RM 3.50, ingredients chicken, peanuts. Cooked at 6 pm. | 8 sticks | RM 3.50 |
| 24 | en-04 | S04 | typing | Chicken satay 3 sticks RM 8.00, ingredients chicken, peanuts. Cooked at 6 pm. | 3 sticks | RM 8.00 |

Quantity is the fictional available/listed quantity. Price is the stated listing price, not an automatically inferred per-stick price. In the manual form, RM 5.00 = 500 sen, RM 6.00 = 600 sen, RM 3.50 = 350 sen and RM 8.00 = 800 sen.

No recordings or measurement results are created by this guide. Do not fill the contract's audio/speaker/consent fields until the corresponding real input exists.

## CP3 held-out local-expression supplement

Use consenting speakers and keep these recordings separate from development/adversarial fixtures. Record at least 20 BM/English/Manglish utterances across new batch, menu-only and exact existing-stock intents. Include kuali kedua, tinggal sepuluh bungkus, dua seringgit, duplicate stall/dish names, overnight/semalam times, unknown batch numbers and unsupported timer requests. Do not coach a speaker to copy the development examples verbatim.

Annotate stall/dish IDs, intent, exact batch, quantity/unit, unit-versus-bundle price meaning, date/AM-PM, ingredients, expected clarification and whether writes should be blocked. Report per-field accuracy and exact confirmed-command accuracy separately from clarification rate; never score a refused ambiguous command as a successful guessed listing. Compare voice and typing with matched tasks. Retain consent/anonymous speaker codes and delete audio according to the existing brief. Development examples are synthetic and unmeasured; C05-05 stays pending until held-out human results are accepted in CP7.
