var errors  = require('./errors');

var request = require('request');

require('sugar');

var url     = require('url'),
    util    = require('util');

module.exports = function (protocol, host, token, email, password) {
    var getUrl = function (object) {
        return url.format({
            protocol: protocol,
            hostname: host,
            pathname: 'v2/' + object.endpoint
        });
    };

    var getAuthUrl = function (callback) {
        request({
            url: getUrl({ endpoint: 'info' }),
            json: true
        }, function (err, resp, body) {
            if (err) {
                return callback(err);
            }

            if (resp.statusCode !== 200) {
                return callback(resp.statusCode, body);
            }

            callback(null, body.authorization_endpoint + '/oauth/token');
        });
    };

    var login = function (callback) {
        getAuthUrl(function (err, url) {
            if (err) {
                return callback(err);
            }

            request({
                url:    url,
                method: 'POST',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded;' +
                                    'charset=utf-8',
                    accept:         'application/json;charset=utf-8',
                    authorization:  'Basic Y2Y6'
                },
                body: util.format('grant_type=password&username=%s&password=%s',
                          email, password)
            }, function (err, resp, body) {
                if (err) {
                    return callback(err);
                }

                try {
                    body = JSON.parse(body);
                } catch (err) {
                    return callback(err);
                }

                token = body.access_token;
                callback();
            });
        });
    };

    var isSuccess = function (code) {
        return (code - (code % 200)) === 200;
    };

    var makeRequest = function (object, callback) {
        object.url = getUrl(object);
        delete object.endpoint;
        object.json = object.json || true;

        if (object.json) {
            if ([ 'object', 'boolean' ].none(typeof object.json)) {
                object.body = object.json;
                object.json = undefined;
            }
        }

        if (object.page) {
            if (! object.qs) {
                object.qs = {};
            }

            object.qs.page = object.page;
            delete object.page;
        }

        return request(object, function (err, resp, body) {
            if (err) {
                return callback(err);
            }

            if (isSuccess(resp.statusCode)) {
                return callback(null, body);
            }

            return callback(errors.get(resp));
        });
    };

    return function (object, callback) {
        if (token) {
            object.headers = {
                Authorization: 'bearer ' + token
            };
        }

        var loginAndRequest = function () {
            login(function (err) {
                if (err) {
                    callback(err);
                    return;
                }

                return makeRequest(object, callback);
            });
        };

        if (token) {
            return makeRequest(object, function (err, result) {
                if (err) {
                    if (! (err instanceof errors.AuthorizationError) ||
                        ! email) {

                        return callback(err);
                    }

                    return loginAndRequest();
                }

                callback(err, result);
            });
        }

        loginAndRequest();
    };
};
