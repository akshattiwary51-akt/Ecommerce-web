const Order = require('../models/Order')
const Product = require('../models/Product')
const Cart = require('../models/Cart')

exports.placeOrder = async (req, res, next) => {
  try {
    const { address, paymentMethod } = req.body

    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price discountPrice images stockQty')
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }

    // Build order items & deduct stock
    const items = []
    for (const ci of cart.items) {
      const p = ci.product
      if (!p) continue
      if (p.stockQty < ci.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${p.name}` })
      }
      items.push({
        product:   p._id,
        name:      p.name,
        image:     p.images?.[0]?.url || '',
        quantity:  ci.quantity,
        unitPrice: p.discountPrice || p.price,
      })
      await Product.findByIdAndUpdate(p._id, { $inc: { stockQty: -ci.quantity } })
    }

    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    const tax      = +(subtotal * 0.18).toFixed(2)
    const total    = +(subtotal + tax).toFixed(2)

    const order = await Order.create({
      user: req.user._id, items, address,
      paymentMethod, subtotal, tax, total,
      tracking: [{ status: 'pending', note: 'Order placed successfully' }],
    })

    // Clear cart
    await Cart.findByIdAndUpdate(cart._id, { items: [] })

    res.status(201).json(order)
  } catch (err) { next(err) }
}

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'images name')
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) { next(err) }
}

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('items.product', 'name images')
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  } catch (err) { next(err) }
}

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, location, note } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })

    order.status = status
    order.tracking.push({ status, location, note })
    await order.save()
    res.json(order)
  } catch (err) { next(err) }
}

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' })
    }
    order.status = 'cancelled'
    order.tracking.push({ status: 'cancelled', note: 'Cancelled by customer' })
    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stockQty: item.quantity } })
    }
    await order.save()
    res.json(order)
  } catch (err) { next(err) }
}

exports.requestReturn = async (req, res, next) => {
  try {
    const { orderId, reason } = req.body
    const order = await Order.findOne({ _id: orderId, user: req.user._id })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' })
    }
    order.returnRequest = { reason, status: 'requested', requestedAt: new Date() }
    order.tracking.push({ status: 'returned', note: `Return requested: ${reason}` })
    await order.save()
    res.json(order)
  } catch (err) { next(err) }
}
