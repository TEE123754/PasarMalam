import { useTranslation } from 'react-i18next'
import { ui } from '../locales/phrases'
import './SiteFooter.css'

// The one footer for every page. It lives in the app shell, not in a page, so nothing can sit below it.
export function SiteFooter() {
  const { t } = useTranslation()
  return <footer className="site-footer"><div className="site-footer-brand"><span className="brand-mark"><img src="/brand/pasarmalam-mark.png" alt="" width="45" height="45"/></span><div><strong>Pasar<span>Malam</span></strong><small>{t('tagline')}</small></div></div><span>{ui('Community markets · Basic tier free')}</span></footer>
}
