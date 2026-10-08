import { z } from 'zod'

export const statementSchema = z.enum(['unknown', 'yes', 'no'])
export const declarationsSchema = z.object({
  pork_free: statementSchema, alcohol_free: statementSchema, muslim_owned: statementSchema,
}).strict()
export const unknownDeclarations = { pork_free: 'unknown', alcohol_free: 'unknown', muslim_owned: 'unknown' } as const
export const allergenCodes = ['peanuts', 'tree-nuts', 'milk', 'eggs', 'soy', 'wheat', 'fish', 'shellfish', 'sesame', 'other'] as const
export const allergensSchema = z.object({
  status: z.enum(['unknown', 'confirmed']),
  contains: z.array(z.enum(allergenCodes)).max(allergenCodes.length),
  cross_contact: z.enum(['unknown', 'possible']),
}).strict().refine(v => new Set(v.contains).size === v.contains.length && (v.status !== 'unknown' || v.contains.length === 0), 'Confirm the allergen statement or leave it unknown')
export const unknownAllergens = { status: 'unknown', contains: [], cross_contact: 'unknown' } as const
export type Declarations = z.infer<typeof declarationsSchema>
export type Allergens = z.infer<typeof allergensSchema>

export function changedIngredients(before: string[], after: string[]) {
  return JSON.stringify(before) !== JSON.stringify(after)
}
