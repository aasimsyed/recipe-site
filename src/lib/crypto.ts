import { createHash } from 'crypto-browserify'

export function safeHash(input: string): string {
  return createHash('sha256')
    .update(input)
    .digest('hex')
} 