const Cart = require('../models/Cart')
const Product = require('../models/Product')

const populateCart = (cart) =>
  cart.populate({ path: 'items.product', select: 'name price discountPrice images brand stockQty' })

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] })
    await populateCart(cart)
    res.json(cart)
  } catch (err) { next(err) }
}

exports.addItem = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body
    const product = await Product.findById(productId)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    if (product.stockQty < quantity) return res.status(400).json({ message: 'Insufficient stock' })

    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] })

    const existing = cart.items.find(i => i.product.toString() === productId)
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stockQty)
    } else {
      cart.items.push({ product: productId, quantity })
    }

    await cart.save()
    await populateCart(cart)
    res.json(cart)
  } catch (err) { next(err) }
}

exports.updateItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) return res.status(404).json({ message: 'Cart not found' })

    const item = cart.items.id(req.params.itemId)
    if (!item) return res.status(404).json({ message: 'Item not found in cart' })

    const { quantity } = req.body
    if (quantity < 1) {
      cart.items.pull(req.params.itemId)
    } else {
      item.quantity = quantity
    }

    await cart.save()
    await populateCart(cart)
    res.json(cart)
  } catch (err) { next(err) }
}

exports.removeItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) return res.status(404).json({ message: 'Cart not found' })
    cart.items.pull(req.params.itemId)
    await cart.save()
    await populateCart(cart)
    res.json(cart)
  } catch (err) { next(err) }
}

exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] })
    res.json({ message: 'Cart cleared', items: [] })
  } catch (err) { next(err) }
}
