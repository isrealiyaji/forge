const required = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
};

const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  webAppUrl: process.env.WEB_APP_URL || "http://localhost:3000",

  databaseUrl: required("DATABASE_URL"),

  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET"),
    refreshSecret: required("JWT_REFRESH_SECRET"),
    accessTtl: process.env.JWT_ACCESS_TTL || "15m",
    refreshTtl: process.env.JWT_REFRESH_TTL || "7d",
  },

  paystack: {
    secretKey: required("PAYSTACK_SECRET_KEY"),
    publicKey: required("PAYSTACK_PUBLIC_KEY"),
    baseUrl: process.env.PAYSTACK_BASE_URL || "https://api.paystack.co",
    currency: process.env.PAYSTACK_CURRENCY || "NGN",
  },

  cloudinary: {
    cloudName: required("CLOUDINARY_CLOUD_NAME"),
    apiKey: required("CLOUDINARY_API_KEY"),
    apiSecret: required("CLOUDINARY_API_SECRET"),
  },

  notifications: {
    provider: process.env.NOTIFICATION_PROVIDER || "resend",
    emailFrom: process.env.EMAIL_FROM || "Forge Athletic Club <no-reply@forgeathletic.club>",
    resend: {
      apiKey: process.env.RESEND_API_KEY,
    },
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    loginMax: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 10,
  },

  defaults: {
    subscriptionGracePeriodDays: Number(process.env.SUBSCRIPTION_GRACE_PERIOD_DAYS) || 3,
    maxMembersPerInstructor: Number(process.env.MAX_MEMBERS_PER_INSTRUCTOR) || 25,
  },
};

module.exports = config;
