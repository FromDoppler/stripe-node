const config = require("../../config");
const stripe = require("stripe")(config.stripeSecretKey);

class StripeService {
  async createCheckoutSession(params) {
    const {
      customerEmail,
      promotionCode,
      utmParams,
      ticketPriceId,
      returnUrl,
    } = params;

    const createObj = {
      ui_mode: "embedded",
      line_items: [{ price: ticketPriceId, quantity: 1 }],
      custom_fields: [
        {
          key: "taxid",
          label: {
            type: "custom",
            custom: "CUIT/TAXID/NIF/CIF/RFC/CC/RUC/DUI/RUT",
          },
          type: "text",
          optional: false,
        },
      ],
      mode: "payment",
      payment_method_types: ["card"],
      return_url: returnUrl,
      automatic_tax: { enabled: true },
    };

    if (customerEmail) createObj.customer_email = customerEmail;

    if (promotionCode) {
      createObj.discounts = [{ promotion_code: promotionCode }];
    } else {
      createObj.allow_promotion_codes = true;
    }

    return await stripe.checkout.sessions.create(createObj);
  }

  async retrieveSession(sessionId) {
    return await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "total_details.breakdown"],
    });
  }
}

module.exports = new StripeService();
