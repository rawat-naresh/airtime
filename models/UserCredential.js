let mongoose = require('mongoose');
let uniqueValidator = require('mongoose-unique-validator');
let crypto = require('crypto');
let Schema = mongoose.Schema;
let jsonwebtoken = require('jsonwebtoken');
let secret = require('../config');


/* Defining User schema  */

let UserCredentialSchema = new Schema({
    email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
    hash: String,
    salt: String    
}, {timestamps:true});

UserCredentialSchema.plugin(uniqueValidator, {message: 'is already taken.'});

UserCredentailSchema.methods.validPassword = function(password) {
    let hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};
  
UserCredentialSchema.methods.setPassword = function(password){
this.salt = crypto.randomBytes(16).toString('hex');
this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

/* this method will return a JWT Token */
UserCredentaialSchema.methods.generateJWT = function() {
    let today = new Date();
    let exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    return jsonwebtoken.sign({
        id:this._id,
        username:this.email,
        exp : parseInt(exp.getDate() + 60)
    }, secret);
};

UserCredentialSchema.methods.toAuthJSON = function() {
    return {
        email:this.email,
        token:this.generateJWT,
    };
};


module.exports = mongoose.model('userCredential',UserCredentailSchema);