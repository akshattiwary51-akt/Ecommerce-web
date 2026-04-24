const Order = require('../models/Order')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const crypto = require('crypto')

exports.createStripeIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body
    const order = await Order.findOne({ _id: orderId, user: req.user._id })
    if (!order) return res.status(404).json({ message: 'Order not found' })

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.round(order.total * 100), // paise / cents
      currency: 'inr',
      metadata: { orderId: order._id.toString() },
    })

    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) { next(err) }
}

exports.confirmStripePayment = async (req, res, next) => {
  try {
    const { orderId, paymentIntentId } = req.body
    const order = await Order.findOne({ _id: orderId, user: req.user._id })
    if (!order) return res.status(404).json({ message: 'Order not found' })

    order.paymentStatus = 'paid'
    order.paymentId = paymentIntentId
    order.status = 'processing'
    order.tracking.push({ status: 'processing', note: 'Payment received via Stripe' })
    await order.save()
    res.json({ message: 'Payment confirmed', order })
  } catch (err) { next(err) }
}

exports.createRazorpayOrder = async (req, res, next) => {
  try {
    // Razorpay SDK not imported to keep deps minimal — swap in real project
    const { orderId } = req.body
    const order = await Order.findOne({ _id: orderId, user: req.user._id })
    if (!order) return res.status(404).json({ message: 'Order not found' })

    // In production: const Razorpay = require('razorpay')
    // const rzp = new Razorpay({ key_id: ..., key_secret: ... })
    // const rzpOrder = await rzp.orders.create({ amount: order.total * 100, currency: 'INR', receipt: orderId })
    // res.json(rzpOrder)

    res.json({ message: 'Razorpay integration: initialise SDK with your keys', amount: order.total * 100, currency: 'INR' })
  } catch (err) { next(err) }
}

exports.verifyRazorpay = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

    const body = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSig !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed — signature mismatch' })
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id })
    if (!order) return res.status(404).json({ message: 'Order not found' })

    order.paymentStatus = 'paid'
    order.paymentId = razorpayPaymentId
    order.status = 'processing'
    order.tracking.push({ status: 'processing', note: 'Payment received via Razorpay' })
    await order.save()

    res.json({ message: 'Payment verified', order })
  } catch (err) { next(err) }
}
