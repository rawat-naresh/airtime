let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let HashTagSchema = new Schema({
    tag:{type: String, unique: true, required:[true, 'is required'],index:true},    
    tweets:[{type:Schema.Types.ObjectId, ref:'Tweet'}],
    tweetsCount:{type: Number, default: 0},
}, {timestamps:true});

module.exports = mongoose.model('HashTag', HashTagSchema);