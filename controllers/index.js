const fs = require('fs');
const path = require('path');

const controllers = {};

fs.readdirSync(__dirname)
    .filter(file_or_dirname => file_or_dirname !== path.basename(__filename))
    .forEach(file_or_dirname => Object.assign(controllers, require(path.resolve(__dirname, file_or_dirname))));

module.exports = controllers;
