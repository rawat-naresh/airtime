let mongoose = require('mongoose');
let Schema = mongoose.Schema;

/* Defining Tweet Schema */
let TweetSchema = new Schema({
    body:{type: String, required:[true, 'is required'],maxlength:100},
    likesCount:{type: Number, default: 0},
    hatesCount:{type: Number, default: 0},
    retweetsCount:{type: Number, default:0},
    attachments:[{type:string}],

});

module.exports = mongoose.model('Tweet', TweetSchema);