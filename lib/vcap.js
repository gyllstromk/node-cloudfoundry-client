var FormData     = require('form-data');

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

    // ~~~~~ PUBLIC

    var Collections = require('./collections');
    var collections = new Collections(request);

    this.apps = collections.create('apps', {
        name: { type: 'string' },
        space_guid: { type: 'string' },
    }, [ 'routes', 'summary', 'service_bindings' ]);

    this.services = collections.create('services', {
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

    this.servicePlans = collections.create('service_plans', {
        name: { type: 'string' },
        free: { type: 'bool' },
        description: { type: 'string' },
    });

    this.serviceInstances = collections.create('service_instances', {
        name: { type: 'string' },
        space_guid: { type: 'string' },
        service_plan_guid: { type: 'string' },
    });

    this.orgs = this.organizations = collections.create('organizations', {
        name: { type: 'string' }
    });

    this.spaces =     collections.create('spaces', {
        name: { type: 'string' },
        organization_guid: { type: 'string' }
    });

    this.routes = collections.create('routes');
    this.domains = collections.create('domains');
    this.runtimes = collections.create('runtimes');
    this.frameworks = collections.create('frameworks');
    this.events = collections.create('events');

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
//                 endpoint: getPath('apps', guid, 'bits'),
                method: 'PUT'
            }, callback);

            request.setHeader('Content-Length', length);
            request._form = form;
        });
    };

    this.apps.setRoute = function (appId, routeId, callback) {
        request({
//             endpoint: getPath('apps', appId, 'routes', routeId),
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
