const Wishlist = require('../models/Wishlist')

exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products', 'name price discountPrice images avgRating brand')
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] })
    res.json(wishlist.products)
  } catch (err) { next(err) }
}

exports.toggleWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] })

    const productId = req.params.productId
    const idx = wishlist.products.indexOf(productId)
    if (idx === -1) {
      wishlist.products.push(productId)
    } else {
      wishlist.products.splice(idx, 1)
    }

    await wishlist.save()
    await wishlist.populate('products', 'name price discountPrice images avgRating brand')
    res.json(wishlist.products)
  } catch (err) { next(err) }
}
