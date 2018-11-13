import _ from 'lodash';
let Request = require('./request.model');

function handleError(res, statusCode){
    statusCode = statusCode || 500;
    return function(err){
        res.status(statusCode).send(err);
    }
}

function responseWithResult(res, statusCode){
    statusCode = statusCode || 200;
    return function(entity){
        if(entity){
            res.status(statusCode).json(entity);
        };
    };
}

function handleEntityNotFound(res){
    return function(entity){
        if(!entity){
            res.status(404).end();
            return null;
        }
        return entity;
    }
}

function saveUpdates(updates){
    return function(entity){
        var updates = _.merge(entity, updates);
        return updated.saveAync()
            .spread(updated => {
                return updated;
            })
    }
}

function removeEntity(res){
    return function(entity){
        if(entity){
            return entity.removeAsync()
            .then(()=>{
                res.status(204).end()
            });
        }
    }
}

export function index(req,res){
    Request.findAsync()
        .then(responseWithResult(res))
        .catch(handleError(res));
}

export function myRequests(req,res){
    Request.findAsync({customerId: req.params.Id})
        .then(responseWithResult(res))
        .catch(handleError(res));
}

export function show(req,res){
    Request.findByIdAsync(req.params.id)
        .then(handleEntityNotFound(res))
        .then(responseWithResult(res))
        .catch(handleError(res));
}

export function create(req,res){
    Request.createAsync(req.body)
        .then(responseWithResult(res, 201))
        .catch(handleError(res));
}

export function update(req, res){
    if(req.body._id){
        delete req.body._id
    }
    Request.findByIdAsync(req.params.id)
        .then(handleEntityNotFound(res))
        .then(saveUpdates(req.body))
        .then(responseWithResult(res))
        .catch(handleError(res));
}

export function destroy(req,res){
    Request.findByIdAsync(req.params.id)
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}