let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let HashTagSchema = new Schema({
    tag:{type: String, unique: true, required:[true, 'is required'],index:true},    
    tweets:[{type:Schema.Types.ObjectId, ref:'Tweet'}],
    tweetsCount:{type: Number, default: 0},
}, {timestamps:true});

HashTagSchema.methods.addTweet = function(tweetId) {
    this.tweets.push(tweetId);
    return this.increaseTweetCount();
}

HashTagSchema.methods.increaseTweetCount = function() {
    this.tweetsCount += 1;
    return this.save();
}
module.exports = mongoose.model('HashTag', HashTagSchema);