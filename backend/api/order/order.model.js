'use strict';

let mongoose = require('bluebird').promisifyAll(require('mongoose'));
let autoIncrement = require('mongoose-auto-increment');
import config from '../../config/environment';
let Schema = mongoose.Schema;

autoIncrement.initialize(mongoose.createConnection(config.mongo.uri));

let OrderItemSchema = new Schema({
    name: String,
    price: Number,
    quantity: Number,
    total: Number,
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }
});

let OrderSchema = new Schema({
    orderNumber: String,
    shipping: Number,
    tax: Number,
    taxRate: Number,
    subTotal: Number,
    totalCost:Number,
    items: [OrderItemSchema],
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    customerName: String,
    customerEmail: String,
    customerAddress: String,
    customerPhone: String,
    customerCity: String,
    customerCountry: String,
    delivered: {
        type:Boolean,
        default: false
    },
    created: {
        type: Date,
        default: Date.now
    }
});

OrderSchema.plugin(autoIncrement.plugin, {
    model : 'Order',
    field: 'orderNumber',
    startAt: 400000,
    incrementBy: 1
})

export default mongoose.model('Order', OrderSchema);