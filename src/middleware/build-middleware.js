'use strict';

let async = require('async');

module.exports = function buildMiddleware() {
  let middlewareArr = Array.prototype.slice.call(arguments);
  return function (req, res, next) {
    let current = 0 , responseSent = false;
    async.until(
      () => responseSent || current === middlewareArr.length,
      (callback) => {
        let middleware = middlewareArr[current++];
        // attaches listener multiple times
        res.on('finish', function () {
          // avoid callbacks being executed multiple times
          if (!responseSent) {
            responseSent = true;
            callback();
          }
        });
        // Whilst express will catch this, we need to explicitly catch
        // to avoid leaving the process in an undesirable state
        try {
          middleware(req, res, callback);
        } catch (err) {
          callback(err);
        }
      },
      (err) => {
        if (err) return next(err);
        if (!responseSent) return next();
      }
    )
  };
};
