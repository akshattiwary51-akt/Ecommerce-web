const express = require('express')
const router = express.Router()
const { stripeWebhook, razorpayWebhook } = require('../controllers/webhook.controller')

// Stripe needs the raw body
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
)

// Razorpay also needs the raw body to verify signature
router.post(
  '/razorpay',
  express.raw({ type: 'application/json' }),
  razorpayWebhook
)

module.exports = router