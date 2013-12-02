var Client = require('../..');

var async  = require('async');

var assert = require('assert'),
    util   = require('util');


assert.noError = function (err) {
    assert(! err, util.inspect(err));
};

describe('integration tests', function () {
    var client,
        orgName;

    assert.matchNames = function (result, name) {
        assert.deepEqual(result.map(function (each) {
            return each.entity.name;
        }), [ name ]);
    };

    before(function (done) {
        var configPath = require('path').resolve(__dirname, 'config.json');
        require('fs').readFile(configPath, function (err, data) {
            assert(! err, 'Could not read ' + configPath);

            var config;

            try {
                config = JSON.parse(data.toString());
            } catch (err) {
                assert(! err, 'Could not parse ' + configPath);
            }

            assert(config.orgName);
            orgName = config.orgName;

            client = new Client({
                host:     config.host,
                token:    config.token,
                email:    config.email,
                password: config.password
            });

            done();
        });
    });

    after(function (done) {
        client.orgs.get({ name: orgName }, function (err, org) {
            if (err) {
                return done();
            }

            if (org.isEmpty()) {
                return done();
            }

            client.orgs.delete(org.metadata.guid, done);
        });
    });

    describe('organizations', function () {
        var guid;

        it('create', function (done) {
            client.orgs.create({ name: orgName }, function (err, org) {
                assert.noError(err);
                guid = org.metadata.guid;
                assert.equal(org.entity.name, orgName);
                done();
            });
        });

        it('get all', function (done) {
            client.orgs.get(function (err, orgs) {
                assert.noError(err);
                assert(orgs.find(function (each) {
                    return each.entity.name === orgName;
                }));
                done();
            });
        });

        it('get by name', function (done) {
            client.orgs.getByName(orgName, function (err, org) {
                assert.noError(err);
                assert.matchNames(org, orgName);
                done();
            });
        });

        it('get by guid', function (done) {
            client.orgs.get(guid, function (err, org) {
                assert.noError(err);
                assert.equal(org.entity.name, orgName);
                done();
            });
        });

        it('delete', function (done) {
            client.orgs.delete(guid, function (err, org) {
                assert.noError(err);
                done();
            });
        });
    });

    describe('spaces', function () {
        var spaceName = 'testSpace',
            orgGuid,
            guid;

        before(function (done) {
            client.orgs.create({ name: orgName }, function (err, org) {
                assert.noError(err);
                orgGuid = org.metadata.guid;
                done();
            });
        });

        after(function (done) {
            client.orgs.delete(orgGuid, done);
        });

        it('create', function (done) {
            client.spaces.create({
                name: spaceName,
                organization_guid: orgGuid
            }, function (err, space) {
                assert.noError(err);
                assert.equal(space.entity.name, spaceName);
                guid = space.metadata.guid;
                
                done();
            });
        });

        it('get all', function (done) {
            client.spaces.get(function (err, spaces) {
                assert.noError(err);
                assert(spaces.find(function (each) {
                    return each.entity.name === spaceName;
                }));

                done();
            });
        });

        it('get by name', function (done) {
            client.spaces.getByName(spaceName, function (err, spaces) {
                assert.noError(err);
                assert.matchNames(spaces, spaceName);
                done();
            });
        });

        it('get by org guid', function (done) {
            client.spaces.get({ organization_guid: orgGuid },
                function (err, spaces) {

                assert.noError(err);
                assert.matchNames(spaces, spaceName);
                done();
            });
        });

        it('get by space name and org guid', function (done) {
            client.spaces.get({ name: spaceName, organization_guid: orgGuid },
                function (err, spaces) {

                assert.noError(err);
                assert.matchNames(spaces, spaceName);
                done();
            });
        });

        it('get by space name and wrong org guid fails', function (done) {
            client.spaces.get({ name: spaceName, organization_guid: '111' },
                function (err, spaces) {

                assert.noError(err);
                assert.deepEqual(spaces, []);
                done();
            });
        });

        it('get by guid', function (done) {
            client.spaces.get(guid, function (err, space) {
                assert.noError(err);
                assert.equal(space.entity.name, spaceName);
                done();
            });
        });

        it('delete', function (done) {
            client.spaces.delete(guid, function (err, space) {
                assert.noError(err);
                done();
            });
        });
    });

    describe('apps', function () {
        var spaceName = 'testSpace',
            appName   = 'testApp',
            orgGuid,
            spaceGuid,
            guid;

        before(function (done) {
            client.orgs.create({ name: orgName }, function (err, org) {
                assert.noError(err);

                orgGuid = org.metadata.guid;

                client.spaces.create({
                    name:              spaceName,
                    organization_guid: orgGuid
                }, function (err, space) {
                    assert.noError(err);
                    spaceGuid = space.metadata.guid;
                    
                    done();
                });
            });
        });

        after(function (done) {
            client.spaces.delete(spaceGuid, true, function (err, space) {
                client.orgs.delete(orgGuid, done);
            });
        });

        it('create', function (done) {
            client.apps.create({
                name:       appName,
                space_guid: spaceGuid
            }, function (err, app) {
                assert.noError(err);
                assert.equal(app.entity.name, appName);
                guid = app.metadata.guid;
                
                done();
            });
        });

        it('get all', function (done) {
            client.apps.get(function (err, apps) {
                assert.noError(err);
                assert(apps.find(function (each) {
                    return each.entity.name === appName;
                }));

                done();
            });
        });

        it('get by name', function (done) {
            client.apps.getByName(appName, function (err, apps) {
                assert.noError(err);
                assert.matchNames(apps, appName);
                done();
            });
        });

        it('get by guid', function (done) {
            client.apps.get(guid, function (err, app) {
                assert.noError(err);
                assert.equal(app.entity.name, appName);
                done();
            });
        });

        it('get instances', function (done) {
            client.apps.get(guid).instances.get(function (err, instances) {
                assert.deepEqual(err, {
                    message: {
                        code: 170002,
                        description: 'App has not finished staging'
                    },
                    statusCode: 400
                });
                done();
            });
        });

        it('get logs', function (done) {
            client.apps.get(guid).instances.get(0).logs.get(
                function (err, logs) {

                // TODO: can't really test logs until we actually upload and
                // start apps, since logs will not be produced. Here we simply
                // check for the error we expect in the context of getting logs
                // on a stopped app

                assert.deepEqual(err, {
                    message: {
                        code: 190001,
                        description: 'File error: Request failed for app: ' +
                                     'testApp path: logs as the app is in ' +
                                     'stopped state.'
                    },
                    statusCode: 400
                }); // app is stopped
                done();
            });
        });

        it('delete', function (done) {
            client.apps.delete(guid, function (err, app) {
                assert.noError(err);
                done();
            });
        });

        it('create multiple', function (done) {
            async.each([ 'testApp1', 'testApp2' ], function (each, callback) {
                client.apps.create({
                    name:       each,
                    space_guid: spaceGuid
                }, callback);
            }, done);
        });

        it('delete space recursively', function (done) {
            client.spaces.delete(spaceGuid, true, done);
        });

        it('cannot get space', function (done) {
            client.spaces.get(spaceGuid, function (err) {
                assert.equal(err.statusCode, 404);
                assert(err);
                done();
            });
        });
    });
});
