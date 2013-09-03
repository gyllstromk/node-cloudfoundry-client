var assert = require('assert'),
    fs     = require('fs');

describe('vcap client', function () {
    var mockery,
        VcapClient;

    var client;

    before(function () {
        mockery = require('mockery');
        mockery.enable({ useCleanCache: true, warnOnUnregistered: false });
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

        mockery.registerMock('request', function (obj, callback) {
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
        });

        VcapClient = require('../lib/vcap');

        client = new VcapClient({ host: host, token: token });

        client.apps.upload(guid, fs.createReadStream('package.json'),
            function (err) {

            assert(! err, err);
        });
    });
});
