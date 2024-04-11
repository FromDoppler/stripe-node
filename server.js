const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const createCustomerUrl = process.env.CREATE_CUSTOMER_URL;
const eventName = process.env.EVENT_NAME;
const eventPhase = process.env.EVENT_PHASE;
const ticketName = process.env.TICKET_NAME;
const ticketPriceId = process.env.TICKET_PRICE_ID;
const stripe = require('stripe')(stripeSecretKey);
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.static('public'));
app.use(express.json());

const domain = process.env.DOMAIN;

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

app.post('/create-checkout-session', async (req, res) => {
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
            custom: 'TAX ID',
          },
          type: 'text',
          optional: false,
          text: {
            minimum_length: 10
          }
        },
      ],
      mode: 'payment',
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      return_url: `${domain}/return.html?session_id={CHECKOUT_SESSION_ID}`,
      automatic_tax: {enabled: true},
    };

    if (req.body.customerEmail) {
      createObj.customer_email = req.body.customerEmail;
    }

    const session = await stripe.checkout.sessions.create(createObj);
    res.send({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).send({ error: 'Error creating checkout session' });
  }
});

app.get('/session-status', async (req, res) => {
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

app.listen(4242, () => console.log('Running on port 4242'));
