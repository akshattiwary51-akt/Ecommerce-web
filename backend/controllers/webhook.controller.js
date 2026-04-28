const crypto = require('crypto')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Order = require('../models/Order')

// ============== STRIPE ==============
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,                                  // raw Buffer (because we used express.raw)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('[Stripe webhook] Signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object
        const orderId = intent.metadata?.orderId
        if (!orderId) break

        const order = await Order.findById(orderId)
        if (!order) {
          console.warn(`[Stripe webhook] Order not found: ${orderId}`)
          break
        }
        if (order.paymentStatus === 'paid') break // idempotency

        order.paymentStatus = 'paid'
        order.paymentId = intent.id
        order.status = 'processing'
        order.tracking.push({
          status: 'processing',
          note: 'Payment confirmed via Stripe webhook',
        })
        await order.save()
        console.log(`[Stripe webhook] Order ${orderId} marked paid`)
        break
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object
        const orderId = intent.metadata?.orderId
        if (!orderId) break
        const order = await Order.findById(orderId)
        if (!order || order.paymentStatus === 'paid') break
        order.paymentStatus = 'failed'
        order.tracking.push({
          status: 'pending',
          note: `Stripe payment failed: ${intent.last_payment_error?.message || 'unknown'}`,
        })
        await order.save()
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object
        const orderId = charge.metadata?.orderId
        if (!orderId) break
        const order = await Order.findById(orderId)
        if (!order) break
        order.paymentStatus = 'refunded'
        order.status = 'cancelled'
        order.tracking.push({ status: 'cancelled', note: 'Refunded via Stripe' })
         await order.save()
        break
      }

      default:
        // Unhandled event type — return 200 anyway so Stripe doesn't retry
        break
    }

    res.json({ received: true })
  } catch (err) {
    console.error('[Stripe webhook] Handler error:', err)
    // Return 500 so Stripe retries
    res.status(500).json({ error: 'Internal handler error' })
  }
}

// ============== RAZORPAY ==============
exports.razorpayWebhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature']
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET

  // 1. Verify signature
  const expected = crypto
    .createHmac('sha256', secret)
    .update(req.body)        // raw Buffer
    .digest('hex')

  if (expected !== signature) {
    console.error('[Razorpay webhook] Signature mismatch')
    return res.status(400).json({ message: 'Invalid signature' })
  }

  // 2. Parse the payload (req.body is a Buffer here)
  let event
  try {
    event = JSON.parse(req.body.toString('utf8'))
  } catch (err) {
    return res.status(400).json({ message: 'Invalid JSON' })
  }

  try {
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity
        // We stored orderId in notes when creating the order
        const orderId = payment.notes?.orderId
        if (!orderId) break
        const order = await Order.findById(orderId)
        if (!order) {
          console.warn(`[Razorpay webhook] Order not found: ${orderId}`)
          break
        }
        if (order.paymentStatus === 'paid') break // idempotency

        order.paymentStatus = 'paid'
        order.paymentId = payment.id
        order.status = 'processing'
        order.tracking.push({
          status: 'processing',
          note: 'Payment captured via Razorpay webhook',
        })
        await order.save()
        console.log(`[Razorpay webhook] Order ${orderId} marked paid`)
        break
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity
        const orderId = payment.notes?.orderId
        if (!orderId) break
        const order = await Order.findById(orderId)
         if (!order || order.paymentStatus === 'paid') break
        order.paymentStatus = 'failed'
        order.tracking.push({
          status: 'pending',
          note: `Razorpay payment failed: ${payment.error_description || 'unknown'}`,
        })
        await order.save()
        break
      }

      case 'refund.processed': {
        const refund = event.payload.refund.entity
        const orderId = refund.notes?.orderId
        if (!orderId) break
        const order = await Order.findById(orderId)
        if (!order) break
        order.paymentStatus = 'refunded'
        order.status = 'cancelled'
        order.tracking.push({ status: 'cancelled', note: 'Refunded via Razorpay' })
        await order.save()
        break
      }

      default:
        break
         }

    res.json({ status: 'ok' })
  } catch (err) {
    console.error('[Razorpay webhook] Handler error:', err)
    res.status(500).json({ error: 'Internal handler error' })
  }
}