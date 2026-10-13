import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import App from './app/App'
import { PwaStatus } from './app/PwaStatus'
import { AuthProvider } from './auth/AuthProvider'
import './locales/i18n'
import './styles.css'
import './prototype/prototype.css'
import './ui-refresh.css'
import './native/native.css'
import { prepareNativeDemoRoute, nativeDemoBuild } from './native/policy'
import { NativeRuntime } from './native/NativeRuntime'
import { prepareMarketExperience } from './app/experience'
import './market-experience.css'

prepareNativeDemoRoute()
prepareMarketExperience()

const root = document.getElementById('root')
if (!root) throw new Error('App root is missing')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000, refetchOnWindowFocus: false } },
})

createRoot(root).render(
  <StrictMode>
    {!nativeDemoBuild() && <PwaStatus />}
    <QueryClientProvider client={queryClient}>
      <AuthProvider><BrowserRouter basename={/^\/demo(?:\/|$)/.test(window.location.pathname) ? "/demo" : /^\/sandbox(?:\/|$)/.test(window.location.pathname) ? "/sandbox" : "/"}><NativeRuntime/><App /></BrowserRouter></AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
