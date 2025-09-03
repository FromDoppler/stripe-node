const express = require("express");
const { FOLDER_NODE } = require("../../config");

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
    version: process.env.npm_package_version || "1.0.0",
  });
});

/**
 * Checkout routes
 */
router.post(
  `${FOLDER_NODE}create-checkout-session`,
  validateCheckout,
  CheckoutController.createCheckoutSession,
);

/**
 * Session routes
 */
router.get(
  `${FOLDER_NODE}session-status`,
  validateSessionId,
  SessionController.getSessionStatus,
);

module.exports = router;
