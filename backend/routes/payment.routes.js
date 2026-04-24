const router = require('express').Router()
const {
  createStripeIntent, confirmStripePayment,
  createRazorpayOrder, verifyRazorpay,
} = require('../controllers/payment.controller')
const { protect } = require('../middleware/auth.middleware')

router.use(protect)
router.post('/stripe/create-intent', createStripeIntent)
router.post('/stripe/confirm',       confirmStripePayment)
router.post('/razorpay/create',      createRazorpayOrder)
router.post('/razorpay/verify',      verifyRazorpay)

module.exports = router
