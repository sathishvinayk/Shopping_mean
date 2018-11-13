'use strict'

import _ from 'lodash';
let Order = require('./order.model');
let Product = require('../product/product.model').product;

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

function saveUpdates(updates){
    return function(entity){
        var updated = _.merge(entity, updates);
        return updated.saveAsync()
        .spread(updated =>{
            return updated;
        });
    };
}

function removeEntity(res) {
    return function(entity) {
      if (entity) {
        return entity.removeAsync()
          .then(() => {
            res.status(204).end();
          });
      }
    };
}

export function index(req,res){
    Order.findAsync()
        .then(responseWithResult(res))
        .catch(handleError(res))
}

export function myOrders(req,res){
    Order.findAsync({customerId: req.params.id})
        .then(responseWithResult(res))
        .catch(handleError(res));
}

export function show(req,res){
    Order.findByIdAsync(req.params.id)
        .then(handleEntityNotFound(res))
        .then(responseWithResult(res))
        .catch(handleError(res));
}

export function create(req,res){
    Order.createAsync(req.body)
    .then(entity => {
        if(entity){
            _.each(entity.items, function(i){
                Product.findByIdAsync(i.productId)
                .then(function(product){
                    product.stock -= i.quantity;
                    product.saveAsync()
                });
            })
            res.status(201).json(entity)
        }
    })
    .catch(handleError(res));
}

export function update(req,res){
    if(req.body._id){
        delete req.body._id;
    }
    Order.findByIdAsync(req.params.id)
        .then(handleEntityNotFound(res))
        .then(saveUpdates(req.body))
        .then(responseWithResult(res))
        .catch(handleError(res));
}

export function destroy(req,res){
    Order.findByIdAsync(req.params.id)   
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}