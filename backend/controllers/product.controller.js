const Product = require('../models/Product')
const buildPaginationQuery = require('../utils/pagination')
const cloudinary = require('../config/cloudinary')

exports.getProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = buildPaginationQuery(req.query)
    const filter = {}

    if (req.query.search)   filter.$text = { $search: req.query.search }
    if (req.query.category) filter.category = req.query.category.toLowerCase()
    if (req.query.rating)   filter.avgRating = { $gte: Number(req.query.rating) }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {}
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice)
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice)
    }

    const sortMap = {
      newest:     { createdAt: -1 },
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      rating:     { avgRating: -1 },
    }
    const sort = sortMap[req.query.sort] || { createdAt: -1 }

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).select('-reviews'),
      Product.countDocuments(filter),
    ])

    res.json({ products, total, page, pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name avatarUrl')
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (err) { next(err) }
}

exports.createProduct = async (req, res) => {
  try {
    // If you're sending an array, use insertMany. If one item, use create.
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (err) { next(err) }
}

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json({ message: 'Product deleted' })
  } catch (err) { next(err) }
}

exports.addReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    const already = product.reviews.find(r => r.user.toString() === req.user._id.toString())
    if (already) return res.status(400).json({ message: 'You have already reviewed this product' })

    product.reviews.push({ user: req.user._id, rating: req.body.rating, comment: req.body.comment })
    await product.save()
    res.status(201).json({ message: 'Review added', avgRating: product.avgRating })
  } catch (err) { next(err) }
}

exports.uploadImages = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    const uploads = await Promise.all(
      req.files.map(f => cloudinary.uploader.upload(f.path, { folder: 'shopease/products' }))
    )
    const images = uploads.map((u, i) => ({ url: u.secure_url, publicId: u.public_id, isPrimary: i === 0 }))
    product.images.push(...images)
    await product.save()
    res.json(product.images)
  } catch (err) { next(err) }
}

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category')
    res.json(categories)
  } catch (err) { next(err) }
}
