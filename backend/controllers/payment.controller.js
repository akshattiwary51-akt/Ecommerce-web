const Order  = require('../models/Order')
const crypto = require('crypto')

// ─── Bug 1 fix: never initialise SDKs at module load time ───────────────────
// Calling stripe(undefined) at require-time crashes the entire server.
// Instead, initialise lazily inside each function so a missing key only
// throws for that specific request, not for the whole process.
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key.startsWith('sk_test_your')) {
    throw new Error('STRIPE_SECRET_KEY is not configured in .env')
  }
  return require('stripe')(key)
}

const getRazorpay = () => {
  const keyId     = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || keyId.startsWith('rzp_test_your')) {
    throw new Error('RAZORPAY_KEY_ID is not configured in .env')
  }
  const Razorpay = require('razorpay')
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

// ════════════════════════════════════════
// STRIPE
// ════════════════════════════════════════

// POST /api/payments/stripe/create-intent
exports.createStripeIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body
    if (!orderId) return res.status(400).json({ message: 'orderId is required' })

    const order = await Order.findOne({ _id: orderId, user: req.user._id })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order is already paid' })
    }

    const stripe = getStripe()
    const intent = await stripe.paymentIntents.create({
      amount:   Math.round(order.total * 100),   // Stripe expects smallest currency unit (paise)
      currency: 'inr',
      metadata: { orderId: order._id.toString(), userId: req.user._id.toString() },
    })

    // Store intent id on order so we can look it up on confirm
    order.paymentId = intent.id
    await order.save()

    res.json({ clientSecret: intent.client_secret, intentId: intent.id })
  } catch (err) {
    next(err)
  }
}

// POST /api/payments/stripe/confirm
exports.confirmStripePayment = async (req, res, next) => {
  try {
    const { orderId, paymentIntentId } = req.body

    const stripe = getStripe()
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (intent.status !== 'succeeded') {
      return res.status(400).json({ message: `Payment not succeeded (status: ${intent.status})` })
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id })
    if (!order) return res.status(404).json({ message: 'Order not found' })

    order.paymentStatus = 'paid'
    order.paymentId     = paymentIntentId
    order.status        = 'processing'
    order.tracking.push({ status: 'processing', note: 'Payment received via Stripe' })
    await order.save()

    res.json({ message: 'Payment confirmed', order })
  } catch (err) {
    next(err)
  }
}

// ════════════════════════════════════════
// RAZORPAY
// ════════════════════════════════════════

// POST /api/payments/razorpay/create
// Bug 5 fix: actually creates a Razorpay order (was a stub before)
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body
    if (!orderId) return res.status(400).json({ message: 'orderId is required' })

    const order = await Order.findOne({ _id: orderId, user: req.user._id })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order is already paid' })
    }

    const razorpay = getRazorpay()
    const rzpOrder = await razorpay.orders.create({
      amount:   Math.round(order.total * 100),   // paise
      currency: 'INR',
      receipt:  `rcpt_${order._id}`,
      notes:    { orderId: order._id.toString() },
    })

    // Store Razorpay order id so verify can match it back
    order.paymentId = rzpOrder.id
    await order.save()

    res.json({
      razorpayOrderId: rzpOrder.id,
      amount:          rzpOrder.amount,
      currency:        rzpOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    next(err)
  }
}

// POST /api/payments/razorpay/verify
exports.verifyRazorpay = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

    // Verify HMAC signature — proves the payment came from Razorpay
    const body         = `${razorpayOrderId}|${razorpayPaymentId}`
    const expectedSig  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSig !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed — signature mismatch' })
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id })
    if (!order) return res.status(404).json({ message: 'Order not found' })

    order.paymentStatus = 'paid'
    order.paymentId     = razorpayPaymentId
    order.status        = 'processing'
    order.tracking.push({ status: 'processing', note: 'Payment received via Razorpay' })
    await order.save()

    res.json({ message: 'Payment verified', order })
  } catch (err) {
    next(err)
  }
}
