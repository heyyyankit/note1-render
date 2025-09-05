const {validateToken} = require('../services/authentication');
const User = require('../models/user');

function checkForAuthenticationCookie(cookieName) {
    return async function(req, res, next) {
        const token = req.cookies[cookieName];
        if (!token) {
            return next();  // user not verified
        }
        try {
            const payload = validateToken(token); // payload contains id
            const user = await User.findById(payload.id);
            req.user = user;
            next();
        } catch (err) {
            next();
        }
    }
}
module.exports = { checkForAuthenticationCookie };