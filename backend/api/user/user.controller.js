'use strict';

import User from './user.model';
import passport from 'passport';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';

function validationError(res, statusCode){
    statusCode = statusCode || 422;
    return function(err){
        res.status(statusCode).json(err);
    }
}

function handleError(res,statusCode){
    statusCode = statusCode || 500;
    return function(err){
        res.status(statusCode).send(err);
    };
}

function respondWith(res, statusCode){
    statusCode = statusCode || 200;
    return function(){
        res.status(statusCode).end();
    };
}

// Get list of users