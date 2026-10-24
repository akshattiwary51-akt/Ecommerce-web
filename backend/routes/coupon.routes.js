const router = require('express').Router()
const { applyCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/coupon.controller')
const { protect, isAdmin } = require('../middleware/auth.middleware')

// User: apply a coupon (authenticated so we can extend to per-user limits later)
router.post('/apply', protect, applyCoupon)

// Admin
router.get('/',        protect, isAdmin, getCoupons)
router.post('/',       protect, isAdmin, createCoupon)
router.put('/:id',     protect, isAdmin, updateCoupon)
router.delete('/:id',  protect, isAdmin, deleteCoupon)

module.exports = router
