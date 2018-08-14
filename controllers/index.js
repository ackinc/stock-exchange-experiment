const fs = require('fs');
const path = require('path');

const controllers = {};

fs.readdirSync(__dirname)
    .filter(filename => filename !== path.basename(__filename))
    .forEach(filename => Object.assign(controllers, require(path.resolve(__dirname, filename))));

module.exports = controllers;
