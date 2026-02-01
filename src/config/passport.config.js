const passport = require('passport');
const jwt = require('passport-jwt');
const { cookieExtractor } = require('../utils'); 

const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const initializePassport = () => {
    
    const cookieExtractor = req => {
        let token = null;
        if (req && req.cookies) {
            token = req.cookies['coderCookieToken']; 
        }
        return token;
    }

    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.JWT_SECRET || 'CoderSecretClaveSuperSecreta'
    }, async (jwt_payload, done) => {
        try {
            return done(null, jwt_payload);
        } catch (error) {
            return done(error);
        }
    }));
};

module.exports = initializePassport;