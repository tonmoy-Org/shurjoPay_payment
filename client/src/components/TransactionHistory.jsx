import React, { useEffect, useState } from 'react';
import { RefreshCw, Search, ExternalLink, Calendar, User, DollarSign } from 'lucide-react';

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
    const q = filter.toLowerCase();
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
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a3459' }}>
            MongoDB Transaction Logs
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Live record of all shurjoPay payment attempts and verified receipts
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="nav-btn"
          disabled={loading}
          style={{ cursor: 'pointer' }}
        >
          <RefreshCw size={14} className={loading ? 'spinner' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div style={{ padding: '14px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px', height: '36px' }}
            placeholder="Search by Order ID, Phone, Customer Name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="alert-error" style={{ margin: '16px' }}>
          <span>{error}</span>
        </div>
      )}

      <div className="table-responsive">
        <table className="tx-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && transactions.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="spinner" style={{ margin: '0 auto 12px', borderColor: '#3ea74c', borderTopColor: 'transparent', width: '24px', height: '24px' }} />
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading transactions from MongoDB...</span>
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No transactions found. Initiate a test payment from the form!
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const statusLower = (tx.status || 'initiated').toLowerCase();
                return (
                  <tr key={tx._id || tx.order_id}>
                    <td>
                      <div style={{ fontWeight: 600, fontFamily: 'monospace', color: '#1e293b' }}>
                        {tx.order_id}
                      </div>
                      {tx.sp_order_id && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                          sp: {tx.sp_order_id}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{tx.customer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{tx.customer_phone}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#1a3459' }}>
                      {tx.amount} {tx.currency || 'BDT'}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', color: '#475569' }}>
                        {tx.payment_method || (tx.status === 'Completed' ? 'ONLINE' : '---')}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${statusLower}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <button
                        onClick={() => onViewDetails(tx.order_id)}
                        className="nav-btn"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        title="View Full Voucher"
                      >
                        <ExternalLink size={12} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
