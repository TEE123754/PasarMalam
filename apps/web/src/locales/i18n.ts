import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { selectedMode } from '../app/config'
import { en } from './en'
import { ms } from './ms'

const localeKey=`pasarmalam:${selectedMode() === 'fixture' ? 'demo' : 'real'}:locale`
const preferred = localStorage.getItem(localeKey) || (navigator.language.startsWith('ms') ? 'ms' : 'en')

void i18n.use(initReactI18next).init({
  resources: { en, ms },
  lng: preferred,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
})

export const changeLocale = async (locale: 'en' | 'ms') => {
  localStorage.setItem(localeKey, locale)
  await i18n.changeLanguage(locale)
  document.documentElement.lang = locale
}

document.documentElement.lang = preferred
export default i18n
