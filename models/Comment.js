let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let CommentSchema = new Schema({
    user:{type: Schema.Types.ObjectId, ref: 'User'},
    body:{type: String, required:[true, 'is required'], maxlength: 100},
    replies:[{type: Schema.Types.ObjectId, ref:'Comment'} ],
    //reTweet:[{type: Schema.Types.ObjectId, ref: 'User'}],
    likesCount:{type: Number, default: 0},
    likedBy:[{type:Schema.Types.ObjectId, ref:'User'}],
    repliesCount:{type: Number, default: 0},
    //reTweetsCount:{type: Number, default: 0},
    hasReplies:{type: Number,default:false},
}, {timestamps:true});

CommentSchema.methods.addReply = function(replyId) {
    this.replies.push(replyId);
    this.changeHasReplies();
    return this.increaseRepliesCount();
}

CommentSchema.methods.changeHasReplies = function() {
    if(!this.hasReplies) {
        this.hasReplies = true;
        return;
    }
}

CommentSchema.methods.increaseRepliesCount = function() {
    this.repliesCount += 1;
    return this.save();
}

CommentSchema.methods.likeComment = function(user_id) {
    this.likedBy.push(user_id);
    return this.increaseLikesCount();
}

CommentSchema.methods.dislikeComment = function(user_id) {
    this.likedBy.remove(user_id);
    return this.decreaseLikesCount();
}

CommentSchema.methods.increaseLikesCount = function() {
    this.likesCount += 1;
    return this.save();
}

CommentSchema.methods.decreaseLikesCount = function() {
    this.likesCount -= 1;
    return this.save();
}




CommentSchema.methods.toUserCommentsJSON = function() {
    return {
        firstname:this.user.firstname,
        lastname: this.user.lastname,
        username:this.user.username,
        profile :this.user.profile,
        comment:this.toCommentJSON(),
    };
}

CommentSchema.methods.toCommentJSON = function() {
    return {
        body:this.body,
        likesCount:this.likesCount,
        repliesCount:this.repliesCount,
        hasReplies:this.hasReplies,
        //reTweetsCount:this.reTweetsCount,
    }
}

CommentSchema.method.likeComment
module.exports = mongoose.model('Comment', CommentSchema);