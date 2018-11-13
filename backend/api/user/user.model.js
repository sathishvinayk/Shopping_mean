'use strict'

import crypto from 'crypto';
let mongoose = require('bluebird').promisifyAll(require('mongoose'));
import { Schema, mongo } from 'mongoose';

const authTypes = ['github', 'twitter', 'facebook', 'google'];

let UserSchema = new Schema({
    name: String,
    email: {
        type: String,
        lowercase: true
    },
    role: {
        type: String,
        default: 'user'
    },
    categories: [{
        type: Schema.Types.ObjectId,
        ref: 'Catalog',
        index: true
    }],
    password: String,
    provider: String,
    salt: String,
    facebook: {},
    twitter: {},
    google: {},
    github: {},
    phone: String,
    address: String,
    city: String,
    state: String,
    country: String
})

// Non-Sensitive info we'll be putting in token
UserSchema.path('email').validate(function(email){
    if(authTypes.indexOf(this.provider)!== -1){
        return true;
    }
    return email.length;
}, 'Email cannot be blank');

// Validate empty pass
UserSchema.path('password').validate(function(password){
    if(authTypes.indexOf(this.provider) !== -1){
        return true;
    }
    return password.length;
}, 'Password cannot be blank');

//Validate email is not taken
UserSchema.path('email').validate(function(value, respond){
    let self = this;
    return this.constructor.findOneAsync({email: value})
        .then(function(user){ 
            if(user){
                if(self.id === user.id){
                    return respond(true);
                }
                return respond(false);
            }
            return respond(true);
        })
        .catch(function(err){
            throw err;
        });
}, 'The specified email address is already in use');

let validatePresencOf = function(value){
    return value && value.length;
}

// Pre save hook
UserSchema.pre('save', function(next){
    // Handle new/update passwords
    if(!this.isModified('password')){ 
        return next();
    }
    if(!validatePresencOf(this.password) && authTypes.indexOf(this.provider) === -1){
        next(new Error('Invalid password'));
    }
    // Make salt with callback
    this.makeSalt()
})

// Methods
UserSchema.methods = {
    makeSalt(byteSize, callback){
        let defaultByteSize = 16;
        if(typeof arguments[0] === 'function'){
            callback = arguments[0]
            byteSize = defaultByteSize;
        } else if (typeof arguments[1] === 'function'){
            callback = arguments[1]
        }
        if(!byteSize){
            byteSize = defaultByteSize;
        }
        if(!callback){
            return crypto.randomBytes(byteSize).toString('base64')
        }
        return crypto.randomBytes(byteSize, (err, salt)=>{
            if(err){
                callback(err)
            }else {
                callback(null, salt.toString('base64'));
            }
        });
    },
    // Encrypt Password
    encryptPassword(password, callback){
        if(!password || !this.salt){
            return null;
        }
        let defaultIterations = 10000;
        let defaultKeyLength = 64;
        let salt = new Buffer(this.salt, 'base64');
        if(!callback){
            return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength)
                .toString('base64')
        }
        return crypto.pbkdf2Sync(password, salt, defaultIterations,defaultKeyLength, (err, key)=>{
            if(err){
                callback(err);
            } else {
                callback(null, key.toString('base64'));
            }
        });
    },
    // authenticate check if pass are same
    authenticate(password, callback){
        if(!callback){
            return this.password === this.encryptPassword(password);
        }
        this.encryptPassword(password, (err, pwdGen)=>{
            if(err){
                return callback(err);
            }
            if(this.password === pwdGen){
                callback(null, true)
            }else {
                callback(null, false);
            }
        })
    }
}

export default mongoose.model('User', UserSchema);