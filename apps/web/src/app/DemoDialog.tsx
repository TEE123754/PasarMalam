import { ui } from '../locales/phrases'
import * as Dialog from '@radix-ui/react-dialog'
import { Sparkles, X } from 'lucide-react'
import { openDemo } from './config'

export function DemoDialog() {
  return <Dialog.Root><Dialog.Trigger className="button secondary"><Sparkles size={17}/>{' '+ui("Try demo")+' '}</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="dialog-content"><Dialog.Close className="dialog-close" aria-label="Close demo dialog"><X/></Dialog.Close><Dialog.Title>{' '+ui("Explore the PasarMalam demo")+' '}</Dialog.Title><Dialog.Description>{' '+ui("A separate playground with fictional markets, hawkers, menus, batches, reviews and shoppers. Demo changes stay on this device and never enter the real app.")+' '}</Dialog.Description><p>{' '+ui("Switch between customer and hawker views. Explore partner, authority, advertising and sponsored workflows with fictional information throughout.")+' '}</p><p className="small muted">{' '+ui("Food timers are demonstrations, not food-safety certification. Supplied artwork is labelled as demo illustration; original batch photos remain separate.")+' '}</p><button className="button primary" onClick={openDemo}>{' '+ui("Open prefilled demo")+' '}</button></Dialog.Content></Dialog.Portal></Dialog.Root>
}
