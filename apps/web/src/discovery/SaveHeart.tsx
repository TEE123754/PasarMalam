import { Heart } from 'lucide-react'
import type { DataGateway } from '../data/types'
import { ui } from '../locales/phrases'
import { useFavourites } from './actions'
import './SaveHeart.css'

// The save heart. With a `foodId` it saves that food and its stall (demo) and shows saved only for that food;
// without one it saves the stall, as on a stall page. Used by food cards and by the Offers cards.
export function SaveHeart({ gateway, stallId, stallName, foodId, foodName }: { gateway: DataGateway; stallId: string; stallName: string; foodId?: string; foodName?: string }) {
  const saved = useFavourites(gateway)
  const isSaved = foodId ? saved.isFoodSaved(foodId, stallId) : saved.ids.includes(stallId)
  const toggle = () => void (foodId ? saved.saveFood(foodId, stallId, !isSaved) : saved.save(stallId, !isSaved)).catch(() => undefined)
  return <button type="button" className="food-save" aria-pressed={isSaved} aria-label={`${ui(isSaved ? 'Unsave' : 'Save')} ${foodName ?? stallName}`} disabled={!saved.allowed || saved.loading} onClick={toggle}><Heart size={16} fill={isSaved ? 'currentColor' : 'none'}/></button>
}
