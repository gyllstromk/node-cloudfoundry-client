var errors = require('./errors');

var request      = require('request'),
    FormData     = require('form-data'),
    createSchema = require('json-gate').createSchema;

require('sugar');

var url     = require('url');

var VcapClient = module.exports = function (info, callback) {
    /**
     * VCAP cloudfoundry client.
     *
     * Parameters
     *
     * - info: object containing the following
     *   - host (required): host of CF deployment
     *   - one of either:
     *     - token (access token)
     *     - email,password (two separate fields)
     */

    // ~~~~~ PRIVATE
    var self = this,
        token = info.token;

    if (! info.host) {
        return new TypeError('host must be provided');
    }

    if (! token) {
        throw new TypeError('no token provided');
    }

    var isSuccess = function (code) {
        return (code - (code % 200)) === 200;
    };

    var getPath = function () {
        var path = [].slice.call(arguments).filter(function (each) {
            return each;
        }).join('/');

        return url.format({
            protocol: 'http:',
            hostname: info.host,
            pathname: 'v2/' + path
        });
    };

    var makeRequest = function (uri, method, json, callback) {
        if (typeof json === 'function') {
            callback = json;
            json = true;
        }

        var options = {
            uri: uri,
            method: method,
            json: json
        };

        if (token) {
            options.headers = {
                Authorization: token
            };
        }

        return request(options, function (err, resp, body) {
            if (err) {
                return callback(err);
            }

            if (isSuccess(resp.statusCode)) {
                return callback(null, body);
            }

            return callback(errors.get(resp));
        });
    };

    var authedRequest = function (uri, method, json, callback) {
        if (token) {
            return makeRequest(uri, method, json, callback);
        }

        login(function (err) {
            if (err) {
                callback(err);
                return;
            }

            return makeRequest(uri, method, json, callback);
        });
    };

    var login = function (callback) {
        makeRequest(getPath('users', info.email, 'tokens'), 'POST', { password:
            info.password }, function (err, result) {
            if (err) {
                return callback(err);
            }

            token = result.token;
            callback();
        });
    };

    var plural = function (callback) {
        return function (err, res) {
            return callback(err, res && res.resources);
        };
    };

    var InnerCollection = function (id, collection, parent, schema) {
        this.get = function (innerCollection, callback) {
            authedRequest(getPath(collection, id, innerCollection), 'GET',
                    true, plural(callback));
        };
    };

    var Collection = function (collection, schema) {
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
                return new InnerCollection(id, collection, this, schema);
            }

            if (plural) {
                callback = id;
                id = null;
            }

            authedRequest(getPath(collection, id), 'GET', true,
                function (err, result) {

                if (err) {
                    return callback(err);
                }

                callback(null, plural ? result.resources : result);
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

            authedRequest(getPath(collection), 'POST', body, callback);
        };

//         this.update = function (body, callback) {
//             authedRequest(getPath(collection, body[idField]), 'PUT', body,
//                     callback);
//         };

        this.delete = function (id, callback) {
            authedRequest(getPath(collection, id), 'DELETE', true, callback);
        };
    };

    // ~~~~~ PUBLIC

    this.apps = new Collection('apps', {
        name: { type: 'string' },
        space_guid: { type: 'string' },
    });

    this.services =   new Collection('services', {
        label: { type: 'string' },
        url: { type: 'string' },
        provider: { type: 'string' },
        version: { type: 'string' },
        description: { type: 'string' },
    });

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

    this.orgs =       new Collection('organizations');
    this.spaces =     new Collection('spaces', {
        name: { type: 'string' },
        organization_guid: { type: 'string' }
    });
    this.runtimes =   new Collection('runtimes');
    this.frameworks = new Collection('frameworks');
    this.events = new Collection('events');

    // ~ applications
    var setAppState = function (name, state, callback) {
        self.apps.get(name, function (err, app) {
            if (err) {
                return callback(err);
            }

            if (app.state === state) {
                return callback();
            }

            app.state = state;
            self.apps.update(app, callback);
        });
    };

    this.apps.upload = function (guid, zipFile, callback) {
        var fileStream = typeof zipFile === 'string' ?
            require('fs').createReadStream(zipFile) :
            zipFile;

        var form = new FormData();
        form.append('application', fileStream);
        form.append('_method', 'put');
        form.append('resources', '[]');

        form.getLength(function (err, length) {
            if (err) {
                return callback(err);
            }

            var request = authedRequest(getPath('apps', guid,
                    'bits'), 'PUT', true, callback);

            request.setHeader('Content-Length', length);
            request._form = form;
        });
    };

    this.apps.restart = function (name, callback) {
        var self = this;
        this.stop(name, function (err) {
            if (err) {
                return callback(err);
            }

            self.start(name, callback);
        });
    };

    this.apps.stop = function (name, callback) {
        setAppState(name, 'STOPPED', callback);
    };

    this.apps.start = function (name, callback) {
        setAppState(name, 'STARTED', callback);
    };

    if (callback) {
        login(callback);
    }
};
