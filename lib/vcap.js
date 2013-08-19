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

    var self = this,
        token = info.token;

    if (! info.host) {
        return new TypeError('host must be provided');
    }

    if (! token) {
        if (! info.email || ! info.password) {
            var error =
                new TypeError('info must include host, email, and password');

            if (callback) {
                return callback(error);
            }

            throw error;
        }
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

    var Collection = function (idField, collection, schema) {
        schema = schema && createSchema(schema);

        this.get = function (id, callback) {
            var plural = typeof id === 'function';

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

        this.create = function (body, callback) {
            if (schema) {
                try {
                    schema.validate(body);
                } catch (err) {
                    return callback(err);
                }
            }

                self.start(name, callback);
            });
        },

        stop: function (name, callback) {
            setAppState(name, 'STOPPED', callback);
        },

        start: function (name, callback) {
            setAppState(name, 'STARTED', callback);
        },

        delete: function (name, callback) {
            authedRequest(getPath('apps', name), 'DELETE', true, callback);
        },
    };

    this.services = {
        get: function (name, callback) {
            if (typeof name === 'function') {
                callback = name;
                name = null;
            }

            authedRequest(getPath('services', name), 'GET', callback);
        },

        create: function (name, vendor, version, tier, callback) {
            authedRequest(getPath('services'), 'POST', {
                name:    name,
                vendor:  vendor,
                version: version,
                tier:    tier
            }, callback);
        },

        delete: function (name, callback) {
            authedRequest(getPath('services', name), 'DELETE', callback);
        }
    };

    if (callback) {
        login(callback);
    }
};
