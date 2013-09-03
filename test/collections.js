var Collections = require('../lib/collections');

var EventEmitter = require('events').EventEmitter,
    assert       = require('assert');

describe('collections', function () {
    var requests = new EventEmitter();

    var request = function (object, callback) {
        requests.emit('request', object);
        requestCallback(object, callback);
    };

    var requestCallback,
        collectionName = 'collection',
        factory    = new Collections(request),
        collection = factory.create(collectionName, {}, [ 'inner1', 'inner2' ]);

    it('get multiple', function (done) {
        requests.once('request', function (object) {
            assert.deepEqual(object, {
                endpoint: collectionName,
                page: 1,
                method: 'GET'
            });

            done();
        });

        requestCallback = function (object, callback) {
            callback(null, [{ metadata: { guid: 1 }}]);
        };

        collection.get(function (err, result) {
            assert(! err, err);
            assert.deepEqual(Object.select(result[0], 'metadata'), { metadata:
                { guid: 1 }});
        });
    });
});
