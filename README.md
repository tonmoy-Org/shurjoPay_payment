# shurjoPay Payment Gateway Integration (MERN Stack)

Full-stack MERN integration for **shurjoPay RESTful API v2** with separate Express backend and React frontend.

---

## 📁 Project Structure

```
shurjoPay_payment/
├── server/                    # Node.js + Express Backend
│   ├── config/
│   │   └── db.js              # MongoDB connection with graceful in-memory fallback
│   ├── controllers/
│   │   └── paymentController.js # Initiate payment, callback handler, verification, history
│   ├── models/
│   │   └── Payment.js         # Mongoose schema for transaction tracking
│   ├── routes/
│   │   └── paymentRoutes.js   # API endpoints
│   ├── services/
│   │   └── shurjopayService.js# Token generation, secret-pay, and order verification
│   ├── .env                   # Server environment & shurjoPay credentials
│   ├── package.json
│   └── server.js              # Server entry point (port 5000)
│
└── client/                    # React (Vite) Frontend
    ├── src/
    │   ├── components/
    │   │   ├── PaymentForm.jsx        # Checkout form matching official design
    │   │   ├── PaymentStatus.jsx      # Payment verification voucher & receipt
    │   │   ├── ShurjopayLogo.jsx      # Vector SVG shurjoPay logo
    │   │   └── TransactionHistory.jsx # Live MongoDB payment logs
    │   ├── App.jsx
    │   ├── index.css                  # Custom styling & tokens
    │   └── main.jsx
    ├── .env                   # Client environment variables
    ├── index.html
    └── package.json
```

---

## ⚙️ Configuration & Environment Variables

### Server (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shurjopay_db
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# shurjoPay Sandbox Credentials
SP_ENDPOINT=https://sandbox.shurjopayment.com/api
SP_USERNAME=sp_sandbox
SP_PASSWORD=pyyk97hu&6u6
SP_PREFIX=NOK
SP_RETURN_URL=http://localhost:5000/api/payment/callback
SP_CANCEL_URL=http://localhost:5173/payment-status?status=cancelled
```

> **For Live/Production:**
> Change `SP_ENDPOINT` to `https://engine.shurjopayment.com/api` and update `SP_USERNAME`, `SP_PASSWORD`, and `SP_PREFIX` to your merchant credentials.

### Client (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api/payment
```

---

## 🚀 How to Run

### 1. Start Backend Server
```bash
cd server
npm install
npm run dev
```
Backend runs on: **`http://localhost:5000`**

### 2. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
Frontend runs on: **`http://localhost:5173`**

---

## 🔄 Integration Flow Explained

1. **User Checkout (`PaymentForm`)**:
   - Customer fills the form or clicks **Default** to autofill sandbox values.
   - Submitting sends a `POST` request to `http://localhost:5000/api/payment/initiate`.
2. **Token Generation & Payment Initiation (`shurjopayService`)**:
   - Backend calls shurjoPay `POST /api/get_token` using store credentials (`sp_sandbox` / `pyyk97hu&6u6`).
   - Backend calls `POST /api/secret-pay` with customer details, order ID, and amount.
   - Order is saved into MongoDB with status `Initiated`.
   - shurjoPay responds with `checkout_url`.
3. **Redirection to shurjoPay**:
   - Frontend redirects user's browser to the secure shurjoPay gateway (`checkout_url`).
   - Customer chooses payment method (bKash, Nagad, Rocket, Visa, Mastercard, Internet Banking) in the sandbox.
4. **Callback & Verification (`PaymentStatus`)**:
   - Upon completion, shurjoPay redirects to `http://localhost:5000/api/payment/callback?order_id=...`.
   - Backend triggers `POST /api/verification` with shurjoPay.
   - If `sp_code === 1000`, the transaction is marked `Completed` in MongoDB.
   - Backend redirects user to `http://localhost:5173/payment-status?order_id=...&status=completed`.
   - Frontend renders the verified voucher receipt with options to print or make another payment.
5. **MongoDB Transaction Logs**:
   - Click **"MongoDB Logs"** in the top navbar to see all stored orders, customer details, bank transaction IDs, and statuses in real-time.
