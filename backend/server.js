require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/error.middleware')

const app = express()

// ── CORS ─────────────────────────────────────────────────────────────────────
// In development accept every localhost port (Vite picks dynamically).
// In production restrict to the comma-separated CLIENT_URL env variable.
const isDev = process.env.NODE_ENV !== 'production'
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

app.use(cors({
  origin (origin, callback) {
    if (!origin) return callback(null, true)                              // curl / Postman / mobile
    if (isDev && /^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
}))

// ── Stripe webhook — raw body MUST come before express.json() ────────────────
const webhookRoutes = require('./routes/webhook.routes')
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes)

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
if (isDev) app.use(morgan('dev'))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }))
app.get('/',           (_, res) => res.send('ShopEase API is running'))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth.routes'))
app.use('/api/products', require('./routes/product.routes'))
app.use('/api/cart',     require('./routes/cart.routes'))
app.use('/api/orders',   require('./routes/order.routes'))
app.use('/api/payments', require('./routes/payment.routes'))
app.use('/api/wishlist', require('./routes/wishlist.routes'))

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
const startServer = async () => {
  await connectDB()
  app.listen(PORT, () => console.log(`📡 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`))
}
startServer()
