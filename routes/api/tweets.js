let router = require('express').Router();
let Tweet = require('../../models/Tweet');
let User = require('../../models/User');
let auth = require('../auth');

/* preloading tweet */

router.param('tweetId', function(req, res, next, tweetId) {
    Tweet.findById(tweetId).then(function(tweet) {
        if(!tweet) { return res.sendStatus(404);}
        req.tweet = tweet;
        return next();
    }).catch(next);
});

router.get('/', function(req, res, next) {
    res.json({'tweet':'tweets root'});
});

/* working fine */

router.post('/create', auth.required ,function(req, res, next) {
    if( req.body.tweet.body === 'undefined') {
        return res.json({'body':'is required'});
    }

    User.findById(req.payload.id).then(function(user){
        if (!user) { return res.sendStatus(401); }
    
        let tweet = new Tweet(req.body.tweet);
    
        tweet.user = user._id;
    
        return tweet.save().then(function(){
          console.log("------------- "+tweet.user+" ----------------------");
          tweet.populate('user').execPopulate();
          console.log('********************************');
          console.log(tweet);
          console.log('********************************');
          user.addTweetToUser(tweet);
          return res.json({tweet: tweet.toUserRtJSON(user._id)});
        });
      }).catch(next);
});

/* working fine */

router.post('/:tweetId/retweet', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(user){
        if (!user) { return res.sendStatus(401); }
        
        Promise.all([
            user.addRTweetToUser(req.tweet),
            req.tweet.populate('user').execPopulate(),
        ]).then(function(results){
            return res.json({tweet: req.tweet.toUserRtJSON(user._id)});
        }).catch(next)          
    });
});

/* Like a Tweet */

router.post('/:tweetId/like', auth.required, function(req, res, next) {
    let tweetId = req.tweet._id;
    
      User.findById(req.payload.id).then(function(user){
        if (!user) { return res.sendStatus(401); }
    
        let likesCount = req.tweet.likesCount;

        if(!req.tweet.isLiked(user._id )) {
             user.likeTweet(tweetId).then(function() {
                 req.tweet.increaseLikesCount(user._id,likesCount).then(function(tweet) {
                     likesCount = tweet.likesCount;
                    return res.json({likes:likesCount});
                });
            });
        }
        else  
            return res.json({likes:likesCount}); 
        
        
      }).catch(next);
});

/* Dislike a Tweet */

router.post('/:tweetId/dislike', auth.required, function(req, res, next) {
    let tweetId = req.tweet._id;
    
    User.findById(req.payload.id).then(function(user){
        if (!user) { return res.sendStatus(401); }
        
        let likesCount = req.tweet.likesCount;
        if(req.tweet.isLiked(user._id)) {
            user.dislikeTweet(tweetId).then(function() {
                req.tweet.decreaseLikesCount(user._id,likesCount).then(function(tweet) {
                    likesCount = tweet.likesCount;
                    return res.json({likes:likesCount});
                });
            });
        }
        else 
            return res.json({likes:likesCount});
    
    }).catch(next);
});

/* Delete a tweet */

router.delete('/:tweetId/delete', auth.required, function(req, res, next) {
    let tweetId = req.tweet._id;

    User.findById(req.payload.id).then(function(user) {
        if(!user) { return res.sendStatus(401); }
        

        user.deleteTweet(tweetId) ?  res.sendStatus(200) :  res.sendStatus(403);

    }).catch(next);
});

module.exports = router;