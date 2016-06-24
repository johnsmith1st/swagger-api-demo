'use strict';

let userService = require('./user-service');
let sessionService = require('./session-service');

/**
 * User basic auth.
 * @param {string} account
 * @param {string} password
 * @param {object} sessionOpts
 * @param {string} sessionOpts.mode - none, exclusive, or independent
 * @param {string} [sessionOpts.ip] - client ip
 * @param {string} [sessionOpts.ttl] - session time to live
 * @param {object} [sessionOpts.data] - initial user session data
 */
function basicAuth(account, password, sessionOpts) {
  return userService
    .validateUserPassword(account, password)
    .then(user => {
      if (sessionOpts.mode === 'none') return { user };
      let createSession;
      if (sessionOpts.mode === 'exclusive') createSession = sessionService.createUniqueSession;
      else createSession = sessionService.createSession;
      return createSession(user.id, sessionOpts)
        .then(session => {
          return { user, session };
        });
    });
}

module.exports.basicAuth = basicAuth;
