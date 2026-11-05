import React, { useState } from 'react';
import { CreditCard, RotateCcw, ShieldCheck, AlertCircle, Sparkles, User, Phone, MapPin, Mail } from 'lucide-react';
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

const PRESET_AMOUNTS = ['50', '100', '500', '1000'];

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

  const handleSelectPresetAmount = (preset) => {
    setFormData((prev) => ({ ...prev, amount: preset }));
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
      {/* Form Top Header */}
      <div className="card-header-bar">
        <div>
          <h2 className="card-title">
            Payment Checkout
          </h2>
          <p className="card-subtitle">
            Complete your transaction securely via shurjoPay
          </p>
        </div>
        <div className="badge-sandbox-wrap">
          <div className="badge-sandbox">
            <span className="dot" />
            <span>SANDBOX TEST</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body">
        {error && (
          <div className="alert-error" role="alert">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {successInfo && (
          <div className="alert-success" role="status">
            <Sparkles size={18} className="alert-icon" />
            <span>{successInfo}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          {/* Amount Field with Quick Preset Chips */}
          <div className="form-row">
            <label className="form-label" htmlFor="amount">
              Amount <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <div className="input-with-affix">
                <span className="input-prefix">৳</span>
                <input
                  id="amount"
                  type="number"
                  step="any"
                  min="1"
                  name="amount"
                  inputMode="decimal"
                  className="form-input with-prefix"
                  placeholder="100.00"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
                <span className="input-suffix">BDT</span>
              </div>

              {/* Quick Select Preset Buttons for easy mobile thumb taps */}
              <div className="amount-chips-row">
                <span className="chips-label">Quick select:</span>
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`amount-chip ${formData.amount === amt ? 'active' : ''}`}
                    onClick={() => handleSelectPresetAmount(amt)}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Name */}
          <div className="form-row">
            <label className="form-label" htmlFor="customer_name">
              Customer Name <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <div className="input-with-icon">
                <User size={16} className="field-icon" />
                <input
                  id="customer_name"
                  type="text"
                  name="customer_name"
                  autoComplete="name"
                  className="form-input with-icon"
                  placeholder="e.g. Tanvir Hossain"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Customer Phone No */}
          <div className="form-row">
            <label className="form-label" htmlFor="customer_phone">
              Phone Number <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <div className="input-with-icon">
                <Phone size={16} className="field-icon" />
                <input
                  id="customer_phone"
                  type="tel"
                  name="customer_phone"
                  inputMode="tel"
                  autoComplete="tel"
                  className="form-input with-icon"
                  placeholder="017XXXXXXXX"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Customer City */}
          <div className="form-row">
            <label className="form-label" htmlFor="customer_city">
              Customer City <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <div className="input-with-icon">
                <MapPin size={16} className="field-icon" />
                <input
                  id="customer_city"
                  type="text"
                  name="customer_city"
                  autoComplete="address-level2"
                  className="form-input with-icon"
                  placeholder="e.g. Dhaka"
                  value={formData.customer_city}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Customer Address */}
          <div className="form-row address-row">
            <label className="form-label" htmlFor="customer_address">
              Customer Address <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <textarea
                id="customer_address"
                name="customer_address"
                autoComplete="street-address"
                className="form-textarea"
                placeholder="e.g. House #42, Road #11, Banani, Dhaka"
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
              <div className="input-with-icon">
                <Mail size={16} className="field-icon" />
                <input
                  id="customer_email"
                  type="email"
                  name="customer_email"
                  inputMode="email"
                  autoComplete="email"
                  className="form-input with-icon"
                  placeholder="customer@example.com"
                  value={formData.customer_email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Currency */}
          <div className="form-row">
            <label className="form-label" htmlFor="currency">
              Currency <span className="required-star">*</span>
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
              className="btn-pay main-action"
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
                  <span>Pay Now</span>
                </>
              )}
            </button>

            <button
              id="default-btn"
              type="button"
              className="btn-default secondary-action"
              onClick={handleFillDefault}
              disabled={loading}
              title="Autofill realistic test data"
            >
              <RotateCcw size={16} />
              <span>Fill Test Data</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security Footer with Clean Responsive Pills */}
      <div className="security-footer">
        <div className="security-item">
          <ShieldCheck size={16} className="security-icon" />
          <span>PCI-DSS 256-Bit SSL</span>
        </div>
        <span className="security-sep">•</span>
        <div className="security-item">
          <span>bKash • Nagad • Rocket • Cards</span>
        </div>
      </div>
    </div>
  );
}
