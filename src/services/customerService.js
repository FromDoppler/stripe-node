const DateHelpers = require("../utils/dateHelpers");

class CustomerService {
  transformSessionData(session, utmData, eventData) {
    const amountSubtotal = session.amount_subtotal || 0;
    const amountDiscount = session.total_details?.amount_discount || 0;

    return {
      price: (amountSubtotal / 100).toFixed(2),
      discount: (amountDiscount / 100).toFixed(2),
      final_price: ((amountSubtotal - amountDiscount) / 100).toFixed(2),
      currency: session.currency,
      customer_name: session.customer_details?.name,
      customer_email: session.customer_details?.email,
      customer_country: session.customer_details?.address?.country,
      tax_id: session.custom_fields?.find((field) => field.key === "taxid")
        ?.text?.value,
      payment_status: session.payment_status,
      session_id: session.id,
      coupon_id:
        session.total_details?.breakdown?.discounts?.[0]?.discount?.coupon?.id ??
        null,
      coupon_name:
        session.total_details?.breakdown?.discounts?.[0]?.discount?.coupon?.name ??
        null,
      event_name: eventData.eventName,
      event_phase: eventData.eventPhase,
      ticket_name: eventData.ticketName,
      ticket_price_id: eventData.ticketPriceId,
      date: DateHelpers.getCurrentDate(),
      datetime: DateHelpers.getCurrentISO(),
      ...utmData,
    };
  }

  extractUtmData(query) {
    const utmParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "origin",
    ];
    return utmParams.reduce((acc, param) => {
      acc[param] = query[param] || null;
      return acc;
    }, {});
  }

  /**
   * Envía datos del cliente a la API externa
   */
  async sendCustomerData(url, customerData) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON response: ${text.slice(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${data.message || "Unknown error"}`
        );
      }

      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.error("Customer data delivery timeout after 10s");
        throw new Error("External API timeout");
      }
      console.error("Customer data delivery failed:", err.message);
      throw err;
    }
  }
}

module.exports = new CustomerService();
