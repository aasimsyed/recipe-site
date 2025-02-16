import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  
  if (!query) {
    return NextResponse.json({ results: [] })
  }

  const cacheKey = `search:${query}`

  try {
    // Check cache first
    if (redis) {
      const cached = await redis.get(cacheKey)
      if (cached) {
        // Handle empty cache value
        const parsedCache = typeof cached === 'string' && cached.length > 0 
          ? JSON.parse(cached)
          : null

        if (parsedCache) {
          return NextResponse.json({
            results: parsedCache,
            source: 'cache'
          })
        }
      }
    }

    // Perform search
    const results = await prisma.recipe.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        media: {
          take: 1,
          select: {
            url: true
          }
        }
      },
      take: 10
    })

    // Cache results
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(results), {
        ex: 3600 // Cache for 1 hour
      })
    }

    return NextResponse.json({
      results,
      source: 'db'
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
} 