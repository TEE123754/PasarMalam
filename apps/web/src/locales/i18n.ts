import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './en'
import { ms } from './ms'

const preferred = localStorage.getItem('pasarmalam:locale') || (navigator.language.startsWith('ms') ? 'ms' : 'en')

void i18n.use(initReactI18next).init({
  resources: { en, ms },
  lng: preferred,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
})

export const changeLocale = async (locale: 'en' | 'ms') => {
  localStorage.setItem('pasarmalam:locale', locale)
  await i18n.changeLanguage(locale)
  document.documentElement.lang = locale
}

document.documentElement.lang = preferred
export default i18n
