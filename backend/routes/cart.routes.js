const router = require('express').Router()
const { getCart, addItem, updateItem, removeItem, clearCart } = require('../controllers/cart.controller')
const { protect } = require('../middleware/auth.middleware')
const validate = require('../middleware/validate.middleware')
const { body } = require('express-validator')

const addItemRules = [
  body('productId').notEmpty().withMessage('productId is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
]

router.use(protect)
router.get('/',                  getCart)
router.post('/items',            addItemRules, validate, addItem)
router.put('/items/:itemId',     updateItem)
router.delete('/items/:itemId',  removeItem)
router.delete('/',               clearCart)

module.exports = router
