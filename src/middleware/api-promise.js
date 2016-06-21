'use strict';

/**
 * Api promise middleware.
 */
module.exports = function apiPromiseMiddleware(req, res, next) {
  res.apiPromise = (nxt, promise) => {
    promise
      .then(result => res.apiResult(result))
      .catch(err => nxt(err));
  };
  next();
};