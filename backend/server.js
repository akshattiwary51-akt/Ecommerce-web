console.log("🚀 Server.js is executing...");
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')

const authRoutes = require('./routes/auth.routes')
const productRoutes = require('./routes/product.routes')
const cartRoutes = require('./routes/cart.routes')
const orderRoutes = require('./routes/order.routes')
const paymentRoutes = require('./routes/payment.routes')
const wishlistRoutes = require('./routes/wishlist.routes')
const errorHandler = require('./middleware/error.middleware')

const app = express()
app.get('/', (req, res) => {
  res.send("Shopease API is running successfully!");
});

// server.js


const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174', // Add the new port here
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true
}));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

/*const limiter = rateLimit({ 
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // Increase this to 5000 for development
    message: "Too many requests, please try again later."
});

// Apply to all API routes
app.use('/api', limiter);*/

const webhookRoutes = require('./routes/webhook.routes')

// ⚠️ RAW body needed for signature verification — MUST come before express.json()
app.use('/api/webhooks', webhookRoutes)

// Normal JSON parser for the rest of the app
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ...your other routes
app.use('/api/payment', require('./routes/payment.routes'))
app.use('/api/orders',  require('./routes/order.routes'))

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use(cors());
app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

app.use(errorHandler)

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();  // Ensure DB is connected first
  app.listen(PORT, () => {
    console.log(`📡 Server is running on port ${PORT}`);
  });
};
startServer();
