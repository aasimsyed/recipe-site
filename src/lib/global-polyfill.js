const globalPolyfill = 
  typeof globalThis !== 'undefined' ? globalThis :
  typeof self !== 'undefined' ? self :
  typeof window !== 'undefined' ? window :
  typeof global !== 'undefined' ? global :
  {};

module.exports = globalPolyfill; 