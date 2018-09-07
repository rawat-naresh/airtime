let router = require('express').Router();
let Tweet = require('../../models/Tweet');
let User = require('../../models/User');
let Comment = require('../../models/Comment');
let auth = require('../auth');


/* preloading tweet */

router.param('tweetId', function(req, res, next, tweetId) {
    Tweet.findById(tweetId).then(function(tweet) {
        if(!tweet) { return res.sendStatus(404);}
        req.tweet = tweet;
        return next();
    }).catch(next);
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
          tweet.populate('user').execPopulate();
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
            user.addRTweetToUser(req.tweet._id),    
            req.tweet.populate('user').execPopulate(),
        ]).then(function(results){
            return res.json({tweet: req.tweet.toUserRtJSON(user._id)});
        }).catch(next)          
    });
});

/* Like a Tweet */

router.post('/:tweetId/like', auth.required, function(req, res, next) {
    
      User.findById(req.payload.id).then(function(user){
        if (!user) { return res.sendStatus(401); }
    
        if(!req.tweet.isLikedBy(user._id )) {
             user.likeTweet(req.tweet).then(function(tweet) {
                 
                return res.json({tweetLikes:tweet.getLikesCount()});
                
            });
        }
        else  
            return res.json({tweetLikes:req.tweet.getLikesCount()}); 
        
        
      }).catch(next);
});

/* Dislike a Tweet */

router.delete('/:tweetId/dislike', auth.required, function(req, res, next) {
    
    User.findById(req.payload.id).then(function(user){
        if (!user) { return res.sendStatus(401); }
        
        if(req.tweet.isLikedBy(user._id)) {
            user.dislikeTweet(req.tweet).then(function(tweet) {
                return res.json({tweetLikes:tweet.getLikesCount()});
            });
        }
        else 
            return res.json({tweetLikes:req.tweet.getLikesCount()});
    
    }).catch(next);
});



router.get('/:tweetId/comments', auth.optional, function(req, res, next) {
    Promise.resolve(req.tweet.populate({path:'comments', populate:{path:'user'}}).execPopulate())
    .then(function() {
        return res.json({comments:req.tweet.comments.map(function(comment) {
            return comment.getUserCommentsJSON();
        })}); 
    }).catch(next);
});


router.post('/:tweetId/comment', auth.required, function(req, res, next) {
    if(req.body.comment === 'undefined'){
        return res.json({'body':'is required'});
    }

    User.findById(req.payload._id,{_id}).then(function(user) {
        if(!user){ return res.sendStatus(401); }

        let comment = new Comment();
        comment.user = user._id; 
        comment.body = req.body.comment;
        comment.save().then(function(comment){

            req.tweet.addComment(comment._id).then(function(tweet){
                return res.json({comments:tweet.comments.map(function(comment) {
                    return comment.getUserCommentsJSON();
                    }) 
                });
            });

        });

        

    }).catch(next);
});

router.get('/:commentId/replies', auth.optional, function(req, res, next) {
    
     Comment.findById(req.params.commentId).then(function(comment) {
        if(!comment) { return res.json({replies:null});}
        Promise.resolve(comment.populate({path:'replies', populate:{path:'user'}})).then(function(){
          return res.json(
            {
                replies:comment.replies.map(function(reply) {
                    return reply.getUserCommentsJSON();
                })
            }
        );  
    });


    }).catch(next); 
});


router.post('/:commentId/reply', auth.required, function(req, res, next) {
    if(req.body.comment === 'undefined') {
        return res.json({'comment':'cannot bew null'});
    }

    Comment.findById(req.params.commentId).then(function(comment) {
        if(!comment) {return res.sendStatus(404); }

        let comment = new Comment();
        comment.body = req.body.comment;
        comment.user = req.payload.id
    }).catch(next);
});


/*router.post('/:tweetId/comment', auth.required, function(req, res, next) {

}).catch(next);*/

/* Delete a tweet */

/* router.delete('/:tweetId/delete', auth.required, function(req, res, next) {
    let tweetId = req.tweet._id;

    User.findById(req.payload.id).then(function(user) {
        if(!user) { return res.sendStatus(401); }
        /
          check if this tweet belongs to user,if not action restricted
         * delete tweet from user entry
         * unlike the tweet form all the users.
         * delete tweet for tweet entry
         * 
         *
        user.deleteTweet(tweetId) ?  res.sendStatus(200) :  res.sendStatus(403);

    }).catch(next);
});
 */

module.exports = router;