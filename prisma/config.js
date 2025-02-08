module.exports = {
  client: {
    // Ensure we're using the Node.js runtime
    runtime: 'nodejs',
    
    // Configure connection pooling
    connection: {
      pool: {
        min: 2,
        max: 10
      }
    },
    
    // Add error handling
    errorFormat: 'pretty',
    
    // Enable query logging in development
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  }
} 