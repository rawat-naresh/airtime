let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let CommentSchema = new Schema({
    user:{type: Schema.Types.ObjectId, ref: 'User'},
    body:{type: String, required:[true, 'is required'], maxlength: 100},
    replies:[{type: Schema.Types.ObjectId, ref:'Comment'} ],
    //reTweet:[{type: Schema.Types.ObjectId, ref: 'User'}],
    likesCount:{type: Number, default: 0},
    repliesCount:{type: Number, default: 0},
    //reTweetsCount:{type: Number, default: 0},
    hasReplies:{type: Number,default:false},
}, {timestamps:true});



module.exports = mongoose.model('Comment', CommentSchema);