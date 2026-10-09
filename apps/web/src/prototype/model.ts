import { z } from 'zod'

export const WATERMARK = 'FICTIONAL — DEMO ONLY'
export const SCENARIO_DATE = '2026-10-09'
export const proofStatus = z.enum(['current', 'expired', 'revoked', 'missing'])
export type ProofStatus = z.infer<typeof proofStatus>
export type Step = { title: string; actor: string; detail: string; evidence: string; consent?: boolean }
export type Journey = { id: string; title: string; category: string; summary: string; future: string; steps: Step[] }
export const journeys: Journey[] = [
  { id: 'authority', title: 'A concern becomes a tracked case', category: 'Health authority', summary: 'Private report → human moderation → redacted handoff → inspection → follow-up.', future: 'An agreed authority intake process, authenticated officers and a permitted API or reviewed export could replace this simulator.', steps: [
    { title: 'Customer reports privately', actor: 'Customer', detail: 'A fictional handling concern is recorded. A report is an allegation, not an inspection finding.', evidence: 'DEMO-REPORT-001 · identity hidden from public' },
    { title: 'Moderator reviews and hears the hawker', actor: 'Moderator', detail: 'Independent reports and a hawker reply are reviewed before any referral. No automatic escalation.', evidence: 'DEMO-REVIEW-001 · reply window completed in this scenario' },
    { title: 'Approve redacted handoff', actor: 'Moderator', detail: 'Only the stall, coarse market, reviewed summary and case timeline are included. Reporter identity and original attachments stay out.', evidence: 'DEMO-CONSENT-001 · exact destination and fields', consent: true },
    { title: 'Fictional health office acknowledges', actor: 'Health officer', detail: 'Pejabat Kesihatan Demo Seri Rasa receives a simulated case reference. No outside service is contacted.', evidence: 'DEMO-CASE-001 · simulated acknowledgement' },
    { title: 'Visit and corrective action', actor: 'Health officer', detail: 'A fictional checklist records storage, cleaning and labels. The hawker supplies a corrective-action note.', evidence: 'DEMO-VISIT-001 · no real inspection or photograph' },
    { title: 'Record follow-up and close', actor: 'Health officer', detail: 'The case history remains available. Closure is not a food-safety certificate and does not reset batch times.', evidence: 'DEMO-FOLLOWUP-001 · simulated closure' },
  ] },
  { id: 'influencer', title: 'A creator discovers a stall', category: 'Food influencers', summary: 'Hawker brief → creator review → disclosure → feature → customer discovery.', future: 'A creator agreement, permission to use a badge and an authorised content channel could enable real editorial trails.', steps: [
    { title: 'Hawker sends a brief', actor: 'Hawker', detail: 'Bara Senja requests a market food story with RasaTrail Demo. This fictional brand is not Foodie or an actual endorsement.', evidence: 'DEMO-BRIEF-001 · satay feature and reusable containers' },
    { title: 'Creator reviews the proposal', actor: 'Creator', detail: 'The creator checks the brief and disclosure. Editorial selection is separate from paid search placement.', evidence: 'DEMO-AGREEMENT-001 · fictional permission record' },
    { title: 'Hawker reviews content', actor: 'Hawker', detail: 'Prices, location and batch information are checked. The feature does not infer halal status or food safety.', evidence: 'DEMO-CONTENT-001 · draft approved in the simulator' },
    { title: 'Creator publishes a demo feature', actor: 'Creator', detail: 'A fictional editorial badge and a two-stop food trail appear in the customer preview. No social post is sent.', evidence: 'DEMO-FEATURE-001 · editorial disclosure visible' },
    { title: 'Customer follows the trail', actor: 'Customer', detail: 'The preview links back to the real local demo stall screen. Views and trail opens are sample counts, not analytics.', evidence: '120 sample views · 18 sample trail opens' },
  ] },
  { id: 'permit', title: 'A stall permit has a lifecycle', category: 'Municipal council', summary: 'Application → document review → demo approval → renewal and revocation.', future: 'An authoritative licensing source and council permission would be required for real permit verification.', steps: [
    { title: 'Prepare stall application', actor: 'Hawker', detail: 'Stall, lot A01, operating schedule and an illustrated stall photo form a fictional application.', evidence: 'DEMO-APPLICATION-001 · generated sample records' },
    { title: 'Review source documents', actor: 'Council officer', detail: 'Majlis Pasar Demo Seri Rasa reviews a fictional identity reference and lot availability; no personal document is collected.', evidence: 'DEMO-LOT-001 · sample 20-lot market' },
    { title: 'Issue demonstration permit', actor: 'Council officer', detail: 'A watermarked permit links to a local proof reference. This is not a licence issued by a council.', evidence: 'DEMO-PROOF-PERMIT-001' },
    { title: 'Inspect expiry and renewal', actor: 'Hawker', detail: 'Switch the certificate status below to expired or revoked. Its customer badge disappears instead of silently renewing.', evidence: 'Proof library · expiry/revocation controls' },
  ] },
  { id: 'certificate', title: 'Declared and certified stay distinct', category: 'Certification', summary: 'Vendor declaration → evidence → fictional reviewer → certificate → customer verification.', future: 'A recognised certifier, authentic source, allowed lookup and actual validation would be needed before real certified status.', steps: [
    { title: 'Vendor makes a declaration', actor: 'Hawker', detail: 'A halal declaration begins as vendor-declared, separate from certification. A food photo cannot verify it.', evidence: 'DEMO-DECLARATION-001 · explicit fictional vendor statement' },
    { title: 'Attach sample evidence', actor: 'Hawker', detail: 'An ingredient statement and a sample supplier reference are illustrative only. No real supplier or government document is reproduced.', evidence: 'DEMO-INGREDIENTS-001 · chicken and peanuts declared' },
    { title: 'Fictional reviewer checks scope', actor: 'Demo reviewer', detail: 'Pusat Semakan Demo Rasa reviews this scenario. It is not JAKIM or any recognised certifier; no real logo, seal or signature is used.', evidence: 'DEMO-REVIEW-CERT-001 · stall/food scope recorded' },
    { title: 'Issue a sample certificate', actor: 'Demo reviewer', detail: 'A plainly watermarked halal-certificate mock-up shows issuer, scope, dates, reference and proof history.', evidence: 'DEMO-PROOF-DIETARY-001' },
    { title: 'Customer checks proof status', actor: 'Customer', detail: 'A current fictional certificate can show a sample badge. Missing, expired or revoked proof cannot show that badge.', evidence: 'Local demo lookup; never a live certifier lookup' },
  ] },
  { id: 'collection', title: 'Surplus has a recorded handover', category: 'Waste reduction', summary: 'Hawker request → eligible route → collector → handover → separate weights.', future: 'A collector agreement, actual fulfilment checks, receipts and measured weights could replace the fictional handover.', steps: [
    { title: 'Choose a batch and route', actor: 'Hawker', detail: 'Use the existing partner workspace for eligible donation or non-consumption compost/BSF. Expired food is never rescued for consumption by this preview.', evidence: 'Independent batch identity and original preparation time' },
    { title: 'Collector accepts pickup', actor: 'Collector', detail: 'Kitar Tanah Demo schedules a fictional non-consumption collection. The real demo workflow reserves stock and blocks duplicate pickups.', evidence: 'DEMO-PICKUP-001 · compost path' },
    { title: 'Record handover', actor: 'Collector', detail: 'Estimated 1.50 kg and sample weighed 1.35 kg are recorded separately. No truck is dispatched.', evidence: 'DEMO-HANDOVER-001 · fictional receipt' },
    { title: 'Show scoped impact', actor: 'Organiser', detail: 'The example demonstrates traceability. A weighed handover is not proof of avoided emissions or a causal waste reduction.', evidence: 'DEMO-PROOF-COLLECTION-001' },
  ] },
  { id: 'expansion', title: 'One market becomes a network', category: 'Future rollout', summary: 'Market source → organiser → location and schedules → regional discovery.', future: 'Verified markets, consented organisers and real operational support would enable expansion beyond the fictional catalogue.', steps: [
    { title: 'Prepare a new market', actor: 'Organiser', detail: 'A sample day market and farmers-market classification demonstrate the same discovery tools used by night markets.', evidence: 'Fictional market coordinates and operating schedule' },
    { title: 'Check provenance and freshness', actor: 'Organiser', detail: 'A future source record would track who supplied the location, opening hours, permissions and last confirmation.', evidence: 'DEMO-MARKET-SOURCE-001 · no actual rollout' },
    { title: 'Discover nearby stalls', actor: 'Customer', detail: 'Open the demo map to combine food categories, budget, dietary declarations and promotions.', evidence: 'Working demo discovery/filter screens' },
  ] },
]

