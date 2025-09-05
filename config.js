const requiredEnvVars = [
  "STRIPE_SECRET_KEY",
  "CREATE_CUSTOMER_URL",
  "EVENT_NAME",
  "EVENT_PHASE",
  "TICKET_NAME",
  "TICKET_PRICE_ID",
  "ORIGIN_DOMAIN_EMMS",
  "RETURN_URL",
  "FOLDER_NODE",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT) || 3000,

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,

  // External API
  createCustomerUrl: process.env.CREATE_CUSTOMER_URL,

  // Event data
  eventName: process.env.EVENT_NAME,
  eventPhase: process.env.EVENT_PHASE,
  ticketName: process.env.TICKET_NAME,
  ticketPriceId: process.env.TICKET_PRICE_ID,

  // URLs and domains
  domain: process.env.DOMAIN,
  originDomainEmms: process.env.ORIGIN_DOMAIN_EMMS,
  returnUrl: process.env.RETURN_URL,
  folderNode: process.env.FOLDER_NODE,

  // Optional
  npmPackageVersion: process.env.npm_package_version || "1.0.0",
};

module.exports = config;
