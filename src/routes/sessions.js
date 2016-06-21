'use strict';

let sessionService = require('../services/session-service');
let buildMiddleware = require('../middleware/build-middleware');

function getSessionToken(req, res, next) {
  req.sessionToken = req.swagger.params.session_token.value;
  next();
}

/**
 * GET /sessions/:session_token
 */
module.exports.getSession = buildMiddleware(
  getSessionToken,
  (req, res, next) => res.apiPromise(next, sessionService.getSession(req.sessionToken))
);

/**
 * DELETE /sessions/:session_token
 */
module.exports.deleteSession = buildMiddleware(
  getSessionToken,
  (req, res, next) => res.apiPromise(next, sessionService.deleteSession(req.sessionToken))
);

/**
 * PUT /sessions/:session_token/data
 */
module.exports.updateSessionData = buildMiddleware(
  getSessionToken,
  (req, res, next) => res.apiPromise(next, sessionService.updateSessionData(req.sessionToken, req.body.data))
);
