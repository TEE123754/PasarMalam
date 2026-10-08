import { z } from 'zod'
import { categorySchema, plantDietSchema } from '../discovery/classifications'
import { allergensSchema, declarationsSchema } from '../listings/declarations'

export const actorSchema = z.object({
  id: z.string().uuid(), display_name: z.string(), locale: z.enum(['en','ms']), verified: z.boolean(),
  roles: z.array(z.enum(['customer','vendor','admin','partner','organiser'])),
})

export const discoverySchema = z.object({
  server_now: z.string().datetime({offset:true}).nullable().default(null),
  markets: z.array(z.object({
    kind:z.enum(['general','farmers']).optional(), id: z.string(), name: z.string(), area: z.string(), type: z.enum(['night','day']),
    hours: z.string(), days: z.string(), cover: z.string(), stallCount: z.number().int().nonnegative(),
    status: z.enum(['open','upcoming','closed']),
    latitude: z.number().nullable().default(null), longitude: z.number().nullable().default(null),
    schedules: z.array(z.object({ weekday: z.number().int().min(0).max(6), opens: z.string(), closes: z.string(), nextDay: z.boolean().default(false) })).default([]),
    exceptions: z.array(z.object({ date: z.string(), cancelled: z.boolean(), opens: z.string().nullable().default(null), closes: z.string().nullable().default(null) })).default([]),
    popularity: z.number().int().nonnegative().default(0), version: z.number().int().nonnegative().default(0),
  })),
  stalls: z.array(z.object({
    categoryId:categorySchema,availabilityConfirmedAt:z.string().datetime({offset:true}).nullable().optional(), id: z.string(), marketId: z.string(), name: z.string(), category: z.string(), specialty: z.string(), description:z.string().optional(), declarations:declarationsSchema.optional(), declarationsRecordedAt:z.string().datetime({offset:true}).nullable().optional(),
    priceSen: z.number().int().nonnegative(), rating: z.number().min(0).max(5), reviews: z.number().int().nonnegative(),
    photoUrl:z.string().nullable().default(null), image: z.string(), halal: z.enum(['declared','non-halal','not-declared']), open: z.boolean(),
    aliases: z.array(z.string()).default([]),
    lot:z.string().default(''), opens:z.string().nullable().default(null), closes:z.string().nullable().default(null), latitude:z.number().nullable().default(null), longitude:z.number().nullable().default(null),
    claims: z.array(z.object({ foodItemId: z.string().nullable().default(null), status: z.enum(['declared','certified','non-halal','not-declared']), expiresAt: z.string().datetime({offset:true}).nullable().default(null), reviewedAt: z.string().datetime({offset:true}).nullable().default(null), evidence: z.boolean().default(false) })).default([]),
  })),
  offers: z.array(z.object({
    id: z.string(), stallId: z.string(), title: z.string(), priceSen: z.number().int().nonnegative(),
    originalPriceSen: z.number().int().nonnegative(), endsAt: z.string(),
  })),
  updatedAt: z.string().datetime({ offset: true }),
  menu: z.array(z.object({ categoryId:categorySchema,plantDiet:plantDietSchema.optional(),plantDietRecordedAt:z.string().datetime({offset:true}).nullable().optional(), id: z.string(), stallId: z.string(), name: z.string(), priceSen: z.number().int().nonnegative(), ingredients: z.array(z.string()), allergens:allergensSchema.optional(), allergensRecordedAt:z.string().datetime({offset:true}).nullable().optional(), photoUrl:z.string().nullable().default(null) })).default([]),
  batches: z.array(z.object({ id: z.string(), foodItemId: z.string(), batchNumber: z.number().int().positive(), preparedAt: z.string().datetime({offset:true}), uploadedAt: z.string().datetime({offset:true}), remaining: z.number().int().nonnegative(), deadline: z.string().datetime({offset:true}), photoUrl:z.string().nullable().default(null), correctedPreparedAt:z.string().datetime({offset:true}).nullable().default(null) })).default([]),
  publicReviews: z.array(z.object({id:z.string(),stallId:z.string(),rating:z.number().int().min(1).max(5),body:z.string()})).default([]),
})
