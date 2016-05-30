'use strict';

let logger = require('./logger');

module.exports = function requestLogger(req, res, next) {
  logger.debug('%s %s', req.method, req.originalUrl);
  next();
};
