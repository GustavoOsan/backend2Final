const { Router } = require('express');
const passport = require('passport');
const authorization = require('../middlewares/auth'); 
const { 
    register, login, current, logout, 
    forgotPassword, resetPassword 
} = require('../controllers/sessions.controller');
const userModel = require('../dao/models/user.model');
const router = Router();

router.delete('/:uid', 
    passport.authenticate('jwt', { session: false }), 
    authorization('admin'), 
    async (req, res) => {
        try {
            const { uid } = req.params;
            const result = await userModel.deleteOne({ _id: uid });
            res.send({ status: 'success', message: 'Usuario eliminado', payload: result });
        } catch (error) {
            res.status(500).send({ status: 'error', message: 'Error al eliminar' });
        }
    }
);

module.exports = router;