let jwt = require('express-jwt');
let config = require('../config');

function getTokenFromHeader(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token' ||
        req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
    }

    return null;
}

let auth = {
    required:jwt({
        secret:config.secret,
        userProperty:'payload',
        getToken:getTokenFromHeader,
        credentialsRequired:true
    }),
    optional:jwt({
        secret:config.secret,
        userProperty:'payload',
        credentialsRequired:false,
        getToken:getTokenFromHeader
    }),
};

module.exports = auth;