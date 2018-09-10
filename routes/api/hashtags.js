let router = require('express').Router();
let HashTag = require('../../models/HashTag');
let Tweet = require('../../models/Tweet');
router.get(':/hashtag', auth.optional, function(req, res, next) {
    // Tweet.where('hashTags').in([req.params.hashtag])

    /*User.findById(req.payload.id).then(function(user) {
        if(!user)
    }).catch(next);*/
    HashTag.find({tag:req.params.Hashtag}).then(function(hashtag) {
        if(!hashtag){
            return res.sendStatus(404);
        }
        Promise.resolve(hashtag.populate({path:'tweets',populate:{path:'user'}}.execPopulate())).then(function(hashtag) {
            return res.json({'tweets':hashtag.tweets.map(function(tweet) {
                return tweet.toUserRtJSON(req.payload.id);
            })});
        });
    }).catch(next);
});



module.exports = router;