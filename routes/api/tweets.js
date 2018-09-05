let router = require('express').Router();
let Tweet = require('../../models/Tweet');
let User = require('../../models/User');
let auth = require('../auth');

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
router.put('/:tweetId/retweet', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(user){
        if (!user) { return res.sendStatus(401); }
        
        Promise.all([
            user.addRTweetToUser(req.tweet),
            req.tweet.populate('user').execPopulate(),
        ]).then(function(results){
            return res.json({tweet: req.tweet.toUserRtJSON(user._id)});
        }).catch(next)          
    }).catch(next);
});

/* 
*create tweet
*retweet
*like tweet
*dislike tweet
*delete tweet
*

*/
module.exports = router;