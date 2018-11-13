'use strict'

import errors from './components/errors';
import path from 'path';

export default function(app){
    app.use('/api/requests', require('./api/request'));
    app.use('/api/uploads', require('./api/upload'));
    app.use('/api/orders', require('./api/order'));
    app.use('/api/catalogs', require('./api/catalog'));
    app.use('/api/products', require('./api/product'));
    app.use('/api/things',require('./api/thing'));
    app.use('/api/users', require('./api/user'));

    app.use('/auth', require('./auth'));

    // All undefined Assets or api routes should return 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get(errors[404]);

    app.route('/*')
        .get((req, res)=>{
            res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
        })
}