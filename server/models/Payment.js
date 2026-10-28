const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    sp_order_id: {
      type: String,
      default: ''
    },
    customer_order_id: {
      type: String,
      default: ''
    },
    amount: {
      type: Number,
      required: true
    },
    payable_amount: {
      type: Number,
      default: 0
    },
    received_amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'BDT'
    },
    customer_name: {
      type: String,
      required: true
    },
    customer_phone: {
      type: String,
      required: true
    },
    customer_email: {
      type: String,
      default: ''
    },
    customer_city: {
      type: String,
      required: true
    },
    customer_address: {
      type: String,
      required: true
    },
    customer_post_code: {
      type: String,
      default: '1200'
    },
    client_ip: {
      type: String,
      default: '127.0.0.1'
    },
    status: {
      type: String,
      enum: ['Initiated', 'Completed', 'Failed', 'Cancelled', 'Declined'],
      default: 'Initiated'
    },
    sp_code: {
      type: String,
      default: ''
    },
    sp_message: {
      type: String,
      default: ''
    },
    bank_status: {
      type: String,
      default: ''
    },
    bank_trx_id: {
      type: String,
      default: ''
    },
    payment_method: {
      type: String,
      default: ''
    },
    checkout_url: {
      type: String,
      default: ''
    },
    verified_at: {
      type: Date
    },
    raw_response: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
