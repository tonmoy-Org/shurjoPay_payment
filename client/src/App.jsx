import React, { useState, useEffect } from 'react';
import ShurjopayLogo from './components/ShurjopayLogo';
import PaymentForm from './components/PaymentForm';
import PaymentStatus from './components/PaymentStatus';
import TransactionHistory from './components/TransactionHistory';
import { CreditCard, History } from 'lucide-react';

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
              className="btn-pay header-toggle-btn"
              onClick={() => {
                if (activeTab === 'history') {
                  handleBackToForm();
                } else {
                  setActiveTab('history');
                }
              }}
              aria-label={activeTab === 'history' ? "Go to Checkout Form" : "View Transaction History"}
            >
              {activeTab === 'history' ? (
                <>
                  <CreditCard size={16} />
                  <span className="btn-label-desktop">Checkout Page</span>
                  <span className="btn-label-mobile">Checkout</span>
                </>
              ) : (
                <>
                  <History size={16} />
                  <span className="btn-label-desktop">Transactions</span>
                  <span className="btn-label-mobile">History</span>
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
