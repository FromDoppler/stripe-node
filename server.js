const {
  DOMAIN,
  ORIGIN_DOMAIN_EMMS,
  STRIPE_SECRET_KEY,
  CREATE_CUSTOMER_URL,
  EVENT_NAME,
  EVENT_PHASE,
  TICKET_PRICE_ID,
  TICKET_NAME,
  RETURN_URL,
  FOLDER_NODE,
  PORT
} = require('./config');

const allowedOrigins = [DOMAIN, ORIGIN_DOMAIN_EMMS];
const stripeSecretKey = STRIPE_SECRET_KEY;
const createCustomerUrl = CREATE_CUSTOMER_URL;
const eventName = EVENT_NAME;
const eventPhase = EVENT_PHASE;
const ticketName = TICKET_NAME;
const ticketPriceId = TICKET_PRICE_ID;
const folderNode = FOLDER_NODE;
const stripe = require('stripe')(stripeSecretKey);
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.static('public'));
app.use(express.json());

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

const getCurrentDate = () => {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  return `${day}/${month}/${year}`;
};


const getCurrentDateTime = () => {
  const currentDateTime = new Date().toISOString();
  return currentDateTime;
};
app.post(`${folderNode}create-checkout-session`, async (req, res) => {
  try {
    let createObj = {
      ui_mode: 'embedded',
      line_items: [
        {
          price: ticketPriceId,
          quantity: 1,
        },
      ],
      custom_fields: [
        {
          key: 'taxid',
          label: {
            type: 'custom',
            custom: 'CUIT/TAXID/NIF/CIF/RFC/CC/RUC/DUI/RUT',
          },
          type: 'text',
          optional: false
        },
      ],
      mode: 'payment',
      payment_method_types: ['card'],
      return_url: `${ORIGIN_DOMAIN_EMMS}${RETURN_URL}?session_id={CHECKOUT_SESSION_ID}`,
      automatic_tax: { enabled: true },
    };

    if (req.body.customerEmail) {
      createObj.customer_email = req.body.customerEmail;
    }

    if (req.body.promotionCode) {
      const promotionCode = req.body.promotionCode;
      createObj.discounts = [
        { promotion_code: promotionCode }
      ];
    } else {
      createObj.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(createObj);
    res.send({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).send({ error: 'Error creating checkout session' });
  }
});

app.get(`${folderNode}session-status`, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id, {
      expand: ['customer', 'total_details.breakdown'],
    });

    const filteredSession = {
      price: (session.amount_subtotal / 100).toFixed(2),
      discount: (session.total_details.amount_discount / 100).toFixed(2),
      final_price: ((session.amount_subtotal - session.total_details.amount_discount) / 100).toFixed(2),
      currency: session.currency,
      customer_name: session.customer_details.name,
      customer_email: session.customer_details.email,
      customer_country: session.customer_details.address.country,
      tax_id: session.custom_fields.find(field => field.key === 'taxid')?.text?.value,
      payment_status: session.payment_status,
      session_id: session.id,
      coupon_id: session.total_details.breakdown.discounts[0]?.discount?.coupon?.id ?? null,
      coupon_name: session.total_details.breakdown.discounts[0]?.discount?.coupon?.name ?? null,
      event_name: eventName,
      event_phase: eventPhase,
      ticket_name: ticketName,
      ticket_price_id: ticketPriceId,
      date: getCurrentDate(),
      datetime: getCurrentDateTime()
    };

    const response = await axios.post(createCustomerUrl, filteredSession);
    res.send({
      status: session.status,
      customer_details: filteredSession,
      response: response.data
    });
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).send({ error: 'Error retrieving session' });
  }
});

app.listen(PORT, () => console.log('Running on port ' + PORT));
