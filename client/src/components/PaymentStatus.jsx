import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, ArrowLeft, Printer, AlertTriangle, Copy, Check } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

export default function PaymentStatus({ onBackToForm }) {
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  // Extract query params from current URL
  const queryParams = new URLSearchParams(window.location.search);
  const orderId = queryParams.get('order_id');
  const urlStatus = queryParams.get('status');
  const urlMessage = queryParams.get('message');
  const spCode = queryParams.get('sp_code');

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchVerification = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/verify/${orderId}`);
        const result = await res.json();

        if (res.ok && result.success && result.data) {
          setPaymentDetails(result.data);
        } else {
          setError(result.message || 'Unable to retrieve verified payment details.');
        }
      } catch (err) {
        console.error('Error fetching verified status:', err);
        setError('Failed to contact verification server.');
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [orderId]);

  const isSuccess =
    (paymentDetails && (paymentDetails.status === 'Completed' || paymentDetails.sp_code === '1000')) ||
    urlStatus === 'completed' ||
    spCode === '1000';

  const isCancelled = urlStatus === 'cancelled';

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    window.history.replaceState({}, document.title, window.location.pathname);
    if (onBackToForm) {
      onBackToForm();
    }
  };

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="status-card">
      <div className="card-header-bar">
        <div className="voucher-header-info">
          <div className="card-header-icon">
            <CheckCircle2 size={18} color="#22a048" />
          </div>
          <span className="voucher-title">
            Payment Transaction Voucher
          </span>
        </div>
        <span className="badge-merchant">
          Official Receipt
        </span>
      </div>

      {loading ? (
        <div className="status-loading-state">
          <div className="spinner large-spinner" />
          <h3 className="loading-heading">Verifying Transaction with shurjoPay...</h3>
          <p className="loading-subheading">Please wait while we confirm your payment record.</p>
        </div>
      ) : (
        <>
          <div className={`status-header ${isSuccess ? 'success' : isCancelled ? 'cancelled' : 'failed'}`}>
            <div className={`status-icon-wrap ${isSuccess ? 'success' : isCancelled ? 'cancelled' : 'failed'}`}>
              {isSuccess ? <CheckCircle2 size={36} /> : isCancelled ? <AlertTriangle size={36} /> : <XCircle size={36} />}
            </div>
            <h2 className="status-title">
              {isSuccess ? 'Payment Successful!' : isCancelled ? 'Payment Cancelled' : 'Payment Failed'}
            </h2>
            <p className="status-subtitle">
              {paymentDetails?.sp_message ||
                urlMessage ||
                (isSuccess
                  ? 'Your transaction has been securely processed and verified.'
                  : 'The payment transaction could not be completed.')}
            </p>
          </div>

          <div className="receipt-body">
            {error && (
              <div className="alert-error" role="alert" style={{ marginBottom: '16px' }}>
                <span>{error}</span>
              </div>
            )}

            <div className="receipt-list">
              {/* Order ID */}
              <div className="receipt-row">
                <span className="receipt-label">Order ID (Merchant)</span>
                <div className="receipt-val-wrap">
                  <span className="receipt-val mono">
                    {paymentDetails?.order_id || orderId || 'N/A'}
                  </span>
                  {(paymentDetails?.order_id || orderId) && (
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={() => copyToClipboard(paymentDetails?.order_id || orderId, 'order_id')}
                      title="Copy Order ID"
                      aria-label="Copy Order ID"
                    >
                      {copiedKey === 'order_id' ? <Check size={13} color="#22a048" /> : <Copy size={13} />}
                    </button>
                  )}
                </div>
              </div>

              {/* shurjoPay Order ID */}
              {paymentDetails?.sp_order_id && (
                <div className="receipt-row">
                  <span className="receipt-label">shurjoPay Order ID</span>
                  <div className="receipt-val-wrap">
                    <span className="receipt-val mono">{paymentDetails.sp_order_id}</span>
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={() => copyToClipboard(paymentDetails.sp_order_id, 'sp_order_id')}
                      title="Copy shurjoPay Order ID"
                      aria-label="Copy shurjoPay Order ID"
                    >
                      {copiedKey === 'sp_order_id' ? <Check size={13} color="#22a048" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Bank Transaction ID */}
              {paymentDetails?.bank_trx_id && (
                <div className="receipt-row">
                  <span className="receipt-label">Bank Transaction ID</span>
                  <div className="receipt-val-wrap">
                    <span className="receipt-val mono">{paymentDetails.bank_trx_id}</span>
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={() => copyToClipboard(paymentDetails.bank_trx_id, 'bank_trx_id')}
                      title="Copy Bank Transaction ID"
                      aria-label="Copy Bank Transaction ID"
                    >
                      {copiedKey === 'bank_trx_id' ? <Check size={13} color="#22a048" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Amount */}
              <div className="receipt-row highlight-row">
                <span className="receipt-label">Total Amount</span>
                <span className="receipt-val amount-val">
                  {paymentDetails?.amount ? `৳${paymentDetails.amount}` : '---'}{' '}
                  <span className="currency-badge">{paymentDetails?.currency || 'BDT'}</span>
                </span>
              </div>

              {/* Payment Method */}
              {paymentDetails?.payment_method && (
                <div className="receipt-row">
                  <span className="receipt-label">Payment Method</span>
                  <span className="receipt-val method-val">
                    {paymentDetails.payment_method.toUpperCase()}
                  </span>
                </div>
              )}

              {/* Customer Name */}
              {paymentDetails?.customer_name && (
                <div className="receipt-row">
                  <span className="receipt-label">Customer Name</span>
                  <span className="receipt-val">{paymentDetails.customer_name}</span>
                </div>
              )}

              {/* Phone */}
              {paymentDetails?.customer_phone && (
                <div className="receipt-row">
                  <span className="receipt-label">Phone</span>
                  <span className="receipt-val mono">{paymentDetails.customer_phone}</span>
                </div>
              )}

              {/* Status Code */}
              <div className="receipt-row">
                <span className="receipt-label">Status Code (sp_code)</span>
                <span className="receipt-val mono badge-code">
                  {paymentDetails?.sp_code || spCode || 'N/A'}
                </span>
              </div>

              {/* Timestamp */}
              <div className="receipt-row">
                <span className="receipt-label">Verification Time</span>
                <span className="receipt-val date-val">
                  {paymentDetails?.verified_at
                    ? new Date(paymentDetails.verified_at).toLocaleString()
                    : new Date().toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="receipt-actions-row">
              <button
                type="button"
                className="btn-default voucher-btn"
                onClick={handleReset}
              >
                <ArrowLeft size={16} />
                <span>Make Another Payment</span>
              </button>

              <button
                type="button"
                className="btn-pay voucher-btn"
                onClick={handlePrint}
              >
                <Printer size={16} />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
