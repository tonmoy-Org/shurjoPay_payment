import React, { useEffect, useState } from 'react';
import ShurjopayLogo from './ShurjopayLogo';
import { CheckCircle2, XCircle, ArrowLeft, Printer, RefreshCw, AlertTriangle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/payment';

export default function PaymentStatus({ onBackToForm }) {
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState('');

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
    // Clear URL query parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    if (onBackToForm) {
      onBackToForm();
    }
  };

  return (
    <div className="status-card">
      <div className="card-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="card-header-icon">
            <CheckCircle2 size={20} color="#3ea74c" />
          </div>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a3459' }}>
            Payment Transaction Voucher
          </span>
        </div>
        <span className="badge-merchant">
          Official Receipt
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', borderColor: '#3ea74c', borderTopColor: 'transparent', width: '32px', height: '32px' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#1a3459' }}>Verifying Transaction Status with shurjoPay...</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>Please wait while we confirm your payment record.</p>
        </div>
      ) : (
        <>
          <div className={`status-header ${isSuccess ? 'success' : 'failed'}`}>
            <div className={`status-icon-wrap ${isSuccess ? 'success' : 'failed'}`}>
              {isSuccess ? <CheckCircle2 size={38} /> : isCancelled ? <AlertTriangle size={38} /> : <XCircle size={38} />}
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
              <div className="alert-error" style={{ marginBottom: '16px' }}>
                <span>{error}</span>
              </div>
            )}

            <table className="receipt-table">
              <tbody>
                <tr>
                  <td className="label">Order ID (Merchant)</td>
                  <td className="val">{paymentDetails?.order_id || orderId || 'N/A'}</td>
                </tr>
                {paymentDetails?.sp_order_id && (
                  <tr>
                    <td className="label">shurjoPay Order ID</td>
                    <td className="val">{paymentDetails.sp_order_id}</td>
                  </tr>
                )}
                {paymentDetails?.bank_trx_id && (
                  <tr>
                    <td className="label">Bank Transaction ID</td>
                    <td className="val">{paymentDetails.bank_trx_id}</td>
                  </tr>
                )}
                <tr>
                  <td className="label">Amount</td>
                  <td className="val" style={{ color: isSuccess ? '#15803d' : '#1e293b', fontSize: '1.05rem' }}>
                    {paymentDetails?.amount || '---'} {paymentDetails?.currency || 'BDT'}
                  </td>
                </tr>
                {paymentDetails?.payment_method && (
                  <tr>
                    <td className="label">Payment Method</td>
                    <td className="val">{paymentDetails.payment_method.toUpperCase()}</td>
                  </tr>
                )}
                {paymentDetails?.customer_name && (
                  <tr>
                    <td className="label">Customer Name</td>
                    <td className="val">{paymentDetails.customer_name}</td>
                  </tr>
                )}
                {paymentDetails?.customer_phone && (
                  <tr>
                    <td className="label">Phone</td>
                    <td className="val">{paymentDetails.customer_phone}</td>
                  </tr>
                )}
                <tr>
                  <td className="label">Status Code (sp_code)</td>
                  <td className="val">{paymentDetails?.sp_code || spCode || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="label">Verification Timestamp</td>
                  <td className="val" style={{ fontSize: '0.8rem' }}>
                    {paymentDetails?.verified_at ? new Date(paymentDetails.verified_at).toLocaleString() : new Date().toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="button-row" style={{ marginTop: '28px' }}>
              <button
                type="button"
                className="btn-default"
                onClick={handleReset}
              >
                <ArrowLeft size={16} />
                <span>Make Another Payment</span>
              </button>

              <button
                type="button"
                className="btn-pay"
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
