import { Prisma } from '@prisma/client'

export type Recipe = Prisma.RecipeGetPayload<{
  include: {
    media: true
    reviews: {
      select: { id: true; rating: true }
    }
  }
}>;