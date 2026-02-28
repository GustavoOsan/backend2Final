const { Router } = require('express');
const passport = require('passport');
const { 
    register, 
    login, 
    current, 
    logout, 
    forgotPassword, 
    resetPassword 
} = require('../controllers/sessions.controller');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/current', passport.authenticate('current', { session: false }), current);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


module.exports = router;