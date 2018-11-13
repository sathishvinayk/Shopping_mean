'use strict'

let express = require('express');
let controller = require('./product.controller');
let multiparty = require('connect-multiparty');
let uploadOptions = {
    autoFile: true,
    uploadDir: 'clients/assets/uploads/'
}
let router = express.Router();

router.post('/:id/upload', multiparty(uploadOptions), controller.upload);
router.get('/', controller.index);
router.get('/:slug', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.get('/:slug/catalog/:limit', controller.catalog);
router.get('/:slug/search/:term', controller.search);

router.post('/:id/images', multiparty(uploadOptions), controller.uploadImage);
router.get('/:id/images', controller.indexImage);
router.put('/:id/images/:image_id', controller.updateImage);

router.post('/:id/variants', controller.createVariant);
router.get('/:id/variants', controller.indexVariant);
router.put('/:id/variants/:variant_id', controller.updateVariant);
router.patch('/:id/variants/:variant_id', controller.updateVariant);
router.delete('/:id/variants/:variant_id', controller.destroyVariant);

router.post('/:id/reviews', controller.createReview);
router.get('/:id/reviews', controller.indexReview);
router.put('/:id/reviews/:review_id', controller.updateReview);
router.patch('/:id/reviews/:review_id', controller.updateReview);

module.exports = router;