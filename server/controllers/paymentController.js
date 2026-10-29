const Payment = require('../models/Payment');
const shurjopayService = require('../services/shurjopayService');

// In-memory store fallback if MongoDB is not connected
const inMemoryPayments = new Map();

/**
 * Initiate Payment
 * POST /api/payment/initiate
 */
exports.initiatePayment = async (req, res) => {
  try {
    const {
      amount,
      customer_name,
      customer_phone,
      customer_city,
      customer_address,
      customer_email,
      currency = 'BDT',
      customer_post_code = '1200'
    } = req.body;

    // Validate required fields
    if (!amount || !customer_name || !customer_phone || !customer_city || !customer_address) {
      return res.status(400).json({
        success: false,
        message: 'Amount, Customer Name, Phone, City, and Address are required.'
      });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number.'
      });
    }

    // Generate unique order ID
    const prefix = process.env.SP_PREFIX || 'NOK';
    const uniqueSuffix = Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const order_id = `${prefix}${uniqueSuffix}`;

    // Get client IP
    const client_ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '127.0.0.1';

    // Initiate transaction with shurjoPay
    const spResult = await shurjopayService.makePayment({
      amount: Number(amount),
      order_id,
      currency,
      customer_name,
      customer_phone,
      customer_city,
      customer_address,
      customer_email: customer_email || 'customer@example.com',
      customer_post_code,
      client_ip: client_ip === '::1' ? '127.0.0.1' : client_ip
    });

    const paymentRecordData = {
      order_id,
      sp_order_id: spResult.sp_order_id || '',
      customer_order_id: spResult.customer_order_id || order_id,
      amount: Number(amount),
      payable_amount: Number(spResult.amount || amount),
      currency,
      customer_name,
      customer_phone,
      customer_email: customer_email || '',
      customer_city,
      customer_address,
      customer_post_code,
      client_ip,
      status: 'Initiated',
      checkout_url: spResult.checkout_url,
      raw_response: spResult
    };

    // Save to MongoDB if available, else in-memory
    let paymentDoc = null;
    try {
      paymentDoc = await Payment.create(paymentRecordData);
    } catch (dbErr) {
      console.warn('[DB Warning] Could not save to MongoDB, saving in memory:', dbErr.message);
      inMemoryPayments.set(order_id, { ...paymentRecordData, _id: order_id, createdAt: new Date() });
      if (spResult.sp_order_id) {
        inMemoryPayments.set(spResult.sp_order_id, inMemoryPayments.get(order_id));
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      checkout_url: spResult.checkout_url,
      order_id,
      sp_order_id: spResult.sp_order_id,
      amount: Number(amount),
      currency
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while initiating payment'
    });
  }
};

/**
 * Handle shurjoPay Callback
 * GET /api/payment/callback?order_id=NOK...
 */
exports.handleCallback = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || (process.env.VERCEL ? '' : 'http://localhost:5173');
  const { order_id } = req.query;

  console.log(`[Callback] Received redirect from shurjoPay with order_id: ${order_id}`);

  if (!order_id) {
    return res.redirect(`${clientUrl}/payment-status?status=failed&message=Missing+order_id`);
  }

  try {
    // Call shurjoPay verification endpoint
    const verifyData = await shurjopayService.verifyPayment(order_id);
    const spCode = String(verifyData.sp_code || '');

    // sp_code '1000' is Success in shurjoPay
    const isSuccess = spCode === '1000';
    const status = isSuccess ? 'Completed' : 'Failed';

    const updateFields = {
      sp_order_id: verifyData.order_id || order_id,
      customer_order_id: verifyData.customer_order_id || '',
      received_amount: Number(verifyData.recived_amount || verifyData.amount || 0),
      payable_amount: Number(verifyData.payable_amount || verifyData.amount || 0),
      sp_code: spCode,
      sp_message: verifyData.sp_massage || verifyData.sp_message || '',
      bank_status: verifyData.bank_status || '',
      bank_trx_id: verifyData.bank_trx_id || '',
      payment_method: verifyData.method || '',
      status,
      verified_at: new Date(),
      raw_response: verifyData
    };

    // Update in MongoDB or in-memory
    let updated = null;
    try {
      updated = await Payment.findOneAndUpdate(
        { $or: [{ order_id: order_id }, { sp_order_id: order_id }, { customer_order_id: order_id }] },
        updateFields,
        { new: true }
      );
    } catch (dbErr) {
      console.warn('[DB Warning] MongoDB update failed, updating memory:', dbErr.message);
    }

    if (!updated && inMemoryPayments.has(order_id)) {
      const existing = inMemoryPayments.get(order_id);
      Object.assign(existing, updateFields);
      inMemoryPayments.set(order_id, existing);
    }

    // Redirect user to Frontend status page
    const queryParams = new URLSearchParams({
      order_id,
      status: status.toLowerCase(),
      sp_code: spCode,
      message: encodeURIComponent(verifyData.sp_massage || verifyData.sp_message || (isSuccess ? 'Payment Successful' : 'Payment Failed'))
    });

    return res.redirect(`${clientUrl}/payment-status?${queryParams.toString()}`);
  } catch (error) {
    console.error('[Callback Error]:', error);
    return res.redirect(`${clientUrl}/payment-status?order_id=${order_id}&status=failed&message=${encodeURIComponent(error.message)}`);
  }
};

