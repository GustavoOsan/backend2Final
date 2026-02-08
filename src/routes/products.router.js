const { Router } = require('express');
const passport = require('passport');
const authorization = require('../middlewares/auth');
const { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} = require('../controllers/products.controller');

const router = Router();

router.get('/', getProducts);
router.get('/:pid', getProductById);
router.post('/', passport.authenticate('jwt', { session: false }), authorization('admin'), createProduct);
router.put('/:pid', passport.authenticate('jwt', { session: false }), authorization('admin'), updateProduct);
router.delete('/:pid', passport.authenticate('jwt', { session: false }), authorization('admin'), deleteProduct);

module.exports = router;