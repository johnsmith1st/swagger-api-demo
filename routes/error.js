'use strict';

class ApiError extends Error {
  /**
   * @constructor
   * @param {number} statusCode
   * @param {string} [errorCode]
   * @param {string} [errorMessage]
   */
  constructor(statusCode, errorCode, errorMessage) {
    super(errorMessage || errorCode);
    this.statusCode = statusCode || 500;
    this.errorMessage = errorMessage;
    if (arguments.length == 2) {
      this.errorCode = String(this.statusCode);
      this.errorMessage = errorCode;
    }
    if (arguments.length > 2) {
      this.errorCode = errorCode;
    }
  }
}

module.exports.ApiError = ApiError;

module.exports.apiErrorMiddleware = function apiErrorMiddleware(err, req, res, next) {
  if (err instanceof ApiError) {
    res
      .status(err.statusCode)
      .json({
        code: err.statusCode,
        error_code: err.errorCode,
        error_message: err.errorMessage
      });
    return;
  }
  next(err);
};
