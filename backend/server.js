/**
 * Side-Effect Predictor Backend Server
 * DISCLAIMER: For demonstration purposes only — not medical advice.
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/predict', require('./src/routes/predict'));
app.use('/api/drugs', require('./src/routes/drugs'));
app.use('/api', require('./src/routes/admin'));

// Health check
app.get('/api/health', async (req, res) => {
  const predictor = require('./src/services/predictor');
  const status = await predictor.getStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    disclaimer: 'For demonstration purposes only — not medical advice.',
    ...status
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('⚠️  DISCLAIMER: For demonstration purposes only — not medical advice.');
});

module.exports = app;


