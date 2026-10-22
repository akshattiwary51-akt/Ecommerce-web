const router = require('express').Router()
const multer = require('multer')
const {
  getProducts, getProductById, createProduct, updateProduct,
  deleteProduct, addReview, uploadImages, getCategories,
} = require('../controllers/product.controller')
const { protect, isAdmin } = require('../middleware/auth.middleware')
const validate = require('../middleware/validate.middleware')
const { body } = require('express-validator')

const upload = multer({ dest: 'uploads/' })

const reviewRules = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
  body('comment').trim().notEmpty().withMessage('Comment is required'),
]

router.get('/',            getProducts)
router.get('/categories',  getCategories)
router.get('/:id',         getProductById)
router.post('/:id/reviews', protect, reviewRules, validate, addReview)
router.post('/:id/images',  protect, isAdmin, upload.array('images', 5), uploadImages)
router.post('/',    protect, isAdmin, createProduct)
router.put('/:id',  protect, isAdmin, updateProduct)
router.delete('/:id', protect, isAdmin, deleteProduct)

module.exports = router
