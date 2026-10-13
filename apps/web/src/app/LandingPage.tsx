import { useEffect } from 'react'
import { NavLink } from 'react-router'
import { DemoDialog } from './DemoDialog'
import './LandingPage.css'

export default function LandingPage() {
  // Lock scroll — this page is a single-screen hero/intro
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="landing-market">
      <header className="landing-hero">
        <span className="eyebrow">MADE FOR MALAYSIA'S MARKET COMMUNITIES</span>
        <h1>
          Good food.<br/>
          Good neighbours.<br/>
          <span>Less waste.</span>
        </h1>
        <p>
          Discover pasar malam and pasar pagi, meet local hawkers,
          and make the most of every freshly prepared batch.
        </p>
        <div className="button-row">
          <DemoDialog />
          <NavLink className="button secondary" to="/discover">Explore markets</NavLink>
        </div>
      </header>
    </div>
  )
}
