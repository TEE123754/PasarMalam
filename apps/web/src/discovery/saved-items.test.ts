import { describe, expect, it } from 'vitest'
import sample from '../../../../contracts/discovery-fixture.json'
import { discoverySchema } from '../data/schemas'
import { applyFoodSave, applyStallSave, isFoodSaved, savedItems, signatureFoodId, type SavedState } from './actions'

const base = discoverySchema.parse(sample)
// The sample has one food per stall: give the first stall a second food
const stallId = base.menu[0].stallId
const data = { ...base, menu: [...base.menu, { ...base.menu[0], id: 'extra-food', name: 'Extra food' }] }
const [first, second] = data.menu.filter(food => food.stallId === stallId)
const empty: SavedState = { ids: [], foods: [] }

describe('saved foods and stalls', () => {
  it('saving a food saves the food and its stall; removing the last food removes the stall', () => {
    const one = applyFoodSave(empty, first.id, stallId, true, first.id)
    expect(one).toEqual({ ids: [stallId], foods: [{ foodId: first.id, stallId }] })
    const two = applyFoodSave(one, second.id, stallId, true, first.id)
    expect(two.ids).toEqual([stallId])
    expect(two.foods).toHaveLength(2)
    const back = applyFoodSave(two, first.id, stallId, false, first.id)
    expect(back.ids).toEqual([stallId])
    expect(applyFoodSave(back, second.id, stallId, false, first.id)).toEqual(empty)
  })
  it('a stall saved before foods were tracked shows its signature food and only that food', () => {
    const legacy: SavedState = { ids: [stallId], foods: [] }
    expect(signatureFoodId(data, stallId)).toBe(first.id)
    expect(isFoodSaved(legacy, first.id, stallId, first.id)).toBe(true)
    expect(isFoodSaved(legacy, second.id, stallId, first.id)).toBe(false)
    expect(savedItems(legacy, data)).toEqual([{ stallId, foodId: first.id }])
  })
  it('adding another food to a legacy stall keeps its signature food', () => {
    const next = applyFoodSave({ ids: [stallId], foods: [] }, second.id, stallId, true, first.id)
    expect(savedItems(next, data).map(item => item.foodId)).toEqual([first.id, second.id])
  })
  it('removing the signature food of a legacy stall removes the stall', () => {
    expect(applyFoodSave({ ids: [stallId], foods: [] }, first.id, stallId, false, first.id)).toEqual(empty)
  })
  it('un-saving a stall removes its foods too, and unknown stalls are not listed', () => {
    const state = applyFoodSave(empty, second.id, stallId, true, first.id)
    expect(applyStallSave(state, stallId, false)).toEqual(empty)
    expect(savedItems({ ids: ['not-a-stall'], foods: [] }, data)).toEqual([])
  })
  it('lists each saved food once, in saved order', () => {
    const state = applyFoodSave(applyFoodSave(empty, second.id, stallId, true, first.id), second.id, stallId, true, first.id)
    expect(savedItems(state, data)).toEqual([{ stallId, foodId: second.id }])
  })
})
