const Coupon = require('../models/Coupon')

// ── User: validate & preview a coupon code ───────────────────────────────────
// POST /api/coupons/apply   { code, orderTotal }
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body
    if (!code || !orderTotal) return res.status(400).json({ message: 'code and orderTotal are required' })

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() })
    if (!coupon || !coupon.isActive) return res.status(404).json({ message: 'Invalid or inactive coupon' })

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: 'Coupon has expired' })
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' })
    }
    if (orderTotal < coupon.minOrderValue) {
      return res.status(400).json({
        message: `Minimum order value ₹${coupon.minOrderValue} required for this coupon`,
      })
    }

    const discount = +coupon.calcDiscount(orderTotal).toFixed(2)
    res.json({ code: coupon.code, type: coupon.type, value: coupon.value, discount })
  } catch (err) { next(err) }
}

// ── Admin CRUD ────────────────────────────────────────────────────────────────

exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 })
    res.json(coupons)
  } catch (err) { next(err) }
}

exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body)
    res.status(201).json(coupon)
  } catch (err) { next(err) }
}

exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' })
    res.json(coupon)
  } catch (err) { next(err) }
}

exports.deleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id)
    res.json({ message: 'Coupon deleted' })
  } catch (err) { next(err) }
}
