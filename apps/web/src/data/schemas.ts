import { z } from 'zod'

export const actorSchema = z.object({
  id: z.string().uuid(), display_name: z.string(), locale: z.enum(['en','ms']), verified: z.boolean(),
  roles: z.array(z.enum(['customer','vendor','admin','partner','organiser'])),
})

export const discoverySchema = z.object({
  markets: z.array(z.object({
    id: z.string(), name: z.string(), area: z.string(), type: z.enum(['night','day']),
    hours: z.string(), days: z.string(), cover: z.string(), stallCount: z.number().int().nonnegative(),
    status: z.enum(['open','upcoming','closed']),
  })),
  stalls: z.array(z.object({
    id: z.string(), marketId: z.string(), name: z.string(), category: z.string(), specialty: z.string(),
    priceSen: z.number().int().nonnegative(), rating: z.number().min(0).max(5), reviews: z.number().int().nonnegative(),
    image: z.string(), halal: z.enum(['declared','non-halal','not-declared']), open: z.boolean(),
  })),
  offers: z.array(z.object({
    id: z.string(), stallId: z.string(), title: z.string(), priceSen: z.number().int().nonnegative(),
    originalPriceSen: z.number().int().nonnegative(), endsAt: z.string(),
  })),
  updatedAt: z.string().datetime({ offset: true }),
})
