const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
}, { timestamps: true })

const imageSchema = new mongoose.Schema({
  url:       { type: String, required: true },
  publicId:  String,
  isPrimary: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
})

const productSchema = new mongoose.Schema({
  name:          { type: String, required: [true, 'Product name is required'], trim: true },
  slug:          { type: String, unique: true },
  description:   { type: String, required: true },
  price:         { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0 },
  brand:         { type: String, trim: true },
  category:      { type: String, required: true, lowercase: true },
  stockQty:      { type: Number, required: true, default: 0, min: 0 },
  images:        [imageSchema],
  reviews:       [reviewSchema],
  avgRating:     { type: Number, default: 0 },
  reviewCount:   { type: Number, default: 0 },
  isFeatured:    { type: Boolean, default: false },
}, { timestamps: true })

productSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
  }
  if (this.reviews.length > 0) {
    const total = this.reviews.reduce((s, r) => s + r.rating, 0)
    this.avgRating = +(total / this.reviews.length).toFixed(1)
    this.reviewCount = this.reviews.length
  }
  next()
})

productSchema.index({ name: 'text', description: 'text', brand: 'text' })
productSchema.index({ category: 1, price: 1, avgRating: -1 })

module.exports = mongoose.model('Product', productSchema)
