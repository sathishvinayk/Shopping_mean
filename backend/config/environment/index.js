'use strict'

const path = require('path');
const _ = require('lodash');

function requiredProcessEnv(name){

}

let all = {
    env : process.env.NODE_ENV,

    root: path.normalize(__dirname + '../../..'),

    port: process.env.PORT || 9000,

    ip: process.env.IP || '0.0.0.0',
    
    seedDB: false,

    secrets: {
        session: process.env.SESSION_SECRET || 'secret'
    },

    mongo: {
        options: {
            db: { 
                safe: true
            }
        }
    },

    facebook: {
        clientID: process.env.FACEBOOK_ID || 'id',
        clientSecret: process.env.FACEBOOK_SECRET || 'secret',
        callbackURL: (process.env.DOMAIN || '') + '/auth/facebook/callback'
    },

    twitter: {
        clientID: process.env.TWITTER_ID || 'id', 
        clientSecret: process.env.TWITTER_SECRET || 'secret',
        callbackURL: (process.env.DOMAIN || '') + '/auth/twitter/callback'
    },
    
    google: {
        clientID:     process.env.GOOGLE_ID || 'id',
        clientSecret: process.env.GOOGLE_SECRET || 'secret',
        callbackURL:  (process.env.DOMAIN || '') + '/auth/google/callback'
    }
};

module.exports = _.merge(
    all,
    require('./shared'),
    require('./' + process.env.NODE_ENV + '.js') || {}
);