/**
 * Verify Payment Status Endpoint (used by Frontend or API consumers)
 * GET /api/payment/verify/:order_id
 */
exports.verifyPaymentStatus = async (req, res) => {
  try {
    const { order_id } = req.params;

    if (!order_id) {
      return res.status(400).json({ success: false, message: 'order_id is required' });
    }

    // Search in MongoDB
    let payment = null;
    try {
      payment = await Payment.findOne({
        $or: [{ order_id: order_id }, { sp_order_id: order_id }, { customer_order_id: order_id }]
      });
    } catch (dbErr) {
      console.warn('[DB Warning] MongoDB query failed:', dbErr.message);
    }

    if (!payment && inMemoryPayments.has(order_id)) {
      payment = inMemoryPayments.get(order_id);
    }

    // If still in 'Initiated' status or not yet verified, verify live with shurjoPay
    if (!payment || payment.status === 'Initiated' || !payment.bank_trx_id) {
      try {
        const verifyData = await shurjopayService.verifyPayment(order_id);
        const spCode = String(verifyData.sp_code || '');
        const isSuccess = spCode === '1000';
        const status = isSuccess ? 'Completed' : (spCode === '1068' ? 'Initiated' : 'Failed');

        const updateFields = {
          sp_order_id: verifyData.order_id || order_id,
          customer_order_id: verifyData.customer_order_id || '',
          received_amount: Number(verifyData.recived_amount || verifyData.amount || 0),
          payable_amount: Number(verifyData.payable_amount || verifyData.amount || 0),
          sp_code: spCode,
          sp_message: verifyData.sp_massage || verifyData.sp_message || '',
          bank_status: verifyData.bank_status || '',
          bank_trx_id: verifyData.bank_trx_id || '',
          payment_method: verifyData.method || '',
          status,
          verified_at: new Date(),
          raw_response: verifyData
        };

        if (payment && payment._id) {
          try {
            payment = await Payment.findByIdAndUpdate(payment._id, updateFields, { new: true });
          } catch (e) {
            Object.assign(payment, updateFields);
          }
        } else {
          payment = {
            order_id,
            ...updateFields,
            amount: Number(verifyData.amount || 0),
            currency: verifyData.currency || 'BDT',
            customer_name: verifyData.name || 'Customer',
            customer_phone: verifyData.phone_no || '',
            customer_email: verifyData.email || '',
            customer_city: verifyData.city || '',
            customer_address: verifyData.address || ''
          };
        }
      } catch (verifyErr) {
        console.warn('Live verification check failed:', verifyErr.message);
      }
    }

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: `No payment found with order ID ${order_id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error in verifyPaymentStatus:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error verifying payment'
    });
  }
};

/**
 * List all payments
 * GET /api/payment/orders
 */
exports.getAllOrders = async (req, res) => {
  try {
    let payments = [];
    const isDbConnected = Payment.db && Payment.db.readyState === 1;
    if (isDbConnected) {
      try {
        payments = await Payment.find().sort({ createdAt: -1 }).limit(50);
      } catch (dbErr) {
        console.warn('[DB Fallback] Could not fetch from MongoDB, using memory store:', dbErr.message);
        payments = Array.from(inMemoryPayments.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      }
    } else {
      payments = Array.from(inMemoryPayments.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
