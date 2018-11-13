'use strict'

const express = require('express');
let controller = require('./request.controller');

let router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/:id/myrequests', controller.myRequests);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;