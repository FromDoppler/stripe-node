const stripeService = require("../services/stripeService");

class CheckoutController {
  static async createCheckoutSession(req, res) {
    try {
      const { customerEmail, promotionCode, ...utmParams } = req.body;

      const utmString = new URLSearchParams(utmParams).toString();
      const returnUrl = `${process.env.ORIGIN_DOMAIN_EMMS}${process.env.RETURN_URL}?session_id={CHECKOUT_SESSION_ID}&${utmString}`;

      const session = await stripeService.createCheckoutSession({
        customerEmail,
        promotionCode,
        utmParams,
        ticketPriceId: process.env.TICKET_PRICE_ID,
        returnUrl,
      });

      res.json({ clientSecret: session.client_secret });
    } catch (error) {
      console.error("Checkout error:", error.message);
      res.status(500).json({ error: "Error creating checkout session" });
    }
  }
}

module.exports = CheckoutController;
