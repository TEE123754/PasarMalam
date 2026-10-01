import * as Dialog from '@radix-ui/react-dialog'
import { Sparkles, X } from 'lucide-react'
import { openDemo } from './config'

export function DemoDialog() {
  return <Dialog.Root><Dialog.Trigger className="button secondary"><Sparkles size={17}/>Try demo</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="dialog-content"><Dialog.Close className="dialog-close" aria-label="Close demo dialog"><X/></Dialog.Close><Dialog.Title>Explore the PasarMalam demo</Dialog.Title><Dialog.Description>A separate playground with fictional markets, hawkers, menus, batches, reviews and shoppers. Demo changes stay on this device and never enter the real app.</Dialog.Description><p>Switch between customer and hawker views. Partner, authority, advertising and sponsored workflows will be added here in their scheduled phases, using fake information throughout.</p><p className="small muted">Food timers are demonstrations, not food-safety certification. Generated photos are scheduled for Phase 11.</p><button className="button primary" onClick={openDemo}>Open prefilled demo</button></Dialog.Content></Dialog.Portal></Dialog.Root>
}
