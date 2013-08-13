var util = require('util');

var ClientError = module.exports.ClientError = function (body, statusCode) {
    this.vcapMessage = body;
    this.statusCode = statusCode;
};

util.inherits(ClientError, Error);

var AuthorizationError = module.exports.AuthorizationError = function (body) {
    ClientError.call(this, body, 403);
};

util.inherits(AuthorizationError, ClientError);

var NotFoundError = module.exports.NotFoundError = function (body) {
    ClientError.call(this, body, 404);
};

util.inherits(AuthorizationError, ClientError);

module.exports.get = function (resp) {
    switch (resp.statusCode) {
    case 403:
        return new AuthorizationError(resp.body);
    case 404:
        return new NotFoundError(resp.body);
    default:
        return new ClientError(resp.body);
    }

};
