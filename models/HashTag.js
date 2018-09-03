let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let HashTagSchema = new Schema({
    tweetId:[{type:Schema.Types.ObjectId, ref:'Tweet'}],
    tag:{type: String, required:[true, 'is required'],index:true},
}, {timestamps:true});