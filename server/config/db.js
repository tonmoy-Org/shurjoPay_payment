const dns = require('dns');
const mongoose = require('mongoose');

// Set fallback DNS servers (Google & Cloudflare) to ensure MongoDB SRV resolution succeeds
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if unable to override DNS servers
}

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  if (isConnecting) return;
  isConnecting = true;

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shurjopay_db';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.log('[MongoDB] Running with in-memory fallback store.');
  } finally {
    isConnecting = false;
  }
};

module.exports = connectDB;

