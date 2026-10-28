# shurjoPay MERN Integration

A simple integration of shurjoPay v2 payment gateway using Express.js on the backend and React (Vite) on the frontend.

## Project Structure

```
shurjoPay_payment/
├── server/
│   ├── config/db.js
│   ├── controllers/paymentController.js
│   ├── models/Payment.js
│   ├── routes/paymentRoutes.js
│   ├── services/shurjopayService.js
│   ├── server.js
│   └── .env
└── client/
    ├── src/
    │   ├── components/
    │   ├── App.jsx
    │   └── main.jsx
    └── .env
```

## Getting Started

### 1. Backend Setup

Go to the `server` directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

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

*Note: For production, replace `SP_ENDPOINT` with `https://engine.shurjopayment.com/api` and use your live merchant credentials.*

Start the backend:

```bash
npm run dev
```

The backend server runs on `http://localhost:5000`.

### 2. Frontend Setup

In a separate terminal, go to the `client` directory and install dependencies:

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/payment
```

Start the frontend development server:

```bash
npm run dev
```

The frontend app runs on `http://localhost:5173`.

## How the Payment Flow Works

1. **Initiate Payment**: Frontend submits order and customer information to `/api/payment/initiate`.
2. **Token & Checkout**: Backend authenticates with shurjoPay via `/api/get_token`, calls `/api/secret-pay` with order details, stores the initiated order in MongoDB, and returns the shurjoPay checkout URL.
3. **Gateway Checkout**: The user is redirected to shurjoPay's gateway to complete payment via bKash, Nagad, card, or internet banking.
4. **Callback & Verification**: Once completed, shurjoPay redirects to the server callback endpoint (`/api/payment/callback`), where the backend verifies the transaction using `/api/verification`.
5. **Confirmation**: On successful verification, the database status is updated to `Completed`, and the user is redirected to the frontend status page showing transaction details.
