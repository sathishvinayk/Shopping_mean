'use strict'

let _ = require('lodash');
let Catalog = require('./catalog.model');

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
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
    }};
}

exports.index = function(req,res){
    Catalog.find().sort({parent: 1}).populate('parent').execAsync()
        .then(responseWithResult(res))
        .catch(handleError(res));
}

exports.show = function(req,res){
    Catalog.findOne({slug: req.params.slug}).populate('children').execAsync()
        .then(handleEntityNotFound(res))
        .then(responseWithResult(res))
        .catch(handleError(res));
}

exports.create = function(req,res){
    Catalog.findByIdAsync(req.body.parent)
        .then(function(parent){
            console.log(parent)
            if(parent){
                delete req.body.parent;
                return parent.addChild(req.body)
            }
            return Catalog.createAsync(req.body)
        })
        .then(responseWithResult(res))
        .catch(handleError(res))
};

exports.update = function(req,res){
    if(req.body._id){
        delete req.body._id;
    }
    Catalog.findByIdAsync(req.params.id)
        .then(handleEntityNotFound(res))
        .then(saveUpdates(req.body))
        .then(responseWithResult(res))
        .catch(handleError(res));
}

exports.destroy = function(req,res){
    Catalog.findByIdAsync(req.params.id)
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res))
}