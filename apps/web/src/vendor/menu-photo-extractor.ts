export type OnboardingCategoryId = 'rice' | 'skewers' | 'kuih' | 'drinks' | 'fried' | 'produce'

export interface MenuPhotoSuggestion {
  id: string
  name: string
  category_id: OnboardingCategoryId
  price_min: number
  price_max: number
  price: number
}

type SuggestionSeed = Omit<MenuPhotoSuggestion, 'id' | 'category_id'>

const SUGGESTIONS: Record<OnboardingCategoryId, SuggestionSeed[]> = {
  skewers: [
    { name: 'Chicken satay', price_min: 6, price_max: 8, price: 7 },
    { name: 'Beef satay', price_min: 7, price_max: 10, price: 8.5 },
    { name: 'Grilled chicken wings', price_min: 6, price_max: 9, price: 7.5 },
    { name: 'Grilled corn', price_min: 3, price_max: 5, price: 4 },
  ],
  rice: [
    { name: 'Nasi lemak ayam', price_min: 7, price_max: 10, price: 8.5 },
    { name: 'Nasi goreng kampung', price_min: 7, price_max: 9, price: 8 },
    { name: 'Mee goreng', price_min: 6, price_max: 8, price: 7 },
    { name: 'Ayam kunyit rice set', price_min: 8, price_max: 11, price: 9.5 },
  ],
  kuih: [
    { name: 'Cendol', price_min: 4, price_max: 7, price: 5.5 },
    { name: 'Kuih lapis', price_min: 2, price_max: 4, price: 3 },
    { name: 'Seri muka', price_min: 2, price_max: 4, price: 3 },
    { name: 'Karipap', price_min: 2, price_max: 4, price: 3 },
  ],
  drinks: [
    { name: 'Teh tarik', price_min: 3, price_max: 5, price: 4 },
    { name: 'Air limau', price_min: 3, price_max: 5, price: 4 },
    { name: 'Sirap bandung', price_min: 3, price_max: 5, price: 4 },
    { name: 'Kopi ais', price_min: 3, price_max: 5, price: 4 },
  ],
  fried: [
    { name: 'Pisang goreng', price_min: 3, price_max: 6, price: 4.5 },
    { name: 'Cucur udang', price_min: 4, price_max: 7, price: 5.5 },
    { name: 'Popiah goreng', price_min: 3, price_max: 5, price: 4 },
    { name: 'Kentang goreng', price_min: 4, price_max: 7, price: 5.5 },
  ],
  produce: [
    { name: 'Seasonal fruit cup', price_min: 4, price_max: 7, price: 5.5 },
    { name: 'Fresh-cut pineapple', price_min: 3, price_max: 6, price: 4.5 },
    { name: 'Local leafy greens', price_min: 3, price_max: 5, price: 4 },
    { name: 'Mixed vegetables pack', price_min: 5, price_max: 8, price: 6.5 },
  ],
}

export function suggestedMenuDrafts(categoryId: OnboardingCategoryId): Omit<MenuPhotoSuggestion, 'id'>[] {
  return SUGGESTIONS[categoryId].map(item => ({ ...item, category_id: categoryId }))
}

/** Replace this adapter with the authenticated vision → structured menu extraction call when wired. */
export async function extractMenuFromPhoto(file: File, categoryId: OnboardingCategoryId): Promise<MenuPhotoSuggestion[]> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image of your stall sign or food display.')
  await new Promise(resolve => setTimeout(resolve, 850))
  return suggestedMenuDrafts(categoryId).map(item => ({ ...item, id: crypto.randomUUID() }))
}
