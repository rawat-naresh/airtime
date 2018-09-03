let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let jsonwebtoken = require('jsonwebtoken');
let secret = require('../config');


/* Defining User schema  */

let UserSchema = new Schema({
    
});

/* this method will return a JWT Token */
UserSchema.methods.generateJWT = function() {
    let today = new Date();
    let exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    return jsonwebtoken.sign({
        id:this._id,
        username:this.username,
        exp : parseInt(exp.getDate() + 60)
    }, secret);
};

UserSchema.methods.toAuthJSON = function() {
    return {
        username:this.username,
        token:this.generateJWT,
    };
}

module.exports = mongoose.model('user',UserSchema);