var url = require('url');

url.toUaa = function (host) {
    var parsed = url.parse(host);
    var tokens = parsed.host.split('.');
    tokens[0] = 'uaa';
    parsed.host = tokens.join('.');
    return url.format(parsed);
};
