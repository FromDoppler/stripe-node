const config = require("../../config");
const stripeService = require("../services/stripeService");

class CheckoutController {
  static async createCheckoutSession(req, res) {
    try {
      const { customerEmail, promotionCode, ...utmParams } = req.body;

      const utmString = new URLSearchParams(utmParams).toString();
      const baseReturnUrl = customerEmail
        ? config.returnUrlRegistered
        : config.returnUrlAnonymous;
      const returnUrl = `${config.originDomainEmms}${baseReturnUrl}?session_id={CHECKOUT_SESSION_ID}&${utmString}`;

      const session = await stripeService.createCheckoutSession({
        customerEmail,
        promotionCode,
        utmParams,
        ticketPriceId: config.ticketPriceId,
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
