// Local prototype display only. This module never contacts an authority.
export const DEMO_REFERRAL_WATERMARK = 'DEMO · FICTIONAL'
const health = { name: 'Pejabat Kesihatan Demo Seri Rasa', kind: 'health' as const, purpose: 'Food safety and food handling' }
const council = { name: 'Majlis Pasar Demo Seri Rasa', kind: 'council' as const, purpose: 'Stall hygiene and market cleanliness' }
const support = { name: 'PasarMalam community team', kind: 'support' as const, purpose: 'Community review' }
export function complaintDestination(category: string) {
  if (['spoiled-food', 'cross-contamination', 'unhygienic-handling', 'handling'].includes(category)) return health
  if (['hygiene', 'pests'].includes(category)) return council
  return support
}
export function complaintLabel(category: string) {
  const labels: Record<string, string> = { 'spoiled-food': 'Food safety — spoiled food', 'cross-contamination': 'Food safety — cross-contamination', 'unhygienic-handling': 'Food safety — unhygienic handling', handling: 'Food safety — handling / storage', hygiene: 'Stall hygiene — cleanliness', pests: 'Stall hygiene — pests', misleading: 'Misleading information', other: 'Other concern' }
  return labels[category] ?? 'Other concern'
}
export function demoComplaintReceipt(report: { id: string; category: string; created: string }) {
  const destination = complaintDestination(report.category)
  return { reference: `DEMO-REFERRAL-${report.id}`, destination, category: complaintLabel(report.category), recorded_at: report.created, status: destination.kind === 'support' ? 'Received by demo community team' : 'Sent to demo authority', watermark: DEMO_REFERRAL_WATERMARK, simulated: true, external_transmission: false }
}
