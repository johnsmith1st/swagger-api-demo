'use strict';

/**
 * Middleware to parse pagination parameters.
 */
module.exports = function queryPagination(req, res, next) {
  if (req.query.pageIndex) req.query.pageIndex = Number.parseInt(req.query.pageIndex);
  if (req.query.pageSize) req.query.pageIndex = Number.parseInt(req.query.pageSize);
  return next();
};