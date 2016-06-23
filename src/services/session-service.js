'use strict';

let _ = require('lodash');
let config = require('config');
let Promise = require('bluebird');
let RedisSessions = require("redis-sessions");

let RedisManager = require('./redis-manager');
let NotFoundError = require('../errors').NotFoundError;
let ApiError = require('../errors').ApiError;

let rs = new RedisSessions({
  namespace: config.get('sessions.namespace'),
  client: RedisManager.default.create(config.get('redis'))
});

let defaultTTL = config.get('sessions.defaultTTL');
let defaultAPP = config.get('sessions.defaultAPP');

/**
 * Create session.
 * @param {string} uid
 * @param {object} [opts]
 * @param {string} [opts.ip]
 * @param {number} [opts.ttl]
 * @param {object} [opts.data]
 */
function createSession(uid, opts) {
  opts = opts || {};
  return new Promise((resolve, reject) => {
    rs.create({
      app: defaultAPP,
      id: uid,
      ip: opts.ip || '_',
      ttl: opts.ttl || defaultTTL,
      d: opts.data || { _v: 0 }
    }, (err, session) => {
      return err ? reject(err) : resolve({ uid: opts.uid, token: session.token });
    });
  });
}

/**
 * Create unique session.
 * @param {string} uid
 * @param {object} args
 * @param {string} [args.ip]
 * @param {number} [args.ttl]
 * @param {object} [args.data]
 */
function createUniqueSession(uid, args) {
  return deleteUserSessions(uid).then(() => createSession(uid, args));
}

/**
 * Get session by token.
 * @param {string} token
 */
function getSession(token) {
  return new Promise((resolve, reject) => {
    rs.get({
      app: defaultAPP,
      token: token
    }, (err, session) => {
      if (err) return reject(err);
      if (_.isEmpty(session)) return reject(NotFoundError.SessionNotFound(token));
      return resolve({
        token: token,
        uid: session.id,
        ttl: session.ttl,
        data: session.d
      });
    });
  })
  .catch(err => {
    if (err.name === 'invalidFormat')
      throw ApiError.InvalidTokenFormat;
    throw err;
  });
}

/**
 * Delete session by token.
 * @param {string} token
 */
function deleteSession(token) {
  return new Promise((resolve, reject) => {
    rs.kill({
      app: defaultAPP,
      token: token
    }, (err, resp) => {
      return err ? reject(err) : resolve(resp);
    });
  })
  .catch(err => {
    if (err.name === 'invalidFormat')
      throw ApiError.InvalidTokenFormat;
    throw err;
  });
}

/**
 * Update session data.
 * @param {string} token
 * @param {object} data
 */
function updateSessionData(token, data) {
  return new Promise((resolve, reject) => {
    rs.set({
      app: defaultAPP,
      token: token,
      d: data
    }, (err, session) => {
      if (err) return reject(err);
      if (_.isEmpty(session)) return reject(NotFoundError.SessionNotFound(token));
      return resolve(session.d);
    });
  })
  .catch(err => {
    if (err.name === 'invalidFormat')
      throw ApiError.InvalidTokenFormat;
    throw err;
  });
}

/**
 * Get sessions by user id.
 * @param {string} uid
 */
function getUserSessions(uid) {
  return new Promise((resolve, reject) => {
    rs.soid({
      app: defaultAPP,
      id: uid
    }, (err, resp) => {
      if (err) return reject(err);
      let sessions = (resp.sessions || []).map(s => {
        return {
          uid: uid,
          ttl: s.ttl,
          data: s.d
        }
      });
      return resolve(sessions);
    });
  });
}

/**
 * Delete session by user id.
 * @param {string} uid
 */
function deleteUserSessions(uid) {
  return new Promise((resolve, reject) => {
    rs.killsoid({
      app: defaultAPP,
      id: uid
    }, (err, resp) => {
      return err ? reject(err) : resolve(resp);
    });
  });
}

module.exports.createSession = createSession;
module.exports.createUniqueSession = createUniqueSession;
module.exports.getSession = getSession;
module.exports.deleteSession = deleteSession;
module.exports.updateSessionData = updateSessionData;
module.exports.getUserSessions = getUserSessions;
module.exports.deleteUserSessions = deleteUserSessions;
