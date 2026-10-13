import { useEffect, useRef, useState } from 'react'
import { Camera, Check, LoaderCircle, Pencil, RotateCcw, Sparkles, Trash2, X } from 'lucide-react'
import { categories, categoryId as resolveCategoryId, categoryIds } from '../discovery/classifications'
import type { VendorStall } from './model'
import { extractMenuFromPhoto, type MenuPhotoSuggestion, type OnboardingCategoryId } from './menu-photo-extractor'
import './photo-menu-onboarding.css'

export function PhotoMenuOnboarding({ stall, onConfirm, onCancel }: { stall: VendorStall; onConfirm: (items: MenuPhotoSuggestion[]) => Promise<void>; onCancel: () => void }) {
  const initialCategory = (categoryIds.includes((stall.category_id ?? resolveCategoryId(stall.category)) as OnboardingCategoryId) ? stall.category_id ?? resolveCategoryId(stall.category) : 'skewers') as OnboardingCategoryId
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const urlRef = useRef('')
  const [processing, setProcessing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [drafts, setDrafts] = useState<MenuPhotoSuggestion[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBackup, setEditBackup] = useState<MenuPhotoSuggestion | null>(null)
  const [error, setError] = useState('')

  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current) }, [])

  async function processPhoto(file: File) {
    if (!file.type.startsWith('image/') || file.size === 0 || file.size > 10 * 1024 * 1024) {
      setError('Choose a valid image under 10 MB.')
      return
    }
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = URL.createObjectURL(file)
    setPhotoUrl(urlRef.current)
    setPhoto(file)
    setDrafts([])
    setEditingId(null)
    setError('')
    setProcessing(true)
    try {
      const suggestions = await extractMenuFromPhoto(file, initialCategory)
      setDrafts(suggestions)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not read this image. Try another photo.')
    } finally {
      setProcessing(false)
    }
  }

  function edit(item: MenuPhotoSuggestion) {
    setEditBackup({ ...item })
    setEditingId(item.id)
  }

  function update(itemId: string, patch: Partial<MenuPhotoSuggestion>) {
    setDrafts(items => items.map(item => item.id === itemId ? { ...item, ...patch } : item))
  }

  function cancelEdit() {
    if (editBackup) update(editBackup.id, editBackup)
    setEditingId(null)
    setEditBackup(null)
  }

  async function confirmAll() {
    if (!drafts.length || drafts.some(item => !item.name.trim() || !Number.isFinite(item.price) || item.price < 0)) {
      setError('Check each item name and final price before confirming.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onConfirm(drafts)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The menu could not be saved. Review and try again.')
    } finally {
      setSaving(false)
    }
  }

  return <section className="hawker-card photo-onboarding" aria-labelledby="photo-onboarding-title">
    <div className="photo-onboarding-heading"><div><span className="photo-onboarding-kicker"><Sparkles size={14}/>ONE-PHOTO SETUP · DEMO SIMULATION</span><h2 id="photo-onboarding-title">Set up your menu with a photo</h2><p>Take or choose one photo of your stall sign or food display. We’ll prepare a menu draft for you to review.</p></div><button type="button" className="photo-onboarding-close" aria-label="Close photo menu setup" onClick={onCancel} disabled={saving}><X size={19}/></button></div>
    <p className="photo-onboarding-privacy">This demo simulates a vision → structured-menu extraction in your browser. The photo is not uploaded or sent to an AI service.</p>
    {!photo && <label className="button primary photo-onboarding-pick"><Camera size={17}/>Take or choose a photo<input type="file" accept="image/*" capture="environment" onChange={event => { const file = event.target.files?.[0]; if (file) void processPhoto(file); event.currentTarget.value = '' }}/></label>}
    {photo && <div className="photo-onboarding-preview"><img src={photoUrl} alt="Selected stall sign or food-display photo"/><div><strong>{photo.name || 'Selected photo'}</strong><span>{processing ? 'Reading your stall…' : `${drafts.length} AI-style suggestions ready to review`}</span>{!processing&&!saving&&<button type="button" className="photo-onboarding-change" onClick={() => { setPhoto(null); setPhotoUrl(''); setDrafts([]); setError('') }}><RotateCcw size={13}/>Choose another photo</button>}</div></div>}
    {processing && <div className="photo-onboarding-processing" role="status" aria-live="polite"><LoaderCircle size={18} className="photo-onboarding-spinner"/><span>Reading your stall… identifying likely menu items and price ranges.</span></div>}
    {drafts.length > 0 && !processing && <>
      <div className="photo-onboarding-draft-heading"><h3>Suggested menu · {drafts.length} items</h3><p>These are drafts only. Nothing is added until you confirm.</p></div>
      <div className="photo-onboarding-draft-list">{drafts.map(item => <article className="photo-menu-draft" key={item.id}>
        <div className="photo-menu-draft-top"><span className="photo-menu-ai-label"><Sparkles size={12}/>AI suggested — review before confirming</span><button type="button" className="photo-menu-remove" aria-label={`Remove ${item.name}`} onClick={() => { setDrafts(items => items.filter(candidate => candidate.id !== item.id)); if (editingId === item.id) { setEditingId(null); setEditBackup(null) } }}><Trash2 size={15}/><span>Remove</span></button></div>
        {editingId === item.id ? <div className="photo-menu-edit-fields">
          <label>Menu item name<input autoFocus maxLength={100} value={item.name} onChange={event => update(item.id, { name: event.target.value })}/></label>
          <div className="photo-menu-edit-row"><label>Final price (RM)<input type="number" min="0" max="1000000" step="0.10" value={item.price} onChange={event => update(item.id, { price: Number(event.target.value) })}/></label><label>Category<select value={item.category_id} onChange={event => update(item.id, { category_id: event.target.value as OnboardingCategoryId })}>{categories.map(category => <option value={category.id} key={category.id}>{category.en}</option>)}</select></label></div>
          <p className="photo-menu-price-range">Estimated range: RM {item.price_min.toFixed(2)}–{item.price_max.toFixed(2)}</p>
          <div className="photo-menu-edit-actions"><button type="button" className="button secondary" onClick={cancelEdit}><X size={14}/>Cancel edit</button><button type="button" className="button primary" onClick={() => { setEditingId(null); setEditBackup(null) }} disabled={!item.name.trim()||!Number.isFinite(item.price)||item.price<0}><Check size={14}/>Save edit</button></div>
        </div> : <div className="photo-menu-draft-body"><div><h4>{item.name}</h4><span>{categories.find(category => category.id === item.category_id)?.en ?? 'Food'} · AI-estimated range RM {item.price_min.toFixed(2)}–{item.price_max.toFixed(2)}</span></div><strong>RM {item.price.toFixed(2)}</strong><button type="button" className="button secondary photo-menu-edit" onClick={() => edit(item)}><Pencil size={14}/>Edit</button></div>}
      </article>)}</div>
      <div className="photo-onboarding-confirm"><p>Confirming adds each reviewed suggestion as a normal menu item for <strong>{stall.name}</strong>. You can change names, prices, and categories above; ingredients and declarations remain unrecorded until you add them.</p><button type="button" className="button primary" onClick={() => void confirmAll()} disabled={saving||processing||!drafts.length}>{saving?<><LoaderCircle size={16} className="photo-onboarding-spinner"/>Saving reviewed menu…</>:<><Check size={16}/>Confirm all {drafts.length} menu items</>}</button></div>
    </>}
    {error&&<p className="photo-onboarding-error" role="alert">{error}</p>}
  </section>
}
