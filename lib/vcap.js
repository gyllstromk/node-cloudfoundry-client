var errors       = require('./errors'),
    url          = require('./url');

var FormData     = require('form-data'),
    createSchema = require('json-gate').createSchema,
    async        = require('async');

require('sugar');

var url          = require('url'),
    util         = require('util');

var VcapClient = module.exports = function (info, callback) {
    /**
     * VCAP cloudfoundry client.
     *
     * Parameters
     *
     * - info: object containing the following
     *   - host (required): host of CF deployment
     *   - protocol: http: vs https:
     *   - one of either:
     *     - token (access token)
     *     - email,password (two separate fields)
     */

    // ~~~~~ PRIVATE
    var self = this;

    if (! info.host) {
        return new TypeError('host must be provided');
    }

    var request = require('./request')(info.protocol || 'http:', info.host,
            info.token, info.email, info.password);

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
            var gettable = {};

            if (typeof id === 'object') {
                Object.merge(gettable, id);
                id = id.metadata.guid;
            }

            (innerCollections || []).each(function (each) {
                gettable[each.camelize(false)] =
                    new InnerCollection(collection, id, each);
            });

            console.log(gettable);

            return gettable;
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
                page     = 1,
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

        this.delete = function (id, callback) {
            request({
                endpoint: getPath(collection, id),
                method: 'DELETE'
            }, callback);
        };
    };

    // ~~~~~ PUBLIC

    this.apps = new Collection('apps', {
        name: { type: 'string' },
        space_guid: { type: 'string' },
    }, [ 'routes', 'summary', 'service_bindings' ]);

    this.services = new Collection('services', {
        label: { type: 'string' },
        url: { type: 'string' },
        provider: { type: 'string' },
        version: { type: 'string' },
        description: { type: 'string' },
    });

    this.services.getByName = function (name, callback) {
        this.getBy(function (each) {
            return each.entity.label === name;
        }, callback);
    };

    this.services.getPlanForServiceByName = function (name, callback) {
        var self = this;

        this.getByName(name, function (err, service) {
            if (err) {
                return callback(err);
            }

            self.get(service.metadata.guid).get('service_plans', callback);
        });
    };

    this.servicePlans = new Collection('service_plans', {
        name: { type: 'string' },
        free: { type: 'bool' },
        description: { type: 'string' },
    });

    this.serviceInstances = new Collection('service_instances', {
        name: { type: 'string' },
        space_guid: { type: 'string' },
        service_plan_guid: { type: 'string' },
    });

    this.orgs = this.organizations = new Collection('organizations', {
        name: { type: 'string' }
    });

    this.spaces =     new Collection('spaces', {
        name: { type: 'string' },
        organization_guid: { type: 'string' }
    });

    this.routes = new Collection('routes');
    this.domains = new Collection('domains');
    this.runtimes = new Collection('runtimes');
    this.frameworks = new Collection('frameworks');
    this.events = new Collection('events');

    // ~ applications

    this.apps.upload = function (guid, zipFile, callback) {
        var fileStream = typeof zipFile === 'string' ?
            require('fs').createReadStream(zipFile) :
            zipFile;

        var form = new FormData();
        form.append('application', fileStream,
                { contentType: 'application/zip' });

        form.append('resources', '[]');

        form.getLength(function (err, length) {
            if (err) {
                return callback(err);
            }

            var request = request({
                endpoint: getPath('apps', guid, 'bits'),
                method: 'PUT'
            }, callback);

            request.setHeader('Content-Length', length);
            request._form = form;
        });
    };

    this.apps.setRoute = function (appId, routeId, callback) {
        request({
            endpoint: getPath('apps', appId, 'routes', routeId),
            method: 'PUT'
        }, callback);
    };

    this.apps.restart = function (id, callback) {
        var self = this;
        this.stop(id, function (err) {
            if (err) {
                return callback(err);
            }

            self.start(id, callback);
        });
    };

    this.apps.stop = function (id, callback) {
        self.apps.update(id, { state: 'STOPPED' }, callback);
    };

    this.apps.start = function (id, callback) {
        self.apps.update(id, { state: 'STARTED' }, callback);
    };
};
