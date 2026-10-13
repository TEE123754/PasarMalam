import { useEffect, useState } from 'react'

const DURATION = 4500
const EXIT_AT = 3900
const WAVE = 'M0,24 C80,0 160,48 240,24 C320,0 400,48 480,24 C560,0 640,48 720,24 C800,0 880,48 960,24 C1040,0 1120,48 1200,24 C1280,0 1360,48 1440,24 L1440,0 L0,0 Z'

function Wave({ position }: { position: 'top' | 'bottom' }) {
  return <svg className={`hero-intro-wave ${position}`} viewBox="0 0 1440 48" preserveAspectRatio="none" focusable="false">
    <path d={WAVE} fill="#17443e"/>
  </svg>
}

export function HeroIntro({ onDone }: { onDone: () => void }) {
  const [exiting, setExiting] = useState(false)
  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), EXIT_AT)
    const doneTimer = setTimeout(onDone, DURATION)
    return () => { clearTimeout(exitTimer); clearTimeout(doneTimer) }
  }, [onDone])
  return <div className={`hero-intro ${exiting ? 'exiting' : ''}`} aria-hidden="true">
    <div className="hero-intro-shell">
      <Wave position="top"/>
      <div className="hero-intro-wordmark">
        <span className="pasar">PASAR</span>
        <span className="malam">MALAM</span>
      </div>
      <div className="hero-intro-food"><img src="/demo/images/pm-06-nasi-lemak.webp" alt="" width={320} height={320}/></div>
      <span className="hero-intro-tag fresh">Freshly Made</span>
      {/* Not every stall is halal, so the intro claims only what the app tracks for all of them */}
      <span className="hero-intro-tag tracked">Batch-tracked &#10003;</span>
      <p className="hero-intro-tagline">Good food &middot; Good neighbours &middot; Less waste</p>
      <div className="hero-intro-progress"><div className="hero-intro-progress-fill"/></div>
      <Wave position="bottom"/>
    </div>
  </div>
}
