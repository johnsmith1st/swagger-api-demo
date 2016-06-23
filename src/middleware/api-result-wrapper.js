'use strict';

module.exports = function resultWrapper(key) {
  return function apiResultWrapperMiddleware(req, res, next) {
    res.wrapApiResult = function(result) {
      let obj = {};
      obj[key] = result;
      return obj;
    };
    next();
  };
};