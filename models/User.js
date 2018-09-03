let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let jsonwebtoken = require('jsonwebtoken');
let secret = require('../config');


/* Defining User schema  */

let UserSchema = new Schema({

});

UserSchema.methods.toAuthJSON = function() {
    return {
        username:this.username,
        token:this.generateJWT,
    };
}

module.exports = mongoose.model('user',UserSchema);