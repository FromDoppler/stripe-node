/**
 * Middleware de manejo de errores centralizado
 */
const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err.message, err.stack);

  // Error de validación
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      details: err.message,
    });
  }

  // Error de Stripe
  if (err.type && err.type.startsWith("Stripe")) {
    return res.status(502).json({
      error: "Payment service error",
      details: "Please try again later",
    });
  }

  // Error generico
  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  });
};

/**
 * Middleware para rutas no encontradas
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.originalUrl,
    method: req.method,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
