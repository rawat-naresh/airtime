let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let uniqueValidator = require('mongoose-unique-validator');
let crypto = require('crypto');
let jsonwebtoken = require('jsonwebtoken');
let secret = require('../config').secret;
let Tweet = require('./Tweet');

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
    email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
    hash: String,
    salt: String,    
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
    }],
    

});

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});


UserSchema.methods.validPassword = function(password) {
    let hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};
  
UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

/* this method will return a JWT Token */
UserSchema.methods.generateJWT = function() {
    let today = new Date();
    let exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    return jsonwebtoken.sign({
        id:this._id,
        username:this.email,
        exp : parseInt(exp.getTime() / 1000),
    }, secret);
};

UserSchema.methods.toAuthJSON = function() {
    return {
        email:this.email,
        token:this.generateJWT(),
    };
};

UserSchema.methods.toProfileJSON = function(userId) {
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
        tweets: this.toTweetJSON(userId),
        createdAt: this.createdAt,

    };
}

UserSchema.methods.toTweetJSON = function(userId) {
    return this.tweets.map(function(tweet) {
        return tweet.toTweetJSON(userId)
    });
}

UserSchema.methods.addTweetToUser = function(tweet) {
    this.tweets.push(tweet);
    return this.save();
}

UserSchema.methods.addRTweetToUser = function(tweetId) {
    if(this.reTweets.indexOf(tweetId) === -1) {
        this.reTweets.push(tweetId);
    }
    
    return this.save();
}


UserSchema.methods.toUserTweetJSON = function(userId){
    return {
        firstname: this.firstname,
        lastname:  this.lastname,
        username:  this.username,
        profile:   this.profile,
        tweets:    this.toTweetJSON(userId),
    };
}

UserSchema.methods.likeTweet = function(tweet) {
   
    this.likedTweets.push(tweet._id);
    this.save();
    return tweet.likeTweet(this._id);
}

UserSchema.methods.dislikeTweet = function(tweet) {

     this.likedTweets.remove(tweet._id);
     this.save();
     return tweet.dislikeTweet(this._id); 
 }


UserSchema.methods.deleteTweet = function(tweetId) {
    let tWindex = this.tweets.indexOf(tweetId);
    if(tWindex != -1) {
        this.tweets.splice(tWindex,1);
        Tweet.findByIdAndRemove(tweetId).exec();
        let rTindex = this.reTweets.indexOf(tweetId);
        if(rTindex != -1) {
            this.reTweets.splice(rTindex, 1);
        }
    
        this.save()
        return true;
    
    }
    
    return false;
}

UserSchema.methods.toRetweetJSON = function(user) {

    return {
        reTweets: this.reTweets.toUserJSON(user)
    }

}

UserSchema.methods.getFollowingCount = function() {

    return this.followingCount;
}

UserSchema.methods.getFollowersCount = function() {

    return this.followersCount;
}

UserSchema.methods.isFollowing = function(id) {

    return this.following.indexOf(id) != -1

}

UserSchema.methods.addFollowing = function(id) {

    this.following.push(id);
    return this.increaseFollowingCount(); 

}

UserSchema.methods.increaseFollowingCount = function() {

    this.followingCount +=1;
    return this.save();
}

UserSchema.methods.addFollower = function(id) {
    this.followers.push(id);
    return this.increaseFollowerCount();
}

UserSchema.methods.increaseFollowerCount = function(id) {
    this.followersCount +=1 ;
    return this.save();
}

UserSchema.methods.removeFollowing = function(id) {
    this.following.remove(id);
    return this.decreaseFollowingCount();
}

UserSchema.methods.removeFollower = function(id) {
    this.followers.remove(id);
    return this.decreaseFollowerCount();
}

UserSchema.methods.decreaseFollowingCount = function() {
    this.followingCount -= 1;
    return this.save();
}

UserSchema.methods.decreaseFollowerCount = function() {
    this.followersCount -= 1;
    return this.save();
}

UserSchema.methods.addMentionedTweet = function(tweetId) {
    this.mentions.push(tweetId);
    return this.save();
}

module.exports = mongoose.model('User',UserSchema);