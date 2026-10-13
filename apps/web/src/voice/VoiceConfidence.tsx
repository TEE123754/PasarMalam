import { ui } from '../locales/phrases'
import type { ConfidenceLevel } from './confidence'

export function VoiceConfidenceBadge({ level }: { level?: ConfidenceLevel }) {
  if (!level) return null
  const label = level[0].toUpperCase() + level.slice(1)
  return (
    <span className={`voice-confidence ${level}`}>
      <span className="voice-confidence-level">{ui(label)}</span>
      {level !== 'high' && <span className="voice-confidence-verify">{ui('Please verify')}</span>}
    </span>
  )
}
