const JWT = require('jsonwebtoken');
const SECRET = "HEYYY#$@!ANKIT"; // cant store publicly, change it later

function createTokensforUser(user) {
    const payload = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
    };
    const token = JWT.sign(payload, SECRET);
    return token;
}

function validateToken(token) {
    const payload = JWT.verify(token, SECRET);
    return payload;
}

module.exports = { createTokensforUser, validateToken };