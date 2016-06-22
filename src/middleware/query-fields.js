'use strict';

/**
 * Middleware to parse query fields.
 */
module.exports = function queryFields(req, res, next) {
  if (!(req.query && req.query.fields)) return next();
  req.query.fields = req.query.fields.split(',');
  return next();
};

