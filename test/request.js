var EventEmitter = require('events').EventEmitter,
    assert       = require('assert');

describe('request', function () {
    var mockery,
        factory,
        request;

    var requestCallback,
        requests = new EventEmitter();

    before(function () {
        mockery = require('mockery');
        mockery.enable({ useCleanCache: true, warnOnUnregistered: false });
        mockery.registerMock('request', function (obj, callback) {
            requests.emit('request', obj);
            requestCallback(obj, callback);
        });
        factory = require('../lib/request');
        request = factory('http:', 'localhost', '111', 'a@g.com', 'yyy');
    });

    after(function () {
        mockery.disable();
    });

    var getRequestParams = function (obj, callback) {
        requests.once('request', callback);
        request(obj, function () {});
    };

    describe('simple request', function () {
        var request_;

        requestCallback = function (obj, callback) {
            callback(null, { statusCode: 200 });
        };

        it('does not alter request object', function (done) {
            var obj = {
                endpoint: 'collection',
            };

            getRequestParams(obj, function (request) {
                request_ = request;
                assert(obj.endpoint);
                assert(! obj.url);
                done();
            });
        });

        it('endpoint converted to url', function () {
            assert.equal(request_.url, 'http://localhost/v2/collection');
            assert(! request_.endpoint);
        });

        it('auth header populated with token', function () {
            assert.deepEqual(request_.headers, {
                Authorization: 'bearer 111'
            });
        });

        it('default json populated', function () {
            assert.equal(request_.json, true);
        });

        it('query not set', function () {
            assert(! request_.query);
        });
    });

    describe('request with json and paging', function () {
        var request_;

        before(function (done) {
            getRequestParams({
                endpoint: 'collection/1/2',
                page: 2,
                json: { field: 'value' }
            }, function (request) {
                request_ = request;
                done();
            });
        });

        it('endpoint converted to url', function () {
            assert.equal(request_.url, 'http://localhost/v2/collection/1/2');
            assert(! request_.endpoint);
        });

        it('json populated', function () {
            assert.deepEqual(request_.json, { field: 'value' });
        });

        it('page set', function () {
            assert.deepEqual(request_.qs, { page: 2 });
            assert(! request_.page);
        });
    });

    describe('request with with failure', function () {
        it('fails when statusCode !== 2xx', function (done) {
            var error = {
                body: '400 error',
                statusCode: 400
            };

            requestCallback = function (obj, callback) {
                callback(null, error, 'error');
            };

            request({}, function (err) {
                assert.equal(err.message, error.body);
                assert.equal(err.statusCode, error.statusCode);
                done();
            });
        });
    });
});
