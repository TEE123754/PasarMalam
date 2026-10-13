# PasarMalam — demo partners, creator promotion and sample certifications

Updated **9 October 2026** following the owner's request for a simple showcase with no integration workflows. Every organisation, endorsement and certificate shown is fictional. Generated artwork contains **DEMO · FICTIONAL** watermarks; no real authority logo is used.

## Show the partner showcase

1. Open [Demo partners](http://127.0.0.1:5174/demo/potential).
2. Show **Pejabat Kesihatan Demo Seri Rasa**, the invented health office with its AI-generated professional identity. It represents food safety and handling complaint integration.
3. Show **Majlis Pasar Demo Seri Rasa**, the invented council representing stall cleanliness/pest complaint routing and sample permits.
4. Show **Pusat Semakan Demo Rasa**, the invented certification reviewer.
5. Show the AI-generated **RasaTrail Demo** creator campaign. This fictional adult promotes PasarMalam and discovering neighbourhood stalls. Follow the two demo stall picks. Editorial creator picks remain separate from paid sponsored search and certification.
6. Show the sample stall permit and halal certificate mock-up. Inspect issuer, scope, reference and expiry. Expand supporting references if needed; download the watermarked HTML or fictional JSON. Invalid/expired/revoked proof hides the sample badge.

There are no role-switching, completion-step or timeline controls on this page. Earlier research exhibits are not part of this simplified showcase. The working product directory remains below the samples.

## Show complaints in the customer view

1. Use a partner card's **Report a food safety concern** or **Report a stall hygiene concern** link, or open [Customer complaints](http://127.0.0.1:5174/demo/community?tab=report&account=customer-a).
2. Choose the stall and concern. Food safety/handling categories display the demo health office. Cleanliness/pest categories display the demo council. Misleading information and other concerns stay with the community team.
3. Enter a fictional observation and incident time, then select **Submit private complaint**.
4. Show the **Sent to demo authority** receipt, destination and local reference. **DEMO · FICTIONAL** and the no-real-transmission notice remain visible.
5. Reload and find the saved report and receipt under **Your contributions**. The receipt is projected from the saved local report; it does not change moderation status or create a public accusation.
6. The review tab also offers **Send a private complaint** so food safety concerns are easy to find next to ordinary reviews.

These are local prototype referrals. No authority email, API, government register or social account is contacted. Customer identities, raw observations and evidence are not included in the displayed referral receipt. Connected-mode reports retain their existing real-service behaviour.

## Assets and documents

- [Professional fictional health-office identity](../apps/web/public/prototype/fictional-health-office.png)
- [Fictional creator campaign](../apps/web/public/prototype/fictional-food-creator.png)
- [Sample stall permit](../output/prototype-proof/FICTIONAL-DEMO-PROOF-PERMIT-001.html)
- [Sample halal certificate](../output/prototype-proof/FICTIONAL-DEMO-PROOF-DIETARY-001.html)

Earlier proof examples remain in the output folder as authored sample artifacts; only permit and halal samples are selected in the simplified showcase.

## Validation

Frontend lint, TypeScript/production build and **38 targeted tests across community routing, community model and proof model** passed. Browser acceptance passed: the partner gallery has no completion/workflow controls; both generated images load; food-handling and hygiene complaints display the correct demo destinations and saved receipts; the review-tab entry works; sample permit fields render; narrow creator/complaint layouts have no horizontal overflow. No captured browser console errors. Temporary viewport overrides were reset.

Screenshots: [partner gallery](screenshots/demo-partner-gallery.png), [creator promotion](screenshots/demo-creator-promotion.png), [customer complaint receipt](screenshots/demo-customer-complaint.png), [mobile complaint](screenshots/demo-complaint-mobile.png), [mobile creator](screenshots/demo-creator-mobile.png).

Real approvals, real partnerships and authentic certificates remain future rollout requirements. [Current feature checklist](PROTOTYPE_FEATURES_CHECKLIST.md).
