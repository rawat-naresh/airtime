let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let User = require('./User');
let Comment = require('./Comment');

/* Defining Tweet Schema */
let TweetSchema = new Schema({
    user:{type: Schema.Types.ObjectId, ref: 'User'},
    body:{type: String, required:[true, 'is required'], maxlength:100},
    likesCount:{type: Number, default: 0},
    // hatesCount:{type: Number, default: 0},
    reTweetsCount:{type: Number, default:0},
    likedBy:[{type: Schema.Types.ObjectId, ref:'User'}],
    // hatedBy:[{type: Schema.Types.ObjectId, ref:'User'}],
    reTweetedBy:[{type: Schema.Types.ObjectId, ref: 'User'}],
    commentsCount:{type:Number, default:0},
    comments:[{type: Schema.Types.ObjectId, ref: 'Comment'}],
    attachments:[{type: String}],
    hashTags:[{type: Schema.Types.ObjectId, ref: 'HashTag'}],

}, {timestamps: true});


TweetSchema.methods.toTweetJSON = function(userId) {
    return {
        _id:this._id,
        // user_id:this.user,
        body:this.body,
        likesCount:this.likesCount,
        // hatesCount:this.hatesCount,
        reTweetsCount:this.reTweetsCount,
        commentsCount:this.commentsCount,
        attachments:this.attachments,
        isLiked: userId ? this.isLiked(userId): false,
        // isHated: userId ? this.isHated(userId): false,
    }
};

TweetSchema.methods.isLiked = function(userId) {
    return (this.likedBy.indexOf(userId) === -1) ? false : true;
}

TweetSchema.methods.increaseLikesCount = function(id, likesCount) {
    this.likedBy.push(id);
    this.likesCount = likesCount+1;
    return this.save();
}



TweetSchema.methods.decreaseLikesCount = function(id, likesCount) {
    this.likedBy.remove(id);
    this.likesCount = likesCount-1;
    return this.save();
}

TweetSchema.methods.isHated = function(userId) {
    this.hatedBy.some(function(_id) {
        return _id.toString() === userId.toString();
    });
}

TweetSchema.methods.toUserRtJSON = function(userId) {
    
    return {
        firstname:this.user.firstname,
        lastname:this.user.lastname,
        username:this.user.username,
        profile:this.user.profile,
        tweet:this.toTweetJSON(userId),
    }

}




module.exports = mongoose.model('Tweet', TweetSchema);