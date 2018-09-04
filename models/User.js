let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let uniqueValidator = require('mongoose-unique-validator');


/* Defining User schema  */

let UserSchema = new Schema({
    firstname:{
        type: String, 
        required:[true, 'is required']
    },
    lastname:{
        type: String, 
        required:[true, 'is required']
    },
    username:{
        type: String, 
        required:[true, 'is required'], 
        unique:true, 
        match: [/^[a-zA-Z0-9_]+$/, 'is invalid'], 
        index: true
    },
    bio:{
        type: String, 
        maxlength:100
    },
    birthday:{
        type: Date
    },
    relationship:{
        type: String, 
        enum:['Single','Married','Occupied','Complicated']
    },
    contact:{
        type: String, 
        match: [/^[0-9]+$/, 'is invalid']
    },
    profile:String,
    wall:String,
    followersCount:{
        type: Number, default:0
    },
    followingCount:{
        type: Number, default:0
    },
    followers:[{
        type: Schema.Types.ObjectId, 
        ref: 'User'
    }],
    following:[{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    tweets:[{
        type: Schema.Types.ObjectId,
        ref: 'Tweet'
    }],
    likedTweets:[{
        type: Schema.Types.ObjectId, 
        ref:'Tweet'
    }],
    reTweets:[{
        type: Schema.Types.ObjectId,
        ref:'Tweet'
    }],
    mentions:[{
        type: Schema.Types.ObjectId, 
        ref:'Tweet'
    }]

});

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

UserSchema.methods.toJSONFor = function(user) {
    return {
        firstname: this.firstname,
        lastname: this.lastname,
        username: this.username,
        bio: this.bio,
        birthday: this.birthday,
        contact: this.contact,
        relationship: this.relationship,
        profile: this.profile,
        wall: this.wall,
        followersCount: this.followersCount,
        followingCount: this.followingCount,
        /* followers: user ? this.followers : null,
        following: user ? this.following : null, */
        tweets: this.tweets,
       /*  likedTweets: user ? this.likedTweets : null,
        reTweets: user ? this.reTweets : null,
        mentions: user ? this.mentions : null, */
        createdAt: this.createdAt,

    }
}

module.exports = mongoose.model('User',UserSchema);