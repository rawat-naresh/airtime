let mongoose = require('mongoose');
let Schema = mongoose.Schema;

/* Defining Tweet Schema */
let TweetSchema = new Schema({
    userId:{type: Schema.Types.ObjectId, ref: 'User'},
    body:{type: String, required:[true, 'is required'], maxlength:100},
    likesCount:{type: Number, default: 0},
    hatesCount:{type: Number, default: 0},
    reTweetsCount:{type: Number, default:0},
    likedBy:[{type: Schema.Types.ObjectId, ref:'User'}],
    hatedBy:[{type: Schema.Types.ObjectId, ref:'User'}],
    reTweetedBy:[{type: Schema.Types.ObjectId, ref: 'User'}],
    commentsCount:{type:Number, default:0},
    comments:[{types: Schema.Types.ObjectId, ref: 'Comment'}],
    attachments:[{type: String}],
    hashTags:[{type: Schema.Types.ObjectId, ref: 'HashTag'}],

}, {timestamps: true});


/*TweetSchema.methods.toTweetJSON = function() {
    return {
        user:this.user.,
        body:this.body,
        likesCount:this.likesCount,
        hatesCount:this.hatesCount,
        commentsCount:this.commentsCount,
        attachments:this.attachments,
    }
}*/

TweetSchema.methods.toProfileTweetJSON = function(userId) {
    return {
        _id:this._id,
        user_id:this.userId,
        body:this.body,
        likesCount:this.likesCount,
        hatesCount:this.hatesCount,
        reTweetsCount:this.reTweetsCount,
        commentsCount:this.commentsCount,
        attachments:this.attachments,
        isLiked: userId ? this.isLiked(userId): false,
        isHated: userId ? this.isHated(userid): false,
    }
};

TweetSchema.methods.isLiked = function(userId) {
    this.likedBy.some(function(_id) {
        return _id.toString() === userId.toString();
    });
}

TweetSchema.methods.isHated = function(userId) {
    this.hatedBy.some(function(_id) {
        return _id.toString() === userId.toString();
    });
}


module.exports = mongoose.model('Tweet', TweetSchema);