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
    comments:[{types: Schema.Types.ObjectId, ref: 'Comment'}],
    attachments:[{type: String}],
    hashTags:[{type: Schema.Types.ObjectId, ref: 'HashTag'}],

}, {timestamps: true});

module.exports = mongoose.model('Tweet', TweetSchema);