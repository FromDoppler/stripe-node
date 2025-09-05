const express = require("express");
const config = require("../../config");

// Controllers
const CheckoutController = require("../controllers/checkoutController");
const SessionController = require("../controllers/sessionController");

// Middlewares
const {
  validateCheckout,
  validateSessionId,
} = require("../middlewares/validation");

const router = express.Router();

/**
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: config.npmPackageVersion,
  });
});

/**
 * Checkout routes
 */
router.post(
  `${config.folderNode}create-checkout-session`,
  validateCheckout,
  CheckoutController.createCheckoutSession,
);

/**
 * Session routes
 */
router.get(
  `${config.folderNode}session-status`,
  validateSessionId,
  SessionController.getSessionStatus,
);

module.exports = router;
