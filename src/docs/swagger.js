'use strict';

let fs = require('fs');
let path = require('path');
let yaml = require('js-yaml');

module.exports = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, 'swagger.yml'), 'utf8'));