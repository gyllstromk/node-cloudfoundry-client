var Collections = require('../lib/collections');

var EventEmitter = require('events').EventEmitter,
    assert       = require('assert');

describe('collections', function () {
    var requests = new EventEmitter();

    var request = function (object, callback) {
        requests.emit('request', object);
        requestCallback(object, callback);
    };

    var makeObject = function (guid) {
        return { metadata: { guid: guid }};
    };

    var object = makeObject(1);

    var requestCallback,
        collectionName = 'collection',
        factory    = new Collections(request),
        collection = factory.create(collectionName,
            { name: { type: 'string' }}, [ 'inner1', 'inner2' ]);

    describe('get', function () {
        it('get multiple', function (done) {
            requests.once('request', function (object) {
                assert.deepEqual(object, {
                    endpoint: collectionName,
                    page:     1,
                    method:   'GET'
                });

                done();
            });

            requestCallback = function (object_, callback) {
                callback(null, [ object ]);
            };

            collection.get(function (err, result) {
                assert(! err, err);
                assert.deepEqual(Object.select(result[0], 'metadata'), object);
            });
        });

        it('get by query', function (done) {
            requests.once('request', function (object) {
                assert.deepEqual(object, {
                    endpoint: collectionName,
                    page:     1,
                    method:   'GET',
                    qs:       { q: 'name:the_name;organization_guid:org_guid' }
                });

                done();
            });

            requestCallback = function (object_, callback) {
                callback(null, [ object ]);
            };

            collection.get({ name: 'the_name', organization_guid: 'org_guid' },
                function (err, result) {

                assert(! err, err);
                assert.deepEqual(Object.select(result[0], 'metadata'), object);
            });
        });

        describe('single', function () {
            var result;

            requestCallback = function (object_, callback) {
                callback(null, object);
            };

            it('get', function (done) {
                requests.once('request', function (object) {
                    assert.deepEqual(object, {
                        endpoint: collectionName + '/1',
                        page:     null,
                        method:   'GET'
                    });

                    done();
                });

                collection.get(1, function (err, result_) {
                    assert(! err, err);
                    result = result_;
                    assert.deepEqual(Object.select(result, 'metadata'), object);
                });
            });

            it('get only uses metadata.guid if provided', function (done) {
                // if metadata.guid not provided, previously it would fail
                assert.equal(collection.get({ title: '1' }).title, '1');
                done();
            });

            it('object has inner1.get methods', function (done) {
                requests.once('request', function (object) {
                    assert.deepEqual(object, {
                        endpoint: collectionName + '/1/inner1',
                        method:   'GET'
                    });

                    done();
                });

                result.inner1.get(function (err, results) {
                    assert(! err, err);
                });
            });

            it('object has inner1.put methods', function (done) {
                requests.once('request', function (object) {
                    assert.deepEqual(object, {
                        endpoint: collectionName + '/1/inner1/value',
                        method:   'PUT',
                    });

                    done();
                });

                result.inner1.put('value', function (err, results) {
                    assert(! err, err);
                });
            });
        });
    });

    describe('create', function () {
        it('fails on invalid schema', function (done) {
            collection.create({ name: 1 }, function (err, result_) {
                assert(err);
                assert(/'name' is an integer when it should be a string/
                    .exec(err.message));
                done();
            });
        });

        it('with valid object', function (done) {
            var obj = { name: '1' };

            requests.once('request', function (object) {
                assert.deepEqual(object, {
                    endpoint: collectionName,
                    method:   'POST',
                    json:     obj
                });

                done();
            });

            collection.create(obj, function (err, result_) {
                assert(! err, err);
            });
        });
    });

    describe('delete', function () {
        it('with query', function (done) {
            requests.once('request', function (object) {
                assert.deepEqual(object, {
                    endpoint: collectionName + '/1',
                    method:   'DELETE',
                    qs:       { recursive: true }
                });

                done();
            });

            collection.delete(1, true, function (err, result_) {
                assert(! err, err);
            });
        });
    });

    describe('complex inner collection', function () {
        before(function () {
            collection = factory.create(collectionName, {
                name: { type: 'string' }
            }, [
                    'inner1',
                    {
                        method: 'inner2',
                        nested: [{
                            method: 'inner2inner2'
                        }],

                        resultsMap: function (results) {
                            results.each(function (each, index) {
                                each.fake = index;
                            });

                            return results;
                        }
                    }
                ]
            );
        });

        it('get complex inner', function (done) {
            requests.once('request', function (object) {
                assert.deepEqual(object, {
                    endpoint: 'collection/0/inner2',
                    page: 1,
                    method: 'GET'
                });

                done();
            });

            collection.get(0).inner2.get(function (err, results) {
                assert(! err, err);
                assert.equal(results[0].fake, 0); // proves resultsMap was
                                                  // executed
            });
        });
    });

    describe('paging', function () {
        it('pages when result has next_url', function (done) {
            var iteration = 0;

            requestCallback = function (object_, callback) {
                iteration += 1;

                assert.deepEqual(object_, {
                    endpoint: 'collection',
                    page:     iteration,
                    method:   'GET'
                });

                var response = { resources: [ makeObject(iteration) ] };

                if (iteration < 5) {
                    response.next_url = 'x';
                }

                callback(null, response);
            };

            collection.get(function (err, results) {
                assert(! err, err);
                assert.deepEqual(results.map(function (each) {
                    return each.metadata.guid;
                }), [ 1, 2, 3, 4, 5 ]);
                done();
            });
        });
    });
});
