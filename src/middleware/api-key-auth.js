'use strict';

let config = require('config');
let logger = require('../logger');
let ApiError = require('../errors').ApiError;

let apiKey = config.get('security.apiKey');

/**
 * Simple api key authorization middleware.
 */
module.exports = function auth(req, def, scopes, callback) {

  let key = req.header('X-API-KEY');

  if (!key) {
    logger.warn('Unauthorized, X-API-KEY not set in header');
    return callback(new ApiError(401, 'Unauthorized'));
  }

  if (key !== apiKey) {
    logger.warn('Forbidden, X-API-KEY is invalid');
    return callback(new ApiError(403, 'Forbidden'));
  }

  callback(null, true);

};
