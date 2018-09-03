let mongoose = require('mongoose');
let Schema = mongoose.Schema;


/* Defining User schema  */

let UserSchema = new Schema({
    firstname:{type: String, required:[true, 'is required']},
    lastname:{type: String, required:[true, 'is required']},
    username:{type: String, required:[true, 'is required'],unique:true, match: [/^[a-zA-Z0-9_]+$/, 'is invalid'], index: true},
    bio:{type: String, maxlength:100},
    birthday:{type: Date},
    relationship:{type: String, enum:['Single','Married','Occupied','Complicated']},
    contact:{type: String, match: [/^[0-9]+$/, 'is invalid']},
    profile:String,
    wall:String,
    followers:[{type: Schema.Types.ObjectId, ref: ''}],
    following:[{type: Schema.Types.ObjectId,ref:''}],
    tweets:[{type: Schema.Types.ObjectId,ref:''}],
    likedTweets:[{type: Schema.Types.ObjectId, ref:''}],
    sharedTweets:[{type: Schema.Types.ObjectId,ref:''}],
    mentions:[{type: Schema.Types.ObjectId, ref:''}]

});


module.exports = mongoose.model('user',UserSchema);