import { useEffect, useState, type KeyboardEvent } from 'react'

const foods = [
  { title: 'Nasi Lemak', image: '/demo/images/pm-06-nasi-lemak.webp' },
  { title: 'Apam Balik', image: '/demo/images/batch-apam-1.webp' },
  { title: 'Roti John Burger', image: '/demo/images/batch-john-1.webp' },
  { title: 'Char Kway Teow', image: '/demo/images/intro-char-kway-teow.webp' },
  { title: 'Air Sirap', image: '/demo/images/intro-air-sirap.webp' },
] as const

const introStorageKey = 'pasarmalam:intro-seen'

function wasIntroSeen() {
  try {
    return window.sessionStorage.getItem(introStorageKey) === 'yes'
  } catch {
    return false
  }
}

function IntroScene({ activeFood }: { activeFood: number }) {
  return (
    <div className="intro-scene">
      <div className="intro-scene__chips">
        <span className="intro-chip intro-chip--warm">Tickles Tastebuds</span>
        <span className="intro-chip intro-chip--green">Local favourites</span>
      </div>

      <div className="intro-wordmark" aria-hidden="true">
        <span>PASAR</span>
        <span>MALAM</span>
      </div>

      <div className="intro-food-circle" aria-hidden="true">
        {foods.map((food, index) => (
          <img
            key={food.title}
            className={`intro-food-circle__image${index === activeFood ? ' is-active' : ''}`}
            src={food.image}
            alt=""
            draggable={false}
          />
        ))}
      </div>

      <p className="intro-tagline">GOOD FOOD · GOOD NEIGHBOURS · LESS WASTE</p>
      <p className="intro-continue">Click anywhere to continue</p>
    </div>
  )
}

export function IntroCurtain() {
  const [visible, setVisible] = useState(() => {
    const forced = new URLSearchParams(window.location.search).get('intro') === '1'
    return forced || !wasIntroSeen()
  })
  const [activeFood, setActiveFood] = useState(0)
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    if (!visible) return
    const interval = window.setInterval(() => {
      setActiveFood(index => (index + 1) % foods.length)
    }, 3200)
    return () => window.clearInterval(interval)
  }, [visible])

  useEffect(() => {
    if (!opening) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timeout = window.setTimeout(() => setVisible(false), reducedMotion ? 60 : 1250)
    return () => window.clearTimeout(timeout)
  }, [opening])

  function continueIntoApp() {
    if (opening) return
    try {
      window.sessionStorage.setItem(introStorageKey, 'yes')
    } catch {
      // The curtain still opens when storage is unavailable.
    }
    setOpening(true)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      continueIntoApp()
    }
  }

  if (!visible) return null

  return (
    <div
      className={`pasarmalam-intro${opening ? ' is-opening' : ''}`}
      role="button"
      tabIndex={0}
      aria-label="PasarMalam welcome. Click anywhere to continue."
      onClick={continueIntoApp}
      onKeyDown={handleKeyDown}
    >
      <div className="intro-curtain intro-curtain--left" aria-hidden="true">
        <IntroScene activeFood={activeFood} />
      </div>
      <div className="intro-curtain intro-curtain--right" aria-hidden="true">
        <IntroScene activeFood={activeFood} />
      </div>
    </div>
  )
}
