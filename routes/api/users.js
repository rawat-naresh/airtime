let router = require('express').Router();
let User = require('../../models/User');
let auth = require('../auth');
let passport = require('passport');


/* user login route */

router.get('/', function(req,res, next) {
    res.send("<h2>Welcome to the Airtime API.</h2>");
});

router.get('/user', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(user){
        if(!user){ return res.sendStatus(401); }
        return res.json({user: user.toAuthJSON()});
    }).catch(next);
});
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



router.get('/users/follow-suggestions', auth.required, function(req, res, next) {
    //currently we are suggestion top 10 users.
    User.findById(req.payload.id).then(function(user) {
        if(!user) { return res.sendStatus(404); }

        Promise.resolve(
            User.find({_id:{$ne:user._id, $nin:user.following},}).
            select({firstname:1,lastname:1,username:1,profile:1}).
            limit(10).
            sort('-followersCount')
        ).then(function(users) {
            return res.json({'suggestions':users.map( user => {
                return {
                    firstname:user.firstname,
                    lastname:user.lastname,
                    profile:user.profile,
                    username:user.username
                };
            })});
        });
    });
});

/* GET user profile */

router.get('/users/:username', auth.optional, function(req, res, next) {
    // Promise.resolve(
    //     req.payload ? User.findById(req.payload.id) : null,
    //     //req.user.populate('tweets').execPopulate(),

    // ).then(function(result){
    //     // let user = results[0];
    //     return res.json({profile:req.user.toProfileJSON(user ? user._id:null)});
    // }).catch(next);
    return res.json({profile:req.user.toProfileJSON(req.user ? req.user._id:null)});
});

router.get('/users/check/:username', auth.optional, function(req, res, next) {
    return res.json({exists:true});
});

/*GET all the tweets of the user */

router.get('/users/:username/tweets', auth.optional, function(req, res, next) {
    
    Promise.all([
        req.payload ? User.findById(req.payload.id) : null,
        req.user.populate({path:'tweets',populate:{ path: 'user'},options:{ sort:{"createdAt" : "descending"}}})
                .execPopulate() 
                
    ]).then(function(results) {
        let user = results[0];
        return res.json({tweets: req.user.tweets.map(function(tweet) {
            return tweet.toUserRtJSON(user?user._id:null);
    })});
    }).catch(next);
});

router.get('/users/:username/tweet/tweetId', function(req, res, next) {
    //get individual tweet
});

/* GET Re-Tweets   */
//working as expected
router.get('/users/:username/re-tweets', auth.required, function(req,res,next) {

    Promise.all([
        req.payload ? User.findById(req.payload.id) : null,
        req.user.populate({path:'reTweets',populate:{ path: 'user'}}).execPopulate()
    ]).then(function(results) {
        let user = results[0];
        return res.json({reTweets: req.user.reTweets.map(function(retweet) {
                return retweet.toUserRtJSON(user?user._id:null);
        })});
    }).catch(next);    

});

/* GET Tweets liked/replid by user  */

router.get('/users/:username/likes', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(user) {
        if(!user){ return res.sendStatus(404);}

        Promise.resolve(req.user.populate({path:'likedTweets',populate:{ path: 'user'},options:{ sort:{"createdAt" : "descending"}}}).execPopulate())
        .then(function(result) {
            return res.json({likedTweets: req.user.likedTweets.map(function(likedTweet) {
                return likedTweet.toUserRtJSON(user?user._id:null);
            })});
        });
        
        
    }).catch(next);
});

/* Follow a user */

router.put('/users/:username/follow', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(user) {
        if(!user){ return res.sendStatus(404);}

        if(!user.isFollowing(req.user._id)) {
            user.addFollowing(req.user._id).then(function() {
                req.user.addFollower(user._id).then(function() {
                    return  res.json({ followingCount: user.getFollowingCount() });
                });
            });
        }
        else {
            return res.json({ followingCount:user.getFollowingCount() });
        }
        
    }).catch(next);
});

router.delete('/users/:username/unfollow', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(user) {
        if(!user) {return res.sendStatus(404);}

        if(user.isFollowing(req.user._id)) {
            user.removeFollowing(req.user._id).then(function() {
                req.user.removeFollower(user._id).then(function() {
                    return res.json({ followingCount:user.getFollowingCount() });
                });
            });
        }
        else {
            return res.json({ followingCount:user.getFollowingCount });
        }
    }).catch(next);
});


/* router.put('/users/:username/block', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(user) {
        if(!user) {return res.sendStatus(404);}
        
        
    }).catch(next);
});
 */
/* router.delete('/users/:username/unblock', auth.required, function(req, res, next) {

});
 */
/* router.get('/users/:username/unfollowed-by', auth.required, function(req, res, next) {

});
 */
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