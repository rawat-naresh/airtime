let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let uniqueValidator = require('mongoose-unique-validator');


/* Defining User schema  */

let UserSchema = new Schema({
    firstname:{type: String, required:[true, 'is required']},
    lastname:{type: String, required:[true, 'is required']},
    username:{type: String, required:[true, 'is required'], unique:true, match: [/^[a-zA-Z0-9_]+$/, 'is invalid'], index: true},
    bio:{type: String, maxlength:100},
    birthday:{type: Date},
    relationship:{type: String, enum:['Single','Married','Occupied','Complicated']},
    contact:{type: String, match: [/^[0-9]+$/, 'is invalid']},
    profile:String,
    wall:String,
    followersCount:{type: Number, default:0},
    followingCount:{type: Number, default:0},
    followers:[{type: Schema.Types.ObjectId, ref: 'User'}],
    following:[{type: Schema.Types.ObjectId,ref: 'User'}],
    tweets:[{type: Schema.Types.ObjectId,ref: 'Tweet'}],
    likedTweets:[{type: Schema.Types.ObjectId, ref:'Tweet'}],
    reTweets:[{type: Schema.Types.ObjectId,ref:'Tweet'}],
    mentions:[{type: Schema.Types.ObjectId, ref:'Tweet'}]

});

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

module.exports = mongoose.model('User',UserSchema);