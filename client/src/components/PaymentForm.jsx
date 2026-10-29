import React, { useState } from 'react';
import ShurjopayLogo from './ShurjopayLogo';
import { CreditCard, RotateCcw, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

import { API_BASE_URL } from '../utils/api';

const DEFAULT_FORM_VALUES = {
  amount: '100',
  customer_name: 'Tanvir Hossain',
  customer_phone: '01712345678',
  customer_city: 'Dhaka',
  customer_address: 'House 42, Road 11, Banani, Dhaka-1213',
  customer_email: 'tanvir.test@gmail.com',
  currency: 'BDT'
};

export default function PaymentForm({ onSwitchToHistory }) {
  const [formData, setFormData] = useState({
    amount: '',
    customer_name: '',
    customer_phone: '',
    customer_city: '',
    customer_address: '',
    customer_email: '',
    currency: 'BDT'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleFillDefault = () => {
    setFormData(DEFAULT_FORM_VALUES);
    setError('');
    setSuccessInfo('Default sandbox test values filled.');
    setTimeout(() => setSuccessInfo(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please provide a valid payment amount.');
      return;
    }
    if (!formData.customer_name.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (!formData.customer_phone.trim()) {
      setError('Customer phone number is required.');
      return;
    }
    if (!formData.customer_city.trim()) {
      setError('Customer city is required.');
      return;
    }
    if (!formData.customer_address.trim()) {
      setError('Customer address is required.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Number(formData.amount),
          customer_name: formData.customer_name.trim(),
          customer_phone: formData.customer_phone.trim(),
          customer_city: formData.customer_city.trim(),
          customer_address: formData.customer_address.trim(),
          customer_email: formData.customer_email.trim(),
          currency: formData.currency
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Payment initiation failed.');
      }

      if (data.checkout_url) {
        console.log('Redirecting to shurjoPay checkout:', data.checkout_url);
        // Redirect browser to shurjoPay secure sandbox gateway
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL received from payment gateway.');
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError(err.message || 'Could not connect to payment gateway server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-card">
      {/* Form Top: No logo in form (Logo is in Navbar) */}
      <div className="card-header-bar">
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a3459', lineHeight: 1.2 }}>
            Payment Checkout
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
            Complete your transaction securely
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="badge-sandbox">
            <span className="dot" />
            <span>SANDBOX TEST</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body">
        {error && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successInfo && (
          <div className="alert-success">
            <span>{successInfo}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          {/* Amount */}
          <div className="form-row">
            <label className="form-label" htmlFor="amount">
              Amount <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="amount"
                type="number"
                step="any"
                min="1"
                name="amount"
                className="form-input"
                placeholder="100.00"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Customer Name */}
          <div className="form-row">
            <label className="form-label" htmlFor="customer_name">
              Customer Name <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="customer_name"
                type="text"
                name="customer_name"
                className="form-input"
                placeholder="e.g. Tanvir Hossain"
                value={formData.customer_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Customer Phone No */}
          <div className="form-row">
            <label className="form-label" htmlFor="customer_phone">
              Customer Phone No <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="customer_phone"
                type="tel"
                name="customer_phone"
                className="form-input"
                placeholder="017XXXXXXXX"
                value={formData.customer_phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Customer City */}
          <div className="form-row">
            <label className="form-label" htmlFor="customer_city">
              Customer City <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="customer_city"
                type="text"
                name="customer_city"
                className="form-input"
                placeholder="e.g. Dhaka"
                value={formData.customer_city}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Customer Address */}
          <div className="form-row">
            <label className="form-label" htmlFor="customer_address">
              Customer Address <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <textarea
                id="customer_address"
                name="customer_address"
                className="form-textarea"
                placeholder="e.g. House #10, Road #5, Mirpur, Dhaka"
                value={formData.customer_address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Customer Email */}
          <div className="form-row">
            <label className="form-label" htmlFor="customer_email">
              Customer Email
            </label>
            <div className="input-wrapper">
              <input
                id="customer_email"
                type="email"
                name="customer_email"
                className="form-input"
                placeholder="customer@example.com"
                value={formData.customer_email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Currency */}
          <div className="form-row">
            <label className="form-label" htmlFor="currency">
              currency <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="currency"
                type="text"
                name="currency"
                className="form-input readonly"
                value={formData.currency}
                readOnly
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="button-row">
            <button
              id="pay-now-btn"
              type="submit"
              className="btn-pay"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  <span>PayNow</span>
                </>
              )}
            </button>

            <button
              id="default-btn"
              type="button"
              className="btn-default"
              onClick={handleFillDefault}
              disabled={loading}
              title="Autofill realistic test data"
            >
              <RotateCcw size={16} />
              <span>Default</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security Footer */}
      <div className="security-footer">
        <span>
          <ShieldCheck size={16} color="#3ea74c" />
          PCI-DSS Compliant 256-Bit SSL
        </span>
        <span>•</span>
        <span>bKash / Nagad / Rocket / Cards Supported</span>
      </div>
    </div>
  );
}
