const express = require("express");
const cors = require("cors");

const { DOMAIN, ORIGIN_DOMAIN_EMMS } = require("../config");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

function createApp() {
  const app = express();

  // Middlewares básicos
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // CORS configuration
  const corsOptions = {
    origin: [DOMAIN, ORIGIN_DOMAIN_EMMS].filter(Boolean),
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  };
  app.use(cors(corsOptions));

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Request logging (development)
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
      next();
    });
  }

  // Routes
  app.use('/', routes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
