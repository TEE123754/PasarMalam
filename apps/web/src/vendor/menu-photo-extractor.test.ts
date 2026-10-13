import { describe, expect, it } from 'vitest'
import { categoryIds } from '../discovery/classifications'
import { suggestedMenuDrafts } from './menu-photo-extractor'

describe('photo menu draft suggestions', () => {
  it('returns four structured, price-bounded drafts for every menu category', () => {
    for (const categoryId of categoryIds) {
      const drafts = suggestedMenuDrafts(categoryId)
      expect(drafts).toHaveLength(4)
      expect(drafts.every(draft => draft.category_id === categoryId && draft.name.trim().length > 0)).toBe(true)
      expect(drafts.every(draft => draft.price_min <= draft.price && draft.price <= draft.price_max)).toBe(true)
    }
  })

  it('provides the expected skewer sample without requiring manual name entry', () => {
    expect(suggestedMenuDrafts('skewers').map(draft => draft.name)).toContain('Chicken satay')
  })
})
