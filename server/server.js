require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes (mount both with and without /api prefix for robust routing)
app.use('/api/payment', paymentRoutes);
app.use('/payment', paymentRoutes);

// Health check
const healthHandler = (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'shurjoPay MERN Integration API'
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Root welcome route
const welcomeHandler = (req, res) => {
  res.json({
    message: 'shurjoPay Payment Gateway Server is running.',
    endpoints: {
      initiate: 'POST /api/payment/initiate',
      callback: 'GET /api/payment/callback',
      verify: 'GET /api/payment/verify/:order_id',
      orders: 'GET /api/payment/orders'
    }
  });
};
app.get('/', welcomeHandler);
app.get('/api', welcomeHandler);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` shurjoPay Callback: http://localhost:${PORT}/api/payment/callback`);
  console.log(`=========================================`);
});

module.exports = app;
