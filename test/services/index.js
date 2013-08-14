var errors = require('../../lib/errors');

require('sugar');

var assert = require('assert');

describe('services', function () {
    var client      = require('../client'),
        serviceName = 'test';

    require('./nock');

    var service_ = {
        name: serviceName,
        type: 'document',
        vendor: 'mongodb',
        provider: 'core',
        version: '2.4',
        tier: 'free',
        properties: {},
        meta: {
            tags: [ 'nosql', 'document' ],
            version: 1
        }
    };

    var clean = function (service) {
        /**
         * Removes timestamp info from service for comparisons.
         */

        service.meta = Object.select(service.meta, 'tags', 'version');
        return service;
    };

    it('get starts empty', function (done) {
        client.services.get(function (err, services) {
            assert(! err, err);
            assert.deepEqual(services, []);
            done();
        });
    });

    it('get service by name is error', function (done) {
        client.services.get(serviceName, function (err, services) {
            assert(err instanceof errors.NotFoundError);
            done();
        });
    });

    it('create service succeeds', function (done) {
        client.services.create(serviceName, 'mongodb', '2.4', 'free',
            function (err) {

            assert(! err, err);
            done();
        });
    });

    it('get service by name returns service', function (done) {
        client.services.get(serviceName, function (err, service) {
            assert(! err, err);

            assert.deepEqual(clean(service), service_);
            done();
        });
    });

    it('get services includes new service', function (done) {
        client.services.get(function (err, services) {
            assert(! err, err);
            assert.deepEqual(services.map(clean), [ service_ ]);
            done();
        });
    });

    it('delete service', function (done) {
        client.services.delete(serviceName, function (err) {
            assert(! err, err);
            done();
        });
    });

    it('delete non-existent service fails', function (done) {
        client.services.delete(serviceName, function (err) {
            assert(err instanceof errors.NotFoundError);
            done();
        });
    });

    it('get returns empty', function (done) {
        client.services.get(function (err, services) {
            assert(! err, err);
            assert.deepEqual(services, []);
            done();
        });
    });

    it('get service by name is error', function (done) {
        client.services.get(serviceName, function (err, services) {
            assert(err instanceof errors.NotFoundError);
            done();
        });
    });
});
