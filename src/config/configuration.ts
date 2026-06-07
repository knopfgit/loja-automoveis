/**
 * Centralized, typed configuration loaded from environment variables.
 * Access via ConfigService.get('app.port') etc.
 */
export default () => ({
  app: {
    env: process.env.NODE_ENV || 'development',
    name: process.env.APP_NAME || 'Auto Dealer API',
    port: parseInt(process.env.APP_PORT || '3000', 10),
    globalPrefix: process.env.APP_GLOBAL_PREFIX || 'api',
    url: process.env.APP_URL || 'http://localhost:3000',
    publicUrl: process.env.PUBLIC_URL || 'http://localhost:3000',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    cacheTtl: parseInt(process.env.CACHE_TTL || '3600', 10),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    passwordResetExpiresMin: parseInt(
      process.env.PASSWORD_RESET_EXPIRES_MIN || '30',
      10,
    ),
  },
  security: {
    corsOrigins: (process.env.CORS_ORIGINS || '*')
      .split(',')
      .map((o) => o.trim()),
    throttleTtl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    throttleLimit: parseInt(process.env.THROTTLE_LIMIT || '120', 10),
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    loginMaxAttempts: parseInt(process.env.LOGIN_MAX_ATTEMPTS || '5', 10),
    loginLockMinutes: parseInt(process.env.LOGIN_LOCK_MINUTES || '15', 10),
  },
  storage: {
    driver: process.env.STORAGE_DRIVER || 'local',
    localPath: process.env.STORAGE_LOCAL_PATH || './storage',
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10),
    allowedMime: (
      process.env.UPLOAD_ALLOWED_MIME ||
      'image/jpeg,image/png,image/webp,application/pdf'
    )
      .split(',')
      .map((m) => m.trim()),
    s3: {
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'us-east-1',
      bucket: process.env.S3_BUCKET,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      publicUrl: process.env.S3_PUBLIC_URL,
    },
  },
  mail: {
    driver: process.env.MAIL_DRIVER || 'console',
    host: process.env.MAIL_HOST || 'localhost',
    port: parseInt(process.env.MAIL_PORT || '1025', 10),
    secure: process.env.MAIL_SECURE === 'true',
    user: process.env.MAIL_USER || undefined,
    password: process.env.MAIL_PASSWORD || undefined,
    fromName: process.env.MAIL_FROM_NAME || 'Auto Dealer',
    fromAddress: process.env.MAIL_FROM_ADDRESS || 'no-reply@autodealer.local',
  },
  business: {
    whatsappCountryCode: process.env.WHATSAPP_COUNTRY_CODE || '55',
    leadAssignmentStrategy:
      process.env.LEAD_ASSIGNMENT_STRATEGY || 'round_robin',
    docExpiryAlertDays: parseInt(process.env.DOC_EXPIRY_ALERT_DAYS || '30', 10),
    reservationDefaultDays: parseInt(
      process.env.RESERVATION_DEFAULT_DAYS || '3',
      10,
    ),
    vehicleSpecsProvider: process.env.VEHICLE_SPECS_PROVIDER || 'mock',
    vehicleSpecsApiUrl: process.env.VEHICLE_SPECS_API_URL,
    vehicleSpecsApiKey: process.env.VEHICLE_SPECS_API_KEY,
  },
});
