const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
  code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
  type:          { type: String, enum: ['percent', 'flat'], required: true },
  value:         { type: Number, required: true, min: 0 },   // % or ₹ amount
  minOrderValue: { type: Number, default: 0 },               // min cart value to apply
  maxDiscount:   { type: Number },                           // cap on percent coupons
  usageLimit:    { type: Number, default: null },            // null = unlimited
  usedCount:     { type: Number, default: 0 },
  expiresAt:     { type: Date, default: null },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true })

// Compute discount for a given order total
couponSchema.methods.calcDiscount = function (total) {
  if (this.type === 'flat') return Math.min(this.value, total)
  const disc = (this.value / 100) * total
  return this.maxDiscount ? Math.min(disc, this.maxDiscount) : disc
}

module.exports = mongoose.model('Coupon', couponSchema)
