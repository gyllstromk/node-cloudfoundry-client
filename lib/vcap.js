var errors       = require('./errors'),
    url          = require('./url');

var request      = require('request'),
    FormData     = require('form-data'),
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
    var self = this,
        token = info.token,
        protocol = info.protocol || 'http:';

    if (! info.host) {
        return new TypeError('host must be provided');
    }


    var isSuccess = function (code) {
        return (code - (code % 200)) === 200;
    };

    var getPath = function () {
        var path = [].slice.call(arguments).filter(function (each) {
            return each;
        }).join('/');

        return url.format({
            protocol: protocol,
            hostname: info.host,
            pathname: 'v2/' + path
        });
    };

    var makeRequest = function (uri, page, method, json, callback) {
        if (typeof json === 'function') {
            callback = json;
            json = true;
        }

        if (page) {
            uri += '?page=' + page;
        }

        var options = {
            uri: uri,
            method: method,
        };

        if (json) {
            if ([ 'object', 'boolean' ].any(typeof json)) {
                options.json = json;
            } else {
                options.body = json;
            }
        }

        if (token) {
            options.headers = {
                Authorization: 'bearer ' + token
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

    var authedRequest = function (uri, page, method, json, callback) {
        var loginAndRequest = function () {
            login(function (err) {
                if (err) {
                    callback(err);
                    return;
                }

                return makeRequest(uri, null, method, json, callback);
            });
        };

        if (token) {
            return makeRequest(uri, page, method, json,
                function (err, callback) {

                if (! err instanceof errors.AuthorizationError) {
                    return callback(err);
                }

                loginAndRequest();
            });
        }

        loginAndRequest();
    };

    var login = function (callback) {
        request({
            url: url.toUaa(protocol + '//' + info.host) + 'oauth/token',
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded;' +
                                'charset=utf-8',
                accept: 'application/json;charset=utf-8',
                authorization: 'Basic Y2Y6'
            },
            body: util.format('grant_type=password&username=%s&password=%s',
                      info.email, info.password)
        }, function (err, resp, body) {
            if (err) {
                return callback(err);
            }

            try {
                body = JSON.parse(body);
            } catch (err) {
                return callback(err);
            }

            token = body.access_token;
            callback();
        });
    };

    var InnerCollection = function (id, collection, parent, schema) {
        this.get = function (innerCollection, callback) {
            authedRequest(getPath(collection, id, innerCollection), null, 'GET',
                    true, function (err, result) {

                callback(err, result && (result.resources || result));
            });
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

            var finished = false,
                page     = 1,
                results  = [];

            async.until(function () {
                return finished;
            }, function (callback) {
                authedRequest(getPath(collection, id), page, 'GET', true,
                    function (err, result) {

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

            authedRequest(getPath(collection), null, 'POST', body, callback);
        };

        this.update = function (id, body, callback) {
            authedRequest(getPath(collection, id), null, 'PUT', body, callback);
        };

        this.delete = function (id, callback) {
            authedRequest(getPath(collection, id), null, 'DELETE', true,
                    callback);
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

            var request = authedRequest(getPath('apps', guid,
                    'bits'), null, 'PUT', true, callback);

            request.setHeader('Content-Length', length);
            request._form = form;
        });
    };

    this.apps.setRoute = function (appId, routeId, callback) {
        authedRequest(getPath('apps', appId, 'routes', routeId), null, 'PUT',
                true, callback);
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

    if (callback) {
        login(callback);
    }
};
