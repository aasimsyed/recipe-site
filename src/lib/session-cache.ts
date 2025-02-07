import { Session } from 'next-auth'

class SessionCache {
  private static instance: SessionCache
  private cache: Map<string, Session>
  private expiryTimes: Map<string, number>

  private constructor() {
    this.cache = new Map()
    this.expiryTimes = new Map()
  }

  static getInstance(): SessionCache {
    if (!SessionCache.instance) {
      SessionCache.instance = new SessionCache()
    }
    return SessionCache.instance
  }

  set(key: string, session: Session, expiryMinutes: number = 5) {
    this.cache.set(key, session)
    this.expiryTimes.set(key, Date.now() + expiryMinutes * 60 * 1000)
  }

  get(key: string): Session | null {
    const expiryTime = this.expiryTimes.get(key)
    if (!expiryTime || Date.now() > expiryTime) {
      this.cache.delete(key)
      this.expiryTimes.delete(key)
      return null
    }
    return this.cache.get(key) || null
  }
}

export const sessionCache = SessionCache.getInstance() 