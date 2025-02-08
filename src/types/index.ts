export type MediaType = 'IMAGE' | 'VIDEO'

export interface Media {
  id: string
  url: string
  publicId: string
  type: MediaType
  recipeId: string | null
}