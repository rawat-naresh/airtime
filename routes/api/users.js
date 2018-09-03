let router = require('express').Router();
let passport = require('../../config/passport');

router.get('', function(req, res, next) {
    res.json({success:{message:'this is user home'}});
});

/* user login route */

router.post('users/login', function(req, res, next) {

    passport.authenticate('local', { session:false }, function(err, user, info) {
        if(err) { return next(err); }
        
        if(user) {
            user.token = user.generateJWT();
            return res.json({user:user.toAuthJSON()});
        } else {
            return res.status(422).json(info);
        }
    })
});

module.exports = router;