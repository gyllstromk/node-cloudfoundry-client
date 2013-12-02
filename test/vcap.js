var assert = require('assert'),
    fs     = require('fs');

describe('vcap client', function () {
    /**
     * Much of the client behavior is tested via the collections tests. Here we
     * isolate the calls which are exceptional to the collection mode.
     */

    var mockery,
        VcapClient;

    var client,
        _request;

    before(function () {
        mockery = require('mockery');
        mockery.enable({ useCleanCache: true, warnOnUnregistered: false });

        mockery.registerMock('request', function (obj, callback) {
            return _request(obj, callback);
        });
    });

    after(function () {
        mockery.disable();
    });

    it('upload', function (done) {
        /**
         * Ensures:
         *
         * 1. correct request is made (e.g. url, auth header);
         * 2. that file is attached to form and content length is set
         */

        var guid = 1,
            host = 'host',
            token = 'token';

        VcapClient = require('../lib/vcap');

        client = new VcapClient({ host: host, token: token });

        _request = function (obj, callback) {
            assert.deepEqual(obj, {
                method: 'PUT',
                headers: {
                    Authorization: 'bearer ' + token
                },
                url: 'http://' + host + '/v2/apps/' + guid + '/bits',
                json: true
            });

            process.nextTick(function () {
                callback(null, { statusCode: 200 });
            });

            return {
                setHeader: function (header, length) {
                    assert.equal(header, 'Content-Length');
                    assert(length);
                    var self = this;
                    process.nextTick(function () {
                        assert(self._form); // form was set
                        done();
                    });
                }
            };
        };


        client.apps.upload(guid, fs.createReadStream('package.json'),
            function (err) {

            assert(! err, err);
        });
    });

    it('app logs', function (done) {
        _request = function (obj, callback) {
            assert.deepEqual(obj, {
                method:  'GET',
                headers: {
                    Authorization: 'bearer token'
                },
                url:     'http://host/v2/apps/a/instances/0/files/logs',
                json:    true
            });

            callback(null, { statusCode: 200 });
        };

        client.apps.get('a').instances.get(0).logs.get(function (err, logs) {
            assert(! err, err);
            done();
        });
    });
});
