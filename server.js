// This is your test secret API key.
// test card 4242 4242 4242 4242 https://stripe.com/docs/testing?locale=es-419
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const createCustomerUrl = process.env.CREATE_CUSTOMER_URL;
const stripe = require('stripe')(stripeSecretKey);
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.static('public'));

const YOUR_DOMAIN = 'http://localhost:4242';

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: 'price_1OVFAuGO6oEBAyYIWfztKClH',
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
    allow_promotion_codes: true,
    return_url: `${YOUR_DOMAIN}/return.html?session_id={CHECKOUT_SESSION_ID}`,
    automatic_tax: {enabled: true},
  });

  res.send({clientSecret: session.client_secret});
});

app.get('/session-status', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    // Filtrar y seleccionar los campos necesarios
    const filteredSession = {
        price: session.amount_subtotal / 100,
        discount: session.total_details.amount_discount / 100,
        final_price: (session.amount_subtotal - session.total_details.amount_discount) / 100,
        currency: session.currency,
        customer_name: session.customer_details.name,
        customer_email: session.customer_details.email,
        customer_country: session.customer_details.address.country,
        tax_id: session.custom_fields.find(field => field.key === 'taxid')?.text?.value,
        payment_status:session.payment_status,
        payment_intent: session.payment_intent,
        payment_method_configuration_id: session.payment_method_configuration_details.id
    };
    const response = await axios.post(createCustomerUrl, filteredSession);
    res.send({
        status: session.status,
        customer_details: filteredSession
    });
  } catch (error) {
    console.log('Error retrieving session:', error);
      console.error('Error retrieving session:', error);
      res.status(500).send({ error: 'Error retrieving session' });
  }
});

app.listen(4242, () => console.log('Running on port 4242'));