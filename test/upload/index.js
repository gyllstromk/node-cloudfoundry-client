var errors = require('../../lib/errors');

var request = require('request');
require('sugar');

var assert = require('assert');

describe('upload', function () {
    var client      = require('../client'),
        appName     = 'testapp';

    var app = {
        name: appName,
        staging: {
            model: 'node',
            stack: 'node0815'
        },

        uris: [
            appName + '.' + client.host
        ],

        resources: {
            memory: 64
        },

        instances: 1
    };

    before(function () {
        require('./nock');
    });

    before(function (done) {
        client.apps.delete(app.name, function (err) {
            done(err instanceof errors.NotFoundError ? null : err);
        });
    });

    after(function (done) {
        client.apps.delete(app.name, done);
    });

    it('create app succeeds', function (done) {
        client.apps.create(app, function (err, app) {
            assert(! err, err);
            done();
        });
    });

    it('upload app succeeds', function (done) {
        var dir = './test/upload/version1.zip'; // do non-existent file
        client.apps.upload(app.name, dir, done);
    });

    it('restart app', function (done) {
        client.apps.restart(app.name, done);
    });

    it('query app', function (done) {
        setTimeout(function () {
            // wait for app to start
            request('http://' + app.uris[0], function (err, resp, body) {
                assert(! err, err);
                assert.equal(resp.statusCode, 200);
                done();
            });
        }, 1000);
    });

    it('upload version 2 succeeds', function (done) {
        var dir = './test/upload/version2.zip'; // do non-existent file
        client.apps.upload(app.name, dir, done);
    });

    it('restart app', function (done) {
        client.apps.restart(app.name, done);
    });

    it('query app', function (done) {
        setTimeout(function () {
            // wait for app to start
            request('http://' + app.uris[0], function (err, resp, body) {
                assert(! err, err);
                assert.equal(resp.statusCode, 202);
                done();
            });
        }, 1000);
    });
});

