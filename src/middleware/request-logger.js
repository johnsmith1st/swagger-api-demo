'use strict';

let logger = require('./../logger');

/**
 * Log every request method and url in debug mode.
 */
module.exports = function requestLogger(req, res, next) {
  logger.debug('%s %s', req.method, req.originalUrl);
  next();
};
