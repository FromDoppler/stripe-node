const Validators = require("../utils/validators");

/**
 * Middleware de validación para checkout
 */
const validateCheckout = (req, res, next) => {
  const { customerEmail } = req.body;

  if (!Validators.isValidEmail(customerEmail)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  next();
};

/**
 * Middleware de validación para session status
 */
const validateSessionId = (req, res, next) => {
  const { session_id } = req.query;

  if (!Validators.isValidSessionId(session_id)) {
    return res.status(400).json({ error: "Invalid session_id" });
  }

  next();
};

module.exports = {
  validateCheckout,
  validateSessionId
};
