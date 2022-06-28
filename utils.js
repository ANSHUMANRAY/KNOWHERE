const jwt = require('jsonwebtoken');

function decodeToken(token, secret) {
    let payload;
    try {
        payload = jwt.verify(token, secret);
    }
    catch(error) {
        payload = "";
    }
    
    return payload;
}

module.exports = { decodeToken };