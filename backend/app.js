'use strict'

import express from 'express';
import mongoose from 'mongoose';
import config from './config/environment';
import http from 'http';

mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err){
    console.error('MongoDb Connection error: '+ err)
    process.exit(-1);
});

if(config.seedDB){
    require('./config/seed');
}

const app = express();
const server = http.createServer(app);
const socketio = require('socket.io')(server, {
    serveClient: config.env !== 'production',
    path: '/socket.io-client'
});

require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

function startServer(){
    server.listen(config.port, config.ip, function(){
        console.log("Express booted! in %s mode", app.get('env'));
    });
}

setImmediate(startServer);

exports = module.exports = app;