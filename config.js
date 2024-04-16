const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const CREATE_CUSTOMER_URL = process.env.CREATE_CUSTOMER_URL;
const EVENT_NAME = process.env.EVENT_NAME;
const EVENT_PHASE = process.env.EVENT_PHASE;
const TICKET_NAME = process.env.TICKET_NAME;
const TICKET_PRICE_ID = process.env.TICKET_PRICE_ID;
const DOMAIN = process.env.DOMAIN;
const RETURN_URL = process.env.RETURN_URL;
const FOLDER_NODE = process.env.FOLDER_NODE;
const PORT = process.env.PORT;

module.exports = {
  DOMAIN,
  STRIPE_SECRET_KEY,
  CREATE_CUSTOMER_URL,
  RETURN_URL,
  EVENT_NAME,
  EVENT_PHASE,
  TICKET_PRICE_ID,
  TICKET_NAME,
  FOLDER_NODE,
  PORT
};
