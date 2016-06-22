'use strict';

/**
 * Middleware to parse query id.
 */
module.exports = function queryId(req, res, next) {
  if (!(req.query && req.query.id)) return next();
  let id = req.query.id;
  let arr = id.split(',');
  req.query.id = arr.length > 1 ? arr : id;
  return next();
};
