const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const sportsRoutes = require('./routes/sportsRoutes');
const sessionsRoutes = require('./routes/sessionsRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SportSync API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/reports', reportsRoutes);

// If client build exists in production, serve it
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// API 404 handler (for any unmatched /api requests)
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Frontend SPA fallback (serves index.html for non-API client routes in production)
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('SportSync Client build not found. Run "npm run build" in /client first.');
    }
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
