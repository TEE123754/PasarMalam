import type { LucideIcon } from 'lucide-react'

// Section title: a small icon beside the serif heading and its one-line subtitle (styles in discovery.css)
export function SectionTitle({ Icon, tone, id, title, sub }: { Icon: LucideIcon; tone: 'flame' | 'gold' | 'leaf' | 'cream'; id?: string; title: string; sub?: string }) {
  return <div className="section-title"><Icon className={tone} size={20} aria-hidden="true"/><div><h2 id={id}>{title}</h2>{sub && <p className="section-sub">{sub}</p>}</div></div>
}
