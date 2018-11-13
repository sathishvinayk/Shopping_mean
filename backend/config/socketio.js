'use strict'

import config from './environment';

function onDisconnect(socket){

}

function onConnect(socket){
    socket.on('info', data => {
        socket.log(JSON.stringify(data, null, 2));
    })

    require('../api/request/request.socket').register(socket);
    require('../api/upload/upload.socket').register(socket);
    require('../api/order/order.socket').register(socket);
    require('../api/catalog/catalog.socket').register(socket);
    require('../api/product/product.socket').register(socket);
    require('../api/thing/thing.socket').register(socket);
}

export default function(socketio){

    socketio.on('connection', function(socket){
        socket.address = socket.request.connection.remoteAddress + 
            ':' + socket.request.connection.remotePort;
        socket.connectedAt = new Date();
        socket.log = function(...data){
            console.log(`SocketIO ${socket.nsp.name}[${socket.address}]`, ...data);
        }

        socket.on('disconnect', ()=>{
            onvrdisplaydisconnect(socket);
            socket.log('DISCONNECTED');
        })

        onConnect(socket);
        socket.log('CONNECTED')
    })   
}