export type Proof = { id: string; title: string; issuer: string; scope: string; kind: 'permit' | 'dietary' | 'editorial' | 'collection' | 'case'; evidence: string[]; note: string }
export const proofs: Proof[] = [
  { id: 'DEMO-PROOF-PERMIT-001', title: 'Stall permit mock-up', issuer: 'Majlis Pasar Demo Seri Rasa', scope: 'Bara Senja · Lot A01 · Seri Pelita fictional market', kind: 'permit', evidence: ['DEMO-APPLICATION-001', 'DEMO-LOT-001', 'DEMO-REVIEW-PERMIT-001'], note: 'Not a licence, council approval or authority record.' },
  { id: 'DEMO-PROOF-DIETARY-001', title: 'Halal certificate mock-up', issuer: 'Pusat Semakan Demo Rasa — fictional reviewer', scope: 'Bara Senja · Chicken satay · fictional supplier statements', kind: 'dietary', evidence: ['DEMO-DECLARATION-001', 'DEMO-INGREDIENTS-001', 'DEMO-REVIEW-CERT-001'], note: 'Not recognised halal certification or proof of food safety. No real certifier is represented.' },
  { id: 'DEMO-PROOF-EDITORIAL-001', title: 'Creator feature permission mock-up', issuer: 'RasaTrail Demo — fictional food guide', scope: 'Bara Senja · editorial feature and two-stop trail', kind: 'editorial', evidence: ['DEMO-BRIEF-001', 'DEMO-AGREEMENT-001', 'DEMO-CONTENT-001'], note: 'Not Foodie endorsement. Editorial permission does not certify food or purchase sponsored rank.' },
  { id: 'DEMO-PROOF-COLLECTION-001', title: 'Waste handover receipt mock-up', issuer: 'Kitar Tanah Demo — fictional collector', scope: 'Non-consumption compost · estimate 1.50 kg · sample weighed 1.35 kg', kind: 'collection', evidence: ['DEMO-PICKUP-001', 'DEMO-HANDOVER-001'], note: 'Not proof of actual collection, payment, emissions savings or consumption suitability.' },
  { id: 'DEMO-PROOF-CASE-001', title: 'Case follow-up summary mock-up', issuer: 'Pejabat Kesihatan Demo Seri Rasa', scope: 'DEMO-CASE-001 · redacted fictional concern and follow-up', kind: 'case', evidence: ['DEMO-REVIEW-001', 'DEMO-CONSENT-001', 'DEMO-VISIT-001', 'DEMO-FOLLOWUP-001'], note: 'Not an official inspection, legal finding or food-safety certificate.' },
]
const ids = new Set(proofs.map(p => p.id))
export const stateSchema = z.object({
  version: z.literal(1),
  stages: z.record(z.string(), z.number().int().min(0).max(8)),
  statuses: z.record(z.string(), proofStatus),
}).strict().refine(s => Object.keys(s.stages).every(id => journeys.some(j => j.id === id && s.stages[id] <= j.steps.length)) && Object.keys(s.statuses).every(id => ids.has(id)))
export type PrototypeState = z.infer<typeof stateSchema>
export const freshState = (): PrototypeState => ({ version: 1, stages: {}, statuses: {} })
export function advance(journey: Journey, stage: number, actor: string, consent: boolean) {
  const step = journey.steps[stage]
  if (!step || actor !== step.actor) throw Error('Choose the fictional role assigned to this step.')
  if (step.consent && !consent) throw Error('Confirm the fictional destination and redacted fields first.')
  return stage + 1
}
export function publicBadge(proof: Proof, status: ProofStatus) {
  return status === 'current' && ['permit', 'dietary', 'editorial'].includes(proof.kind)
}
export function evidenceRecord(proof: Proof, reference: string) {
  const details: Record<string, Record<string, string>> = {
    'DEMO-APPLICATION-001': { applicant: 'DEMO-HAWKER-001 · fictional', stall: 'Bara Senja', lot: 'A01', requested_hours: '17:00–22:00', attachment: 'Representative generated stall illustration; not an actual site photo' },
    'DEMO-LOT-001': { market: 'Seri Pelita fictional market', lot: 'A01', capacity: '20 sample lots', source: 'Authored council scenario; not an authoritative register' },
    'DEMO-REVIEW-PERMIT-001': { reviewer: 'Demo council role', observation: 'Sample lot and schedule checked', decision: 'Approved in the fictional scenario only' },
    'DEMO-DECLARATION-001': { declarant: 'Demo hawker role', statement: 'Sample vendor halal declaration', limitation: 'A vendor declaration is separate from recognised certification' },
    'DEMO-INGREDIENTS-001': { dish: 'Chicken satay', ingredients: 'Chicken, peanuts — fictional declared ingredients', supplier_reference: 'DEMO-SUPPLIER-001 · invented reference', limitation: 'Not a complete allergen guarantee or verified supplier record' },
    'DEMO-REVIEW-CERT-001': { reviewer: 'Pusat Semakan Demo Rasa · fictional', scope: 'Bara Senja · Chicken satay', decision: 'Sample evidence review only; no recognised certifier contacted' },
    'DEMO-BRIEF-001': { creator: 'RasaTrail Demo', story: 'Evening satay discovery and reusable containers', placement: 'Editorial sample; separate from sponsored search' },
    'DEMO-AGREEMENT-001': { permission: 'Fictional permission to display the invented RasaTrail Demo name', disclosure: 'Editorial sample; no real agreement or endorsement' },
    'DEMO-CONTENT-001': { title: 'A little evening food trail', stops: 'Bara Senja and Dapur Embun · fictional', reviewed_by: 'Demo hawker role', publication: 'Local preview only; no social platform contacted' },
    'DEMO-PICKUP-001': { destination: 'Kitar Tanah Demo', route: 'Non-consumption compost', estimated_weight: '1.50 kg · synthetic', dispatch: 'No real dispatch' },
    'DEMO-HANDOVER-001': { route: 'Non-consumption compost', sample_weighed_weight: '1.35 kg · synthetic', receiver: 'Demo collector role', limitation: 'No actual weighing, pickup or emissions evidence' },
    'DEMO-REVIEW-001': { source: 'Three authored independent sample concerns', reply: 'Fictional hawker reply opportunity completed', limitation: 'Not customer evidence or a finding of wrongdoing' },
    'DEMO-CONSENT-001': { destination: 'Pejabat Kesihatan Demo Seri Rasa', approved_fields: 'Stall, coarse market, redacted summary and timeline', excluded: 'Reporter identities, contact details and original attachments', transmitted: 'No outside transmission' },
    'DEMO-VISIT-001': { actor: 'Demo health officer', checklist: 'Storage, cleaning and labels — sample observations', finding: 'Scenario only; no actual inspection' },
    'DEMO-FOLLOWUP-001': { case: 'DEMO-CASE-001', action: 'Fictional corrective-action note and follow-up', outcome: 'Sample closure; not a food-safety certificate' },
  }
  return { reference, watermark: WATERMARK, source: 'Authored fictional example', authentic_document: false, scope: proof.scope, fields: details[reference] ?? { note: 'No authentic supporting document supplied' } }
}
export function proofPacket(proof: Proof, status: ProofStatus) {
  return { watermark: WATERMARK, fictional: true, operational: false, source: 'Authored prototype fixture; no outside organisation contacted', reference: proof.id, title: proof.title, issuer: proof.issuer, scope: proof.scope, status, issued: '2026-10-01', expires: status === 'expired' ? '2026-10-08' : '2027-10-09', revoked_at: status === 'revoked' ? SCENARIO_DATE : null, scenario_date: SCENARIO_DATE, evidence: proof.evidence.map(reference => evidenceRecord(proof, reference)), note: proof.note, public_sample_badge: publicBadge(proof, status), real_logo: false, real_signature: false }
}
const escape = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
export function proofHTML(proof: Proof, status: ProofStatus) {
  const packet = proofPacket(proof, status)
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src 'none'; base-uri 'none'; form-action 'none'"><title>${escape(proof.id)} · FICTIONAL</title><style>body{font:16px system-ui;color:#153c30;background:#faf8ef;margin:0;padding:32px}article{position:relative;border:3px solid #bb763e;max-width:760px;margin:auto;padding:32px;background:#fff;overflow:hidden}.mark{font-weight:900;color:#824414;border:2px solid currentColor;padding:14px;letter-spacing:.12em}.diagonal{position:absolute;inset:38% -10% auto;transform:rotate(-25deg);font-size:38px;font-weight:900;color:rgba(150,80,20,.16);pointer-events:none;text-align:center}h1{font-size:30px}dt{font-weight:bold;margin-top:16px}dd{margin:6px 0;overflow-wrap:anywhere}footer{margin-top:24px;border-top:2px solid #bb763e;padding-top:16px;font-weight:bold}@media print{body{padding:0;background:white}article{border:3px solid #bb763e}.mark,footer{color:#000}.diagonal{color:#bbb}}</style></head><body><article><p class="mark">${WATERMARK}</p><span class="diagonal">FICTIONAL · DEMO ONLY</span><p>PasarMalam · prototype proof library</p><h1>${escape(proof.title)}</h1><p>${escape(proof.note)}</p><dl><dt>Fictional issuer</dt><dd>${escape(proof.issuer)}</dd><dt>Reference</dt><dd>${escape(proof.id)}</dd><dt>Scenario status</dt><dd>${status.toUpperCase()}</dd><dt>Sample scope</dt><dd>${escape(proof.scope)}</dd><dt>Scenario issue / expiry</dt><dd>${packet.issued} / ${packet.expires}</dd><dt>Fictional evidence references</dt><dd>${proof.evidence.map(escape).join(' · ')}</dd><dt>Verification</dt><dd>Local demonstration only. References link to authored sample data; no authentic document, real signature or live issuer lookup exists.</dd></dl><footer>${WATERMARK}<br>No legal validity, real certification, inspection, endorsement or handover. No real authority logos or seals.</footer></article></body></html>`
}
export function redactedCasePacket() {
  return { watermark: WATERMARK, fictional: true, transmitted: false, destination: 'Pejabat Kesihatan Demo Seri Rasa', reference: 'DEMO-CASE-001', stall: 'Bara Senja', market: 'Seri Pelita fictional market', summary: 'Reviewed fictional handling concern; storage and cleaning follow-up requested.', timeline: ['Moderator review', 'Hawker reply', 'Destination-specific consent'], source: 'Authored simulation. Not a real report or authority response.' }
}
export function exposurePreview(unknown: boolean) {
  if (unknown) return { known_minutes: 40, remaining: null, state: 'Needs information', note: 'An unknown interval blocks the sample calculation; chilling never resets prior exposure.' }
  return { known_minutes: 40, remaining: 20, state: 'Arithmetic example only', note: '25 sample ambient + 0 sample chilled + 15 sample transport = 40. Fictional budget 60. This is not an approved food policy or safety judgment.' }
}
