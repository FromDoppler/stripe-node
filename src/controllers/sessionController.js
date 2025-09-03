const stripeService = require("../services/stripeService");
const customerService = require("../services/customerService");

class SessionController {
  static async getSessionStatus(req, res) {
    const { session_id } = req.query;

    let session;
    try {
      session = await stripeService.retrieveSession(session_id);
    } catch (err) {
      console.error("Error fetching Stripe session:", err.message);
      return res
        .status(502)
        .json({ error: "Failed to retrieve session from Stripe" });
    }

    let utmData = {};
    try {
      utmData = customerService.extractUtmData(req.query);
    } catch (err) {
      console.warn("UTM extraction failed, continuing without UTM data");
    }

    const eventData = {
      eventName: process.env.EVENT_NAME,
      eventPhase: process.env.EVENT_PHASE,
      ticketName: process.env.TICKET_NAME,
      ticketPriceId: process.env.TICKET_PRICE_ID,
    };

    let customerDetails;
    try {
      customerDetails = customerService.transformSessionData(
        session,
        utmData,
        eventData
      );
    } catch (err) {
      console.error("Session transformation failed:", err.message);
      return res
        .status(500)
        .json({ error: "Failed to transform session data" });
    }

    if (session.payment_status !== "paid") {
      return res.json({
        status: session.status,
        payment_status: session.payment_status,
        customer_details: customerDetails,
        response: { message: "Payment not completed yet" },
      });
    }

    try {
      const externalResponse = await customerService.sendCustomerData(
        process.env.CREATE_CUSTOMER_URL,
        customerDetails
      );

      return res.json({
        status: session.status,
        payment_status: session.payment_status,
        customer_details: customerDetails,
        response: externalResponse,
      });
    } catch (err) {
      console.error("External delivery failed:", err.message);
      return res
        .status(502)
        .json({ error: "Failed to deliver customer data" });
    }
  }
}

module.exports = SessionController;
