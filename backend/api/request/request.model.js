'use strict'

let mongoose = require('bluebird').promisifyAll(require('mongoose'));
import { Schema } from 'mongoose';
let autoIncrement = require('mongoose-auto-increment');
import config from '../../config/environment';

autoIncrement.initialize(mongoose.createConnection(config.mongo.uri))

let RequestItemSchema = new Schema({
    description: String,
    price: Number,
    quantity: Number,
    total: Number
});

let RequestSchema = new Schema({
    requestNumber: String,
    customerId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    items: [RequestItemSchema],
    customerName: String,
    customerEmail: String,
    customerAddress: String,
    customerPhone: String,
    customerCity: String,
    customerState: String,
    customerCountry: String,
    listSubTotal: Number,
    listTotal: Number,
    processId: {
        type: Boolean,
        default: false
    },
    created: {
        type: Date,
        default: Date.now
    }
});

RequestSchema.plugin(autoIncrement.plugin, {
    model: 'Request',
    field: 'requestNumber',
    startAt: 700000,
    incrementBy: 1
});

export default mongoose.model('Request', RequestSchema)