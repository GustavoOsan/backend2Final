const { Router } = require('express');
const passport = require('passport');

const router = Router();

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('register');
});


router.get('/profile', passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), (req, res) => {
    res.render('profile', {
        user: req.user
    });
});

module.exports = router;