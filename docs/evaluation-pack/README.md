# Evaluation pack — Step 2 & 3

How to use these, in order:

1. **recruiting-message.md** — send to candidates (WhatsApp/text).
2. When someone agrees: fill **consent-form.md** on paper or as a copy per person (print or duplicate the file), assign the next free S0_ ID from **participant-log.csv**, and tick it off there.
3. Run **interview-template.md** first (before they see the app).
4. Then **trial-task-template.md** (hands-on, typing vs. voice, timed).
5. For the 5+ speakers, record the 24 scripts from `contracts/voice-evaluation.json` (the `transcript` field is what they read aloud) — log each recording in **recording-log-template.csv** (speaker ID, device, format, noise condition, file path). Keep audio files in `CP7-private/audio/` and consent forms in `CP7-private/consent/` — both are gitignored and never leave this computer.
6. Hand Ruben (Claude) the filled recording log + audio files + the expected-answer corrections once you've listened back and confirmed what was actually said — the scorer in `contracts/voice-evaluation.json` + evaluation screen will turn it into the accuracy/timing/cost report.

Nothing in this folder contains real names — participant IDs only. `CP7-private/` is excluded from git (`.gitignore` was updated).
