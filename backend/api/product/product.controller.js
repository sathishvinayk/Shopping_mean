'use strict';

let _ = require('lodash');

let Product = require('./product.model').product;
let Image = require('./product.model').image;
let Variant = require('./product.model').variant;
let Review = require('./product.model').review;
let Catalog = require('../catalog/catalog.model');

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
      console.error(err, statusCode);
      res.status(statusCode).send(err);
    };
}
  
function responseWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function(entity) {
        if (entity) {
        res.status(statusCode).json(entity);
        }
    };
}

function handleEntityNotFound(res) {
    return function(entity) {
      if (!entity) {
        res.status(404).end();
        return null;
      }
      return entity;
    };
}

function saveUpdates(updates) {
    return function(entity) {
      var updated = _.merge(entity, updates);
      return updated.saveAsync()
        .spread(function(updated) {
          return updated;
        });
    };
}

function removeEntity(res) {
    return function(entity) {
      if (entity) {
        return entity.removeAsync()
          .then(function() {
            res.status(204).end();
          });
      }
    };
}

function saveFeaturedImage(res, file){
    return function(entity) {
        let newPath = '/assests/uploads/' + path.basename(file.path);
        entity.imageUrl = newPath;
        return entity.saveAsync().spread(function(updated){
            return updated;
        });
    }
}

function productsInCategory(limit){
    limit = Number(limit) || null;
    return function(catalog){
        let catalog_ids = [catalog.id].concat(catalog.children);
        return Product
        .find({
            'categories': {
                $in: catalog_ids
            }
        })
        .limit(limit)
        .populate({path: 'categories', select: 'name'})
        .populate({path: 'reviews', select: 'rating'})
        .populate({path: 'images', select: 'imageUrl'})
        .execAsync();
    }
}

function productInSearchCategory(term){
    return function(catalog){
        let catalog_ids = [catalog._id].concat(catalog.children);
        let option;

        if(catalog.slug == 'all'){
            option = {
                $text: {
                    $search: term
                }
            };
        } else {
            option = {
                'categories': {
                    $in: catalog_ids
                },
                $text: {
                    $search: term
                }
            }
        }
        return Product.find(option)
        .populate({path: 'categories', select: 'name'})
        .populate({path: 'reviews', select: 'rating'})
        .populate({path: 'images', select: 'imageUrl'})
        .execAsync();
    }
}

function linkImageProduct(req,res, productId){
    return function(entity){
        var image = entity;
        return Product.findByIdAsync(req.params.id)
        .then(handleEntityNotFound(res))
        .then(function(entity){
            entity.images.push(image._id);
            return entity.saveAsync().spread(function(){
                return image;
            })
        })
    }
}

function getImages(res){
    return function(entity){
        if(entity){
            var images = _.map(entity.images, function(imageId){
                return Image.findByIdAsync(imageId)
                .then(handleEntityNotFound(res));
            })
            return Promise.all(images);
        }else {
            return null;
        }
    }
}

function saveImageUpdates(file){
    return function(entity){
        let newPath = '/assets/uploads/' + path.basename(file.path);
        let updated = _.merge(entity, {
            imageUrl: newPath
        });

        return updated.saveAsync()
        .spread(function(updated){
            return updated;
        })
    }
}

function getVariants(res){
    return function(entity){
        if(entity){
            let variants = _.map(entity.variants, function(variantId){
                return Variant.findByIdAsync(variantId)
                .then(handleEntityNotFound(res));
            })
            return Promise.all(variants);
        }else {
            return null;
        }
    }
}

function linkVariantProduct(res, productId){
    return function(entity){
        let variant = entity;
        return Product.findByIdAsync(productId)
        .then(handleEntityNotFound(res))
        .then(function(entity){
            entity.variants.push(variant._id);
            return entity.saveAsync().spread(function(){
                return variant;
            })
        })
    }
}

function removeVariantId(variantId, variant){
    return function(entity){
        var variantIndex = entity.variants.indexOf(variantId);
        entity.variants.splice(variantIndex, 1);
        return entity.saveAsync()
        .then(function(){
            return variant;
        })
    }
}

function getReviews(res){
    return function(entity){
        if(entity){
            let reviews = _.map(entity.reviews, function(reviewId){
                return Review.findByIdAsync(reviewId)
                .then(handleEntityNotFound(res));
            })
            return Promise.all(reviews);
        }else {
            return null;
        }
    }
}

