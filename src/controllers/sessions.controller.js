const userModel = require('../dao/models/user.model');
const { createHash, isValidPassword } = require('../utils');
const jwt = require('jsonwebtoken');
const UserDTO = require('../dto/user.dto');
const { sendMail } = require('../services/mail.service');
const register = async (req, res) => {
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
}

const login = async (req, res) => {
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

        const token = jwt.sign({
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            age: user.age,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.cookie('coderCookieToken', token, {
            maxAge: 60 * 60 * 1000 * 24,
            httpOnly: true
        }).send({ status: 'success', message: 'Logueado exitosamente' });

    } catch (error) {
        res.status(500).send({ status: 'error', message: 'Error al iniciar sesión' });
    }
}

const current = async (req, res) => {
    if (!req.user) return res.status(401).send({ status: "error", error: "No autenticado" });

    const userDTO = new UserDTO(req.user);
    res.send({ status: 'success', payload: userDTO });
}

const logout = (req, res) => {
    res.clearCookie('coderCookieToken');
    res.redirect('/login');
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).send({ status: 'error', message: 'Usuario no encontrado' });
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const resetLink = `http://localhost:8080/reset-password?token=${token}`;

        await sendMail({
            to: email,
            subject: 'Restablecer contraseña',
            html: `
                <div>
                    <h1>¿Olvidaste tu contraseña?</h1>
                    <p>Haz click en el botón para restablecerla:</p>
                    <a href="${resetLink}">Restablecer Contraseña</a>
                </div>
            `
        });

        res.send({ status: 'success', message: 'Correo enviado' });

    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', message: 'Error al enviar correo' });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).send({ status: 'error', message: 'Usuario no encontrado' });

        if (isValidPassword(user, newPassword)) {
            return res.status(400).send({ status: 'error', message: 'No puedes usar la misma contraseña anterior' });
        }

        user.password = createHash(newPassword);
        await userModel.updateOne({ email }, user);

        res.send({ status: 'success', message: 'Contraseña actualizada' });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).send({ status: 'error', message: 'El enlace ha expirado' });
        }
        res.status(500).send({ status: 'error', message: 'Error al restablecer' });
    }
}

module.exports = {
    register,
    login,
    current,
    logout,
    forgotPassword,
    resetPassword
}