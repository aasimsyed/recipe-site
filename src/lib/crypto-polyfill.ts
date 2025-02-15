import { Crypto } from '@peculiar/webcrypto'

if (typeof window === 'undefined' && !global.crypto) {
  // Use pure JS implementation for Edge runtime
  global.crypto = new Crypto()
}

export {} 