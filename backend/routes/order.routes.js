const router = require('express').Router()
const {
  placeOrder, getOrders, getOrderById,
  updateOrderStatus, cancelOrder, requestReturn,
} = require('../controllers/order.controller')
const { protect, isAdmin } = require('../middleware/auth.middleware')
const validate = require('../middleware/validate.middleware')
const { body } = require('express-validator')

const orderRules = [
  body('address.line1').notEmpty().withMessage('Address line 1 is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.postalCode').notEmpty().withMessage('Postal code is required'),
  body('paymentMethod').isIn(['cod', 'razorpay', 'stripe']).withMessage('Invalid payment method'),
]

router.use(protect)
router.post('/',              orderRules, validate, placeOrder)
router.get('/',               getOrders)
router.get('/:id',            getOrderById)
router.post('/return',        requestReturn)
router.put('/:id/cancel',     cancelOrder)
router.put('/:id/status',     isAdmin, updateOrderStatus)

module.exports = router
