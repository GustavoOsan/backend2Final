const { Router } = require('express');
const userModel = require('../dao/models/user.model');
const { createHash, isValidPassword } = require('../utils');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const router = Router();

router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;

        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.status(400).send({ status: 'error', message: 'El usuario ya existe' });
        }

        const user = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password) 
        };

        await userModel.create(user);
        res.send({ status: 'success', message: 'Usuario registrado' });
    } catch (error) {
        res.status(500).send({ status: 'error', message: 'Error al registrar' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ email, role: 'admin', name: 'Admin Coder' }, process.env.JWT_SECRET, { expiresIn: '24h' });
            return res.cookie('coderCookieToken', token, { httpOnly: true }).send({ status: 'success', message: 'Logueado como Admin' });
        }


        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).send({ status: 'error', message: 'Usuario no encontrado' });
        }

        if (!isValidPassword(user, password)) {
            return res.status(400).send({ status: 'error', message: 'Contraseña incorrecta' });
        }

        const userToken = {
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            age: user.age,
            role: user.role
        };

        const token = jwt.sign(userToken, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.cookie('coderCookieToken', token, {
            maxAge: 60 * 60 * 1000 * 24,
            httpOnly: true
        }).send({ status: 'success', message: 'Logueado exitosamente' });

    } catch (error) {
        res.status(500).send({ status: 'error', message: 'Error al iniciar sesión' });
    }
});

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.send({ status: 'success', payload: req.user });
});

router.post('/logout', (req, res) => {
    res.clearCookie('coderCookieToken');
    res.redirect('/login');
});

module.exports = router;