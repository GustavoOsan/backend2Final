const { Router } = require('express');
const passport = require('passport');
const authorization = require('../middlewares/auth');
const { 
    createCart, 
    getCartById, 
    addProductToCart,
    purchaseCart 
} = require('../controllers/carts.controller');

const router = Router();
router.post('/', createCart);
router.get('/:cid', getCartById);
router.post('/:cid/product/:pid', passport.authenticate('jwt', { session: false }), authorization('user'), addProductToCart);
router.post('/:cid/purchase', passport.authenticate('jwt', { session: false }), purchaseCart);

module.exports = router;