require('../lib/url');
var url = require('url');

var assert = require('assert');

describe('url', function () {
    it('toUaa with protocol', function () {
        assert.equal(url.toUaa('http://api.pivotal.io'), 'http://uaa.pivotal.io/');
    });
});
