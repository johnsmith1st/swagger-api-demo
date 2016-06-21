'use strict';

let logger = require('./logger');

const ERRORS = {
  SchemaValidationFailed:   [ '40000', 'SCHEMA_VALIDATION_FAILED' ],
  RequireMinProperties:     [ '40001', 'REQUIRE_MIN_PROPERTIES' ],
  InvalidParameters:        [ '40002', 'INVALID_PARAMETERS' ],
  RequireUserAccount:       [ '40011', 'REQUIRE_USER_ACCOUNT', 'Required phone, or email in request body' ],
  RequireUserPassword:      [ '40012', 'REQUIRE_USER_PASSWORD', 'Required password in request body' ],
  InvalidUserId:            [ '40013', 'INVALID_USER_ID', 'Invalid user id' ],
  InvalidUserPassword:      [ '40014', 'INVALID_USER_PASSWORD', 'Invalid user password' ],
  DuplicatedUserPhone:      [ '40015', 'DUPLICATED_USER_PHONE', 'Duplicated user phone' ],
  DuplicatedUserEmail:      [ '40016', 'DUPLICATED_USER_EMAIL', 'Duplicated user email' ],
  InvalidTokenFormat:       [ '40020', 'INVALID_TOKEN_FORMAT', 'Invalid session token format' ],
  InvalidVerificationCode:  [ '40030', 'INVALID_VERIFICATION_CODE', 'Invalid verification code' ],
  UserNotFound:             [ '40401', 'USER_NOT_FOUND', 'User not found' ],
  SessionNotFound:          [ '40402', 'SESSION_NOT_FOUND', 'Session not found' ]
};

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

  static create(err) {
    return new ApiError(err[3] || 400, err[0], err[2]);
  }

  static get RequireUserAccount() {
    return ApiError.create(ERRORS.RequireUserAccount);
  }

  static get RequireUserPassword() {
    return ApiError.create(ERRORS.RequireUserPassword);
  }

  static get InvalidUserId() {
    return ApiError.create(ERRORS.InvalidUserId);
  }

  static get InvalidUserPassword() {
    return ApiError.create(ERRORS.InvalidUserPassword);
  }

  static get DuplicatedUserPhone() {
    return ApiError.create(ERRORS.DuplicatedUserPhone);
  }

  static get DuplicatedUserEmail() {
    return ApiError.create(ERRORS.DuplicatedUserEmail);
  }

  static get InvalidTokenFormat() {
    return ApiError.create(ERRORS.InvalidTokenFormat);
  }

  static get InvalidVerificationCode() {
    return ApiError.create(ERRORS.InvalidVerificationCode);
  }

}

class NotFoundError extends Error {

  /**
   * @constructor
   * @param {string} message
   */
  constructor(errorCode, message) {
    super(message);
    this.errorCode = errorCode;
  }

  static UserNotFound(id) {
    return new NotFoundError(ERRORS.UserNotFound[0], `User not found: ${id}`);
  }

  static SessionNotFound(token) {
    return new NotFoundError(ERRORS.SessionNotFound[0], `User not found: ${token}`);
  }
}

module.exports.ApiError = ApiError;

module.exports.NotFoundError = NotFoundError;

module.exports.notFoundErrorMiddleware = function notFoundErrorMiddleware(err, req, res, next) {
  if (err instanceof NotFoundError) {
    res
      .status(404)
      .json({
        code: 404,
        error_code: err.errorCode || '404',
        error_message: err.message
      });
    return;
  }
  next(err);
};

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

module.exports.validationErrorMiddleware = function validationErrorMiddleware(err, req, res, next) {

  logger.error(err);

  switch (err.code) {
    case 'SCHEMA_VALIDATION_FAILED':
      return handleSchemaValidationError(err, res);
    case 'MIN_PROPERTIES':
      return handleMinPropertyError(err, res);
    case 'MINIMUM':
      return handleInvalidParametersError(err, res);
    default:
      break;
  }

  if (/route.* no.* defined/i.test(err.message))
    return handleRouteNotDefinedError(res);

  next(err);
};

module.exports.defaultErrorMiddleware = function defaultErrorMiddleware(err, req, res, next) {
  logger.error(err);
  res
    .status(500)
    .json({
      code: 500,
      error_code: '500',
      error_message: err.message
    });
};

function handleSchemaValidationError(err, res) {
  res
    .status(400)
    .json({
      code: 400,
      error_code: ERRORS.SchemaValidationFailed[0],
      error_name: ERRORS.SchemaValidationFailed[1],
      error_message: err.message,
      error_detail: err.results.errors.map(s => {
        return { code: s.code, message: s.message };
      })
    });
}

function handleMinPropertyError(err, res) {
  res
    .status(400)
    .json({
      code: 400,
      error_code: ERRORS.RequireMinProperties[0],
      error_name: ERRORS.RequireMinProperties[1],
      error_message: err.message
    });
}

function handleInvalidParametersError(err, res) {
  res
    .status(400)
    .json({
      code: 400,
      error_code: ERRORS.InvalidParameters[0],
      error_name: ERRORS.InvalidParameters[1],
      error_message: err.message
    });
}

function handleRouteNotDefinedError(res) {
  res
    .status(405)
    .json({
      code: 405,
      error_code: '405',
      error_message: 'Method not allowed'
    });
}
