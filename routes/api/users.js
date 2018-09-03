let router = require('express').Router();
let passport = require('../../config/passport');
let User = require('../../models/User');
let UserCredential = require('../../models/UserCredential');


router.get('/', function(req, res, next) {
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

router.post('users/signup', function(req, res, next) {
    let user = new User();
    let userCredential = new UserCredential();
    
    user.firstname = req.body.user.firstname;
    user.lastname = req.body.user.lastname;
    user.username = req.body.user.username;

    userCredential.email = req.body.user.email;
    userCredential.password = userCredential.setPassword(req.body.user.password);

    userCredential.save().then(function() {
        user.save().then(function() {
            return res.json({user: userCredential.toAuthJSON()});
        }).catch(next);
    }).catch(next)



});

module.exports = router;