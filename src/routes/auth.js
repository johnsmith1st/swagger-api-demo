'use strict';

let authService = require('../services/auth-service');

/**
 * POST /auth
 */
module.exports.auth = (req, res, next) =>
  res.apiPromise(next, authService.queryUsers(req.body.account, req.body.password, req.body.session_opts));

