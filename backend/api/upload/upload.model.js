'use strict'

let mongoose = require('bluebird').promisifyAll(require('mongoose'));
import { Schema, mongo } from 'mongoose';

let UploadSchema = new mongoose.Schema({
    url: String,
    active: Boolean
});

export default mongoose.model('Upload', UploadSchema);