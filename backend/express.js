import express from 'express';
import favicon from 'serve-favicon';
import morgan from 'morgan';
import compression from 'compression';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import errorHandler from 'errorhandler';
import path from 'path';
import lusca from 'lusca'
import passport from 'passport';
import session from 'express-session';
import config from './environment';
import connectMongo from 'connect-mongo';
import mongoose from 'mongoose';

let mongoStore = connectMongo(session);

export default function(app){
    let env = app.get('env');

    app.set('views', config.root + '/server/views');
    app.engine('html', require('ejs').renderFile)
    app.set('view engine', 'html');
    app.use(compression());
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(cookieParser());
    app.use(passport.initialize());

    app.use(session({
        secret: config.secrets.session,
        saveUninitialized: true,
        resave: false,
        store: new mongoStore({
            mongooseConnection: mongoose.connection,
            db: 'bhcmart'
        })
    }))

    // Lusca server security
    if(env !== 'development' && env !== 'test'){
        app.use(lusca({
            csrf:{
                angular: true
            },
            xframe: 'SAMEORIGIN',
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            },
            xssProtection: true
        }));
    }

    app.set('appPath', path.join(config.root, 'client'));

    if(env === 'production'){
        app.use(require('connect-livereload')());
    }
    if(env === 'development' || 'test' === env){
        app.use(express.static(path.join(config.root, '.tmp')));
        app.use(express.static(app.get('appPath')));
        app.use(morgan('dev'));
        app.use(errorHandler());
    }
}