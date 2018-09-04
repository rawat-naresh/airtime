let router = require('express').Router();
let User = require('../../models/User');
let auth = require('../auth');
let passport = require('passport');


/* user login route */

router.post('/users/login', function(req, res, next) {

    if(!req.body.user.email)
        return res.status(422).json({errors: {email: "can't be blank"}});
    if(!req.body.user.password)
        return res.status(422).json({errors: {password: "can't be blank"}});

    passport.authenticate('local', { session:false }, function(err, user, info) {
        if(err) { return next(err); }
        
        if(user) {
            user.token = user.generateJWT();
            return res.json({user:user.toAuthJSON()});
        } else {
            return res.status(422).json(info);
        }

        
    })(req, res, next);

});
    
/* user signup route */

router.post('/users/signup', function(req, res, next) {
    let user = new User();
    user.firstname = req.body.user.firstname;
    user.lastname = req.body.user.lastname;
    user.username = req.body.user.username;
    user.email = req.body.user.email;
    user.password = user.setPassword(req.body.user.password);

    user.save().then(function() {
            return res.json({user: user.toAuthJSON()});
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
    Promise.all([
        req.payload ? User.findById(req.payload.id) : null,
        req.user.populate('tweets').execPopulate(),

    ]).then(function(results){
        let user = results[0];
        return res.json({profile:req.user.toProfileJSON(user._id)});
    }).catch(next);
});

/*GET all the tweets of the user */

router.get('/users/:username/tweets', auth.optional, function(req, res, next) {
    
    Promise.all([
        req.payload ? User.findById(req.payload.id) : null,
        req.user.populate('tweets')
                .execPopulate() 
                
    ]).then(function(results) {
        let user = results[0];
        return res.json({tweets: req.user.toTweetJSON(user._id)});
    }).catch(next);
});

/* GET Tweets   */

/* router.get('/users/:username/tweets', auth.optional, function(req, res, next) {
    Promise.all([
        req.payload ? User.findById(req.payload.id) : null,
        req.user.populate('tweets').execPopulate(),

     ]).then(function(results) {
        return res.json({tweets:{}})
     }).catch(next);
}); */

/* GET Re-Tweets   */

router.get('/users/:username/re-tweets', auth.required, function(req,res,next) {

    Promise.all([
        req.payload ? User.findById(req.payload.id) : null,
        req.user.populate({path:'reTweets',populate:{ path: 'userId'}}).execPopulate()
    ]).then(function(results) {
        let user = results[0];
        return res.json({reTweets: req.user.reTweets.map(function(retweet) {
                return retweet.toRetweetJSON(user);
        })});
    }).catch(next);    

});

/* GET Tweets liked/replid by user  */

router.get('/users/:username/likes-n-replies', auth.required, function(req, res, next) {

});

/* Follow a user */

router.put('/users/:username/follow', auth.required, function(req, res, next) {

});

router.delete('/users/:username/unfollow', auth.required, function(req, res, next) {

});

router.put('/users/:username/block', auth.required, function(req, res, next) {

});

router.delete('/users/:username/unblock', auth.required, function(req, res, next) {

});

router.get('/users/:username/unfollowed-by', auth.required, function(req, res, next) {

});

//get user tweets:optional
//get user retweets:optional
//get user liked and replied tweets :optional
//get this user profile:optional


//follow a user:auth
//unfollow a user:auth
//block a user:auth
//unblock a user:auth
//recently unfollowed by whom:auth

module.exports = router;