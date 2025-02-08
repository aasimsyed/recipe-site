if (!process.env.ALLOWED_ADMIN_EMAILS) {
  throw new Error('ALLOWED_ADMIN_EMAILS environment variable is required')
}

export const adminConfig = {
  allowedEmails: process.env.ALLOWED_ADMIN_EMAILS.split(',').map(email => email.trim()),
  maxLoginAttempts: 5,
  sessionDuration: 24 * 60 * 60, // 24 hours in seconds
} 