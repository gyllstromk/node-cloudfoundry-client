var errors       = require('./errors');

var createSchema = require('json-gate').createSchema,
    async        = require('async');

require('sugar');

var factory = module.exports = function (request) {
    var getPath = function () {
        return [].slice.call(arguments).filter(function (each) {
            return each;
        }).join('/');
    };

    var InnerCollection = function (parentCollection, id, collection) {
        this.get = function (callback) {
            request({
                endpoint: getPath(parentCollection, id, collection),
                method: 'GET'
            }, function (err, result) {
                callback(err, result && (result.resources || result));
            });
        };

        this.put = function (object, callback) {
            request({
                endpoint: getPath(parentCollection, id, collection),
                method: 'PUT',
                json: object
            }, function (err, result) {
                callback(err, result && (result.resources || result));
            });
        };
    };

    var Collection = function (collection, schema, innerCollections) {
        var makeObject = function (id) {
            var obj = {};

            if (typeof id === 'object') {
                Object.merge(obj, id);
                id = id.metadata.guid;
            }

            (innerCollections || []).each(function (each) {
                obj[each.camelize(false)] =
                    new InnerCollection(collection, id, each);
            });

            return obj;
        };

        if (schema) {
            Object.values(schema, function (value) {
                value.required = true;
            });
            schema = {
                properties: schema
            };

            schema = schema && createSchema(schema);
        }

        this.get = function (id, callback) {
            var plural = typeof id === 'function';

            if (! callback && ! plural) {
                return makeObject(id);
            }

            if (plural) {
                callback = id;
                id = null;
            }

            var finished = false,
                page     = plural ? 1 : null,
                results  = [];

            async.until(function () {
                return finished;
            }, function (callback) {
                request({
                    endpoint: getPath(collection, id),
                    page: page,
                    method: 'GET'
                }, function (err, result) {
                    if (err) {
                        return callback(err);
                    }

                    finished = ! result.next_url;
                    page += 1;

                    results.add(result.resources || result);

                    callback();
                });
            }, function (err) {
                if (err) {
                    return callback(err);
                }

                results = results.map(makeObject);

                callback(null, plural ? results : results[0]);
            });
        };

        this.getBy = function (query, callback) {
            this.get(function (err, result) {

                if (err) {
                    return callback(err);
                }

                var match = result.find(query);

                callback(match ? null : new errors.NotFoundError(query), match);
            });
        };

        this.getByName = function (name, callback) {
            this.getBy(function (each) {
                return each.entity.name === name;
            }, callback);
        };

        this.create = function (body, callback) {
            if (schema) {
                try {
                    schema.validate(body);
                } catch (err) {
                    return callback(err);
                }
            }

            request({
                endpoint: getPath(collection),
                method: 'POST',
                json: body
            }, callback);
        };

        this.update = function (id, body, callback) {
            request({
                endpoint: getPath(collection, id),
                method: 'PUT',
                json: body
            }, callback);
        };

        this.delete = function (id, recursive, callback) {
            if (typeof recursive === 'function') {
                callback = recursive;
                recursive = false;
            }

            var object = {
                endpoint: getPath(collection, id),
                method: 'DELETE',
            };

            if (recursive) {
                object.query = { recursive: true };
            }

            request(object, callback);
        };
    };

    this.create = function (collection, schema, innerCollections) {
        return new Collection(collection, schema, innerCollections);
    };
};
