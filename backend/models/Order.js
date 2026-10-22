const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:      String,
  image:     String,
  quantity:  { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
})

const trackingSchema = new mongoose.Schema({
  status:    String,
  location:  String,
  note:      String,
  updatedAt: { type: Date, default: Date.now },
})

const orderSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:   [orderItemSchema],
  address: {
    line1: String, line2: String,
    city: String, state: String,
    postalCode: String, country: String,
  },
  status:        { type: String, enum: ['pending','processing','shipped','delivered','cancelled','returned'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cod','razorpay','stripe'], required: true },
  paymentStatus: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  paymentId:     String,
  subtotal:      { type: Number, required: true },
  tax:           { type: Number, default: 0 },
  discount:      { type: Number, default: 0 },
  total:         { type: Number, required: true },
  tracking:      [trackingSchema],
  returnRequest: {
    reason: String,
    status: { type: String, enum: ['none','requested','approved','rejected'], default: 'none' },
    requestedAt: Date,
  },
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
