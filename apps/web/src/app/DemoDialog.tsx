import { ui } from '../locales/phrases'
import * as Dialog from '@radix-ui/react-dialog'
import { Sparkles, X } from 'lucide-react'
import { openDemo } from './config'

export function DemoDialog() {
  return <Dialog.Root><Dialog.Trigger className="button secondary"><Sparkles size={17}/>{ui('Try demo')}</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="dialog-content"><Dialog.Close className="dialog-close" aria-label="Close demo dialog"><X/></Dialog.Close><Dialog.Title>{ui('Welcome to another evening in Malaysia')}</Dialog.Title><Dialog.Description>{ui('This demo is a separate world with fictional markets, people, reviews, declarations and organisations. Every feature is prefilled so you can explore the customer, hawker and partner experience.')}</Dialog.Description><p>{ui('Images represent sample dishes. Agency connections, certificates, payments, advertising and deliveries are simulated; no real organisation is contacted and no money moves. Your changes stay on this device.')}</p><p className="small muted">{ui('Food countdowns illustrate advisory rules, not a food-safety guarantee or official approval. Real operations require reviewed policies and authorised integrations.')}</p><button className="button primary" onClick={openDemo}>{ui('Enter PasarMalam')}</button></Dialog.Content></Dialog.Portal></Dialog.Root>
}
