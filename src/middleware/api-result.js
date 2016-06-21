'use strict';

/**
 * Api result middleware.
 */
module.exports = function apiResultMiddleware(req, res, next) {
  res.apiResult = (result) => {
    res.status(200)
      .json({
        code: 200,
        data: result
      });
  };
  next();
};
