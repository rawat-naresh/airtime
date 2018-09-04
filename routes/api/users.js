let router = require('express').Router();
let passport = require('../../config/passport');
let User = require('../../models/User');
let UserCredential = require('../../models/UserCredential');
let auth = require('../auth');






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
    });

});
    
/* user signup route */

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
    }).catch(next); 
});


/* preloading user objects on routes with ':username'  */

router.param('username', function(req, res, next, username) {
    User.findOne({ username: username }).then(function(user) {
        if (!user) { return res.sendStatus(404); }
        req.user = user;
        return next();
    }).catch(next);
});

/* GET user profile */

router.get('/users/:username', auth.optional, function(req, res, next) {
    Promise.resolve( req.payload ? User.findById(req.payload.id) : null).then(function(result) {
        /* if(user) {
            Promise.resolve(
                req.user.populate('tweets')
                .populate('reTweets')
                .populate('likedTweets')        
                .populate('mentions')
                .execPopulate() 

            ).then(function(result) {
                return res.json({user:req.user.toJSONFor(user)});
            }).catch(next);

        } else {

            Promise.resolve(
                req.user.populate('tweets')
                .execPopulate() 

            ).then(function(result) {
                return res.json({user:req.user.toJSONFor(user)});
            }).catch(next);
        }
    }).catch(next); */
    Promise.all([
        req.payload ? User.findById(req.payload.id) : null,
        req.user.populate('tweets')
                /* .populate('reTweets')
                .populate('likedTweets')        
                .populate('mentions') */
                .execPopulate() 
                
    ]).then(function(results) {
        let user = results[0];
        return res.json({user: req.user.toJSONFor(user)});
    }).catch(next);
});

/* GET Tweets   */

router.get('/users/:username/tweets', auth.required, function(req, res, next) {

});

/* GET Re-Tweets   */

router.get('/users/:username/re-tweets', auth.required, function(req,res,next) {

});

/* GET Tweets liked/replid by user  */

router.get('/users/:username/likes-n-replies', auth.required, function(req, res, next) {

});

router.put()
//get user tweets:optional
//get user retweets:optional
//get user liked and replied tweets :optional
//get this user profile:optional

/* PUT */
//update user credentials:auth
//update user details:auth

//follow a user:auth
//unfollow a user:auth
//block a user:auth
//unblock a user:auth
//recently unfollowed by whom:auth

module.exports = router;