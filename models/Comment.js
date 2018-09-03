let mongoose = require('mongoose');
let Schema = monoose.Schema;

let CommentSchema = new Schema({
    userId:{type: Schema.Types.ObjectId, ref: 'User'},
    body:{type: String, required:[true, 'is required'], maxlength: 100},
    replies:[{type: Schema.Types.ObjectId, ref: 'Comment'}],
    reTweet:[{type: Schema.Types.ObjectId, ref: 'User'}],
    likesCount:{type: Number, default: 0},
    repliesCount:{type: Number, default: 0},
    reTweetCount:{type: Number, default: 0},
}, {timestamps:true});

module.exports = mongoose.model('Comment', CommentSchema);