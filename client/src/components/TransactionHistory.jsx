import React, { useEffect, useState } from 'react';
import { RefreshCw, Search, ExternalLink, X, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

export default function TransactionHistory({ onViewDetails }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE_URL}/orders`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTransactions(data.data || []);
      } else {
        setError(data.message || 'Failed to load transaction history.');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    const q = filter.toLowerCase().trim();
    if (!q) return true;
    return (
      (tx.order_id && tx.order_id.toLowerCase().includes(q)) ||
      (tx.sp_order_id && tx.sp_order_id.toLowerCase().includes(q)) ||
      (tx.customer_name && tx.customer_name.toLowerCase().includes(q)) ||
      (tx.customer_phone && tx.customer_phone.toLowerCase().includes(q)) ||
      (tx.status && tx.status.toLowerCase().includes(q))
    );
  });

  return (
    <div className="tx-table-card">
      <div className="tx-header">
        <div className="tx-header-text">
          <h2 className="tx-title">
            MongoDB Transaction Logs
          </h2>
          <p className="tx-subtitle">
            Live record of all shurjoPay payment attempts and verified receipts
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="refresh-btn"
          disabled={loading}
          title="Refresh transactions"
          aria-label="Refresh transactions"
        >
          <RefreshCw size={14} className={loading ? 'spinner' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar Container */}
      <div className="tx-search-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by Order ID, Phone, Customer Name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {filter && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setFilter('')}
              title="Clear search"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="tx-count-pill">
          {filteredTransactions.length} {filteredTransactions.length === 1 ? 'record' : 'records'}
        </div>
      </div>

      {error && (
        <div className="alert-error" role="alert" style={{ margin: '16px' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Desktop / Tablet Table View */}
      <div className="table-responsive desktop-only-view">
        <table className="tx-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && transactions.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty-cell">
                  <div className="spinner green-spinner" style={{ margin: '0 auto 12px', width: '24px', height: '24px' }} />
                  <span>Loading transactions from MongoDB...</span>
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty-cell">
                  {filter ? 'No transactions match your search filter.' : 'No transactions found. Initiate a test payment from the form!'}
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const statusLower = (tx.status || 'initiated').toLowerCase();
                return (
                  <tr key={tx._id || tx.order_id}>
                    <td>
                      <div className="table-order-id">
                        {tx.order_id}
                      </div>
                      {tx.sp_order_id && (
                        <div className="table-sp-id">
                          sp: {tx.sp_order_id}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="table-customer-name">{tx.customer_name}</div>
                      <div className="table-customer-phone">{tx.customer_phone}</div>
                    </td>
                    <td>
                      <span className="table-amount">
                        ৳{tx.amount} <small>{tx.currency || 'BDT'}</small>
                      </span>
                    </td>
                    <td>
                      <span className="table-method-badge">
                        {tx.payment_method || (tx.status === 'Completed' ? 'ONLINE' : '---')}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${statusLower}`}>
                        <span className="status-dot" />
                        {tx.status}
                      </span>
                    </td>
                    <td>
                      <span className="table-date">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => onViewDetails(tx.order_id)}
                        className="btn-view-voucher"
                        title="View Full Voucher"
                      >
                        <span>View</span>
                        <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile-Optimized Card List View (Visible on screens < 768px) */}
      <div className="mobile-cards-view">
        {loading && transactions.length === 0 ? (
          <div className="table-empty-cell" style={{ padding: '36px 16px' }}>
            <div className="spinner green-spinner" style={{ margin: '0 auto 12px', width: '24px', height: '24px' }} />
            <span>Loading transactions...</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="table-empty-cell" style={{ padding: '36px 16px' }}>
            {filter ? 'No transactions match your search.' : 'No transactions recorded yet.'}
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const statusLower = (tx.status || 'initiated').toLowerCase();
            return (
              <div
                key={`mobile-${tx._id || tx.order_id}`}
                className="mobile-tx-card"
                onClick={() => onViewDetails(tx.order_id)}
              >
                <div className="mobile-card-top">
                  <div className="mobile-order-badge">
                    <span className="mobile-order-text">{tx.order_id}</span>
                  </div>
                  <span className={`status-pill ${statusLower}`}>
                    <span className="status-dot" />
                    {tx.status}
                  </span>
                </div>

                <div className="mobile-card-mid">
                  <div className="mobile-cust-info">
                    <div className="mobile-cust-name">{tx.customer_name}</div>
                    <div className="mobile-cust-phone">{tx.customer_phone}</div>
                  </div>
                  <div className="mobile-amount-info">
                    <span className="mobile-amount-val">৳{tx.amount}</span>
                    <span className="mobile-currency-tag">{tx.currency || 'BDT'}</span>
                  </div>
                </div>

                <div className="mobile-card-bottom">
                  <div className="mobile-meta">
                    <span className="mobile-method">
                      {tx.payment_method ? tx.payment_method.toUpperCase() : (tx.status === 'Completed' ? 'ONLINE' : 'PENDING')}
                    </span>
                    <span className="mobile-meta-dot">•</span>
                    <span className="mobile-date">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="mobile-card-action">
                    <span>Voucher</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
