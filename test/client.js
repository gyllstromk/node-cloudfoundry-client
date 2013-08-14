var VcapClient = require('../lib/vcap');

var host     = 'ourhost.com',
    email    = 'me@me.com',
    password = 'mypassword';

var client = module.exports = new VcapClient({
    host:     host,
    email:    email,
    password: password
});
