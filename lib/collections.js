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

        this.put = function (innerId, callback) {
            request({
                endpoint: getPath(parentCollection, id, collection, innerId),
                method: 'PUT',
            }, function (err, result) {
                callback(err, result && (result.resources || result));
            });
        };
    };

    var Collection = function (collection, schema, innerCollections) {
        /**
         * Collection manages interaction with RESTful collection on
         * cloudfoundry, such as orgs, apps, services, spaces, etc
         */

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

        this.get = function (query, callback) {
            var plural = (typeof query === 'function');

            if (! callback && ! plural) {
                /**
                 * Client is using shortcut on the get. I.e. they
                 * are using a form like:
                 *
                 *   collection.get(id).subCollection(...);
                 */

                return makeObject(query);
            }

            if (plural) {
                callback = query;
                query = null;
            }

            var finished = false,
                results  = [];
            
            var requestObject = {
                endpoint: getPath(collection, query),
                page:     plural ? 1 : null,
                method:   'GET',
            };
           
            if (query && typeof query === 'object') {
                requestObject.endpoint = getPath(collection);
                var qs = '';
                Object.keys(query, function (key, value) {
                    // this won't scale to multiple keys, but it is unclear
                    // from CF doc whether such queries are even possible
                    qs += key + ':' + value;
                });

                requestObject.qs = { q: qs };
            }

            async.until(function () {
                return finished;
            }, function (callback) {
                request(requestObject, function (err, result) {
                    if (err) {
                        return callback(err);
                    }

                    finished = ! result.next_url;
                    requestObject.page += 1;

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
            this.get({ name: name }, callback);
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
                object.qs = { recursive: true };
            }

            request(object, callback);
        };
    };

    this.create = function (collection, schema, innerCollections) {
        return new Collection(collection, schema, innerCollections);
    };
};
