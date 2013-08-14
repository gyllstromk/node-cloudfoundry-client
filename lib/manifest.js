var fs = require('fs');

var Manifest = module.exports = function () {

};

Manifest.fromYamlFile = function (fileName) {
    fs.readFile(fileName, function (err, data) {

    });
};