function linkReviewProduct(res, productId){
    return function(entity){
        let review = entity;
        return Product.findByIdAsync(productId)
        .then(handleEntityNotFound(res))
        .then(function(entity){
            entity.reviews.push(review._id);
            return entity.saveAsync().spread(function(){
                return review;
            })
        })
    }
}

function removeReviewId(reviewId, review){
    return function(entity){
        let reviewIndex = entity.reviews.indexOf(reviewId);
        entity.reviews.splice(reviewIndex, 1)
        return entity.saveAsync()
        .then(function(){
            return review;
        })
    }
}

exports.index = function(req,res){
    Product.find().sort({stock : 1}).populate({path : "categories", select: "name"}).execAsync()
    .then(responseWithResult(res))
    .catch(handleError(res));
}

exports.show = function(req,res){
    Product.findOne({slug: req.params.slug}).populate('images')
    .populate({path: 'reviews'}).populate({path: 'categories', select: 'slug'})
    .execAsync()
    .then(handleEntityNotFound(res))
    .then(function(entity){
        if(entity){
            res.status(200).json(entity);
        }
    })
    .catch(handleError(res));
}

exports.create = function(req,res){
    Product.createAsync(req.body)
    .then(responseWithResult(res, 201))
    .catch(handleError(res));
}

exports.update = function(req,res){
    if(req.body._id){
        delete req.body._id;
    }
    Product.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

exports.destroy = function(req,res){
    Product.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

exports.upload = function(req,res){
    var file = req.files.file;
    if(!file){
        return handleError(res)('File not provided');
    }
    Product.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveFeaturedImage(res, file))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

exports.catalog = function(req,res){
    var limit = req.params.limit;
    Catalog.findOne({slug: req.params.slug}).execAsync()
    .then(productsInCategory(limit))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

exports.search = function(req,res){
    let term = req.params.term;
    Catalog.findOne({slug: req.params.slug}).execAsync()
    .then(productInSearchCategory(term))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Images
exports.uploadImages = function(req,res){
    let file = req.files.file;
    if(!file){
        return handleError(res)('File not provided');
    }
    let newPath = '/assests/uploads/' + path.basename(file.path);
    Image.createAsync({
        imageUrl: newPath
    }).then(linkImageProduct(req,res, req.params.id))
    .then(responseWithResult(res,201))
    .catch(handleError(res));
}

exports.indexImage = function(req,res){
    Product.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(getImages(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

exports.updateImage = function(req,res){
    var file = req.files.file;
    if(!file){
        return handleError(res)('File Not provided');
    }
    Image.findByIdAsync(req.params.image_id)
        .then(handleEntityNotFound(res))
        .then(saveImageUpdates(file))
        .then(responseWithResult(res))
        .catch(handleError(res))
}

exports.createVariant = function(req,res){
    Variant.createAsync(req.body)
    .then(linkVariantProduct(res, req.params.id))
    .then(responseWithResult(res,201))
    .catch(handleError(res));
}

exports.indexVariant = function(req,res){
    Product.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(getVariants(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

exports.updateVariant = function(req,res){
    if(req.body._id){
        delete req.body._id;
    }
    Variant.findByIdAsync(req.params.variant_id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

exports.destroyVariant = function(req,res) {
    Variant.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(function(entity){
        let variant = entity;
        return Product.findByIdAsync(req.params.id)
        .then(handleEntityNotFound(res))
        .then(removeVariantId(req.params.variant_id, variant))
    })
    .then(removeEntity(res))
    .catch(handleError(res));
}
// Review
exports.createReview = function(req,res){
    Review.createAsync(req.body)
    .then(linkReviewProduct(res, req.params.id))
}

exports.indexReview = function(req,res){
    Product.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(getReviews(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

exports.updateReview = function(req,res){
    if(req.body._id){
        delete req.body._id;
    }
    Review.findByIdAsync(req.params.review_id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

exports.destroyReview = function(req,res){
    Review.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(function(entity){
        let review = entity;
        return Product.findByIdAsync(req.params.id)
        .then(handleEntityNotFound(res))
        .then(removeReviewId(req.params.review_id, review));
    })
    .then(removeEntity(res))
    .catch(handleError(res));
}