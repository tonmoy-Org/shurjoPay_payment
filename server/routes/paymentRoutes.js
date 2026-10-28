const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Initiate payment transaction
router.post('/initiate', paymentController.initiatePayment);

// Callback from shurjoPay (GET redirect)
router.get('/callback', paymentController.handleCallback);

// Verify payment status
router.get('/verify/:order_id', paymentController.verifyPaymentStatus);

// List all transactions
router.get('/orders', paymentController.getAllOrders);

module.exports = router;
