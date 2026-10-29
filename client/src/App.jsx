import React, { useState, useEffect } from 'react';
import ShurjopayLogo from './components/ShurjopayLogo';
import PaymentForm from './components/PaymentForm';
import PaymentStatus from './components/PaymentStatus';
import TransactionHistory from './components/TransactionHistory';
import { CreditCard, History } from 'lucide-react';

// Crisp inline GitHub SVG icon
function GithubIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('form');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Check if returning from shurjoPay callback or reloading on a subroute
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;
    if (params.get('order_id') || params.get('status') || pathname.includes('payment-status')) {
      setActiveTab('status');
    } else if (pathname.includes('transactions') || pathname.includes('history')) {
      setActiveTab('history');
    }
  }, []);

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    window.history.pushState({}, '', `?order_id=${orderId}`);
    setActiveTab('status');
  };

  const handleBackToForm = () => {
    setSelectedOrderId(null);
    window.history.pushState({}, '', '/');
    setActiveTab('form');
  };

  return (
    <>
      {/* Top Navbar with shurjoPay Logo & Tabs (No GitHub button in navbar) */}
      <header className="app-header">
        <div className="header-container">
          {/* Logo in Navbar */}
          <div className="brand-group">
            <div className="logo-anchor" onClick={handleBackToForm} style={{ cursor: 'pointer' }}>
              <ShurjopayLogo />
            </div>
          </div>

          {/* Green Transactions Action Button */}
          <div className="header-actions">
            <button
              className="btn-pay"
              style={{
                padding: '7px 16px',
                fontSize: '0.875rem',
                borderRadius: '5px',
                boxShadow: '0 2px 6px rgba(62, 167, 76, 0.3)'
              }}
              onClick={() => {
                if (activeTab === 'history') {
                  handleBackToForm();
                } else {
                  setActiveTab('history');
                }
              }}
            >
              {activeTab === 'history' ? (
                <>
                  <CreditCard size={16} />
                  <span>Checkout Page</span>
                </>
              ) : (
                <>
                  <History size={16} />
                  <span>Transactions</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-wrapper">
        {activeTab === 'form' && (
          <PaymentForm onSwitchToHistory={() => setActiveTab('history')} />
        )}

        {activeTab === 'status' && (
          <PaymentStatus onBackToForm={handleBackToForm} />
        )}

        {activeTab === 'history' && (
          <TransactionHistory onViewDetails={handleViewDetails} />
        )}
      </main>

      {/* Simple 2-Sided Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          {/* Left Side: Simple text */}
          <div className="footer-left">
            <span>© 2026 shurjoPay</span>
            <span className="footer-separator">•</span>
            <span>All rights reserved</span>
          </div>

          {/* Right Side: Deploy by Tanvir Hasan Tonmoy linking to Tonmoy-Org */}
          <div className="footer-right">
            <span>Deployed by</span>
            <a
              href="https://github.com/Tonmoy-Org"
              target="_blank"
              rel="noopener noreferrer"
              className="github-footer-link"
              title="Tonmoy-Org on GitHub"
            >
              <span>Tanvir Hasan Tonmoy</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
