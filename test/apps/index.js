var errors = require('../../lib/errors');

require('sugar');

var assert = require('assert');

describe('apps', function () {
    var client      = require('../client'),
        appName     = 'testapp';

    require('./nock');

    var app = {
        name: appName,
        staging: {
            model: 'node',
            stack: 'node0815'
        },

        uris: [
            appName + '.ourhost.com'
        ],

        resources: {
            memory: 64
        },

        instances: 1
    };

    it('get starts empty', function (done) {
        client.apps.get(function (err, apps) {
            assert(! err, err);
            assert.deepEqual(apps, []);
            done();
        });
    });

    it('get app fails', function (done) {
        client.apps.get(app.name, function (err, apps) {
            assert(err instanceof errors.NotFoundError);
            done();
        });
    });

    it('create app succeeds', function (done) {
        client.apps.create(app, function (err, app) {
            assert(! err, err);
            done();
        });
    });

    it('get app succeeds', function (done) {
        client.apps.get(app.name, function (err, app_) {
            assert(! err, err);
            app.runningInstances = 0;
            app.resources.disk = 2048;
            app.resources.fds = 256;
            app.state = 'STOPPED';
            app.services = [];
            app.env = [];

            assert.deepEqual(Object.reject(app_, 'version', 'meta'), app);
            done();
        });
    });

    it('delete app succeeds', function (done) {
        client.apps.delete(app.name, function (err, apps) {
            assert(! err, err);
            done();
        });
    });

    it('delete app again fails', function (done) {
        client.apps.delete(app, function (err) {
            assert(err instanceof errors.NotFoundError);
            done();
        });
    });

    it('get returns empty', function (done) {
        client.apps.get(function (err, apps) {
            assert(! err, err);
            assert.deepEqual(apps, []);
            done();
        });
    });
});
