let router = require('express').Router();
let Tweet = require('../../models/Tweet');
let User = require('../../models/User');
let Comment = require('../../models/Comment');
let HashTag = require('../../models/HashTag');
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
    
        let tweet = new Tweet();
        tweet.body = req.body.tweet.body;
        tweet.user = user._id;
    
        return tweet.save().then(function(){
          tweet.populate('user').execPopulate();
          user.addTweetToUser(tweet);
          
          //add hashtags present in tweet to the hashtag table
          if(req.body.tweet.htags != 'undefined') {
            for(let tag of req.body.tweet.htags) {
                console.log("TAGS:::",tag);
                //check if the hashtag already exists in db if not create new one.
                HashTag.findOne({tag:tag}).then(function(hashtag) {
                    console.log("RETURNED HASHTAG",hashtag);
                    if(!hashtag) {
                        
                        let newHashTag = new HashTag();
                        newHashTag.tag = tag;
                        
                        newHashTag.addTweet(tweet._id);
                        
                    }
                    else {
                        hashtag.addTweet(tweet._id);
                    }
                });
            }
            
          }

          //if mentios present in tweet,add mentions to the User's mentions field
          if(req.body.tweet.mentions != 'undefined') {
              for(let mention of req.body.tweet.mentions) {
              console.log("MENTIONS:::",mention);
              
                User.findOne({username:mention}).then(function(user) {
                    if(user) {
                        user.addMentionedTweet(tweet._id);
                    }
                });
              }
          }


          
          return res.json({tweet: tweet.toUserRtJSON(user._id)});
        });
      }).catch(next);
});

/* working fine */

router.post('/:tweetId/retweet', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(user){
        if (!user) { return res.sendStatus(401); }
        
        /* Promise.all([
            user.addRTweetToUser(req.tweet._id),    
            // req.tweet.populate('user').execPopulate(),
        ]).then(function(results){
            return res.json({rtCount: req.tweet.toUserRtJSON(user._id)});
        }).catch(next)      */    
        
        if(!user.isReTweeted(req.tweet._id)) {
            //update the retweet count
            //add the tweet to the user retweets
            //return retweet count

            // User.findById(req.tweet._id)
            req.tweet.addReTweetedBy(user._id).then(function(tweet){
                user.addRTweetToUser(req.tweet._id).then(function() {
                    return res.json({rtcount:tweet.getRtCount()});
                });
            });
        } else {
            //return retweet count
            return res.json({rtcount:req.tweet.getRtCount()});
        }
    });
});

router.delete('/:tweetId/retweet', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(user){
        if (!user) { return res.sendStatus(401); }   
        
        if(user.isReTweeted(req.tweet._id)) {
            //update the retweet count
            //add the tweet to the user retweets
            //return retweet count

            // User.findById(req.tweet._id)
            req.tweet.removeReTweetedBy(user._id).then(function(tweet){
                user.removeRTweetFromUser(req.tweet._id).then(function() {
                    return res.json({rtcount:tweet.getRtCount()});
                });
            });
        } else {
            //return retweet count
            return res.json({rtcount:req.tweet.getRtCount()});
        }
    });

});

/* Like a Tweet */

router.put('/:tweetId/like', auth.required, function(req, res, next) {
    
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

// user who liked this tweet.
router.get('/:tweetId/likes',auth.optional, function(req, res, next) {
    
    Promise.resolve( req.tweet.populate('likedBy').execPopulate()).then(function(){
        return res.json({likedBy:req.tweet.likedBy.map((user)=>{
            return {
                profile:user.profile,
                firstname:user.firstname,
                lastname:user.lastname,
                username:user.username,
            }
        })})
    });
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
    Promise.resolve(req.tweet.populate({path:'comments', options:{ sort:{"createdAt" : "descending"}}, populate:{path:'user'}}).execPopulate())
    .then(function() {
        return res.json({comments:req.tweet.comments.map(function(comment) {
            return comment.toUserCommentsJSON();
        })}); 
    }).catch(next);
});


router.post('/:tweetId/comment', auth.required, function(req, res, next) {
    if(req.body.comment === 'undefined'){
        return res.json({'body':'is required'});
    }

    User.findById(req.payload.id).then(function(user) {
        if(!user){ return res.sendStatus(401); }

        let comment = new Comment();
        comment.user = user._id; 
        comment.body = req.body.comment;
        comment.save().then(function(comment){

            req.tweet.addComment(comment._id).then(function(tweet){
                // console.log("--------------",tweet.comments);
                // console.log("---***********",req.tweet.comments);
                Promise.resolve(tweet.populate({path:'comments', populate:{path:'user'}}).execPopulate())
                    .then(function() {
                        return res.json({
                            comments:tweet.comments.map(
                                (comment)=>{
                                    return comment.toUserCommentsJSON();
                                }
                            )
                        });
                    });
            });

        });
    }).catch(next)
});

router.get('/:commentId/replies', auth.optional, function(req, res, next) {
    
     Comment.findById(req.params.commentId).then(function(comment) {
        if(!comment) { return res.json({replies:null});}
        Promise.resolve(comment.populate({path:'replies', populate:{path:'user'}})).then(function(){
          return res.json(
            {
                replies:comment.replies.map(function(reply) {
                    return reply.toUserCommentsJSON();
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

        let reply = new Comment();
        reply.body = req.body.comment;
        reply.user = req.payload.id;
        reply.save().then(function(reply) {
            comment.addReply(reply._id).then(function() {
                //right now only returning the current reply
                //TODO:this might change in future.
                return res.json({replies:reply.toUserCommentsJSON()});
            });
        });
    }).catch(next);
});




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