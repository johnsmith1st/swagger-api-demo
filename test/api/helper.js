'use strict';

let config = require('config');
let chai = require('chai');
let chaiHttp = require('chai-http');
let Promise = require('bluebird');

chai.use(chaiHttp);
chai.request.addPromises(Promise);
let should = chai.should();

let port = config.get('port');
let apiKey = config.get('security.apiKey');
let apiV1 = `http://localhost:${port}/api/v1`;

let userService = require('../../src/services/user-service');
let sessionService = require('../../src/services/session-service');
let logger = require('../../src/logger');


module.exports.shouldFail = function shouldFail(res, status, code, message) {
  res.statusCode.should.equal(status);
  if (code instanceof RegExp) res.body.error_code.should.match(code);
  else res.body.error_code.should.equal(code);
  if (message instanceof RegExp) res.body.error_message.should.match(message);
  else res.body.error_message.should.equal(message);
};

module.exports.validateObject = function validateObject(obj, tests) {
  Object.keys(tests)
    .forEach(field => {
      let v = tests[field];
      if (v['be']) obj[field].should.be.a(v['be']);
      if (v['equal']) obj[field].should.equal(v['equal']);
      if (v['deepEqual']) obj[field].should.deep.equal(v['deepEqual']);
      if (v['match']) obj[field].toString().should.match(v['match']);
      if (v['contain']) obj[field].should.contain(v['contain']);
      if (v['include']) obj[field].should.include(v['include']);
      if (v['oneOf']) obj[field].should.be.oneOf(v['oneOf']);
      if (v['length']) obj[field].should.have.length(v['length']);
      if (v['members']) obj[field].should.have.members(v['members']);
      if (v['atLeast']) obj[field].should.be.at.least(v['atLeast']);
      if (v['atMost']) obj[field].should.be.at.most(v['atMost']);
      if (v['above']) obj[field].should.be.above(v['above']);
      if (v['below']) obj[field].should.be.below(v['below']);
    });
};

/**
 * @param {object} opts
 * @param {string} opts.api
 * @param {string} opts.path
 * @param {string} opts.method
 * @param {string} [opts.desc]
 * @param {function} [opts.validator]
 */
module.exports.testUnauthorized = function testUnauthorized(opts) {

  let desc = opts.desc || 'should fail 401 for x-api-key not set';

  let validator = opts.validator ||
      function(res) {
        module.exports.shouldFail(res, 401, '401', 'Unauthorized');
      };

  it(desc, function() {
    return chai
      .request(opts.api)[opts.method](opts.path)
      .then(
        res => Promise.reject(res),
        err => {
          logger.debug(err.response.res.body);
          validator(err.response.res);
        }
      );
  });

};

/**
 * @param {object} opts
 * @param {string} opts.api
 * @param {string} opts.path
 * @param {string} opts.method
 * @param {string} [opts.desc]
 * @param {function} [opts.validator]
 */
module.exports.testForbidden = function testForbidden(opts) {

  let desc = opts.desc || 'should fail 403 for x-api-key is invalid';

  let validator = opts.validator ||
    function(res) {
      module.exports.shouldFail(res, 403, '403', 'Forbidden');
    };

  it(desc, function() {
    return chai
      .request(opts.api)[opts.method](opts.path)
      .set('X-API-KEY', 'some/invalid/api/key')
      .then(
        res => Promise.reject(res),
        err => {
          logger.debug(err.response.res.body);
          validator(err.response.res);
        }
      );
  });
};

/**
 * @param {object} opts
 * @param {string} opts.api
 * @param {string} opts.path
 * @param {string} opts.method
 * @param {string} opts.resource
 * @param {object} [opts.body]
 * @param {string} [opts.desc]
 * @param {function} [opts.validator]
 */
module.exports.testNotFound = function testNotFound(opts) {

  let desc = opts.desc || `should fail 404 for ${opts.resource} not found`;

  let validator = opts.validator ||
    function(res) {
      module.exports.shouldFail(res, 404, /404\d*/, /not found/i);
    };

  it(desc, function() {
    return chai
      .request(opts.api)[opts.method](opts.path)
      .set('X-API-KEY', apiKey)
      .send(opts.body || {})
      .then(
        res => Promise.reject(res),
        err => {
          logger.debug(err.response.res.body);
          validator(err.response.res);
        }
      );
  });
};

module.exports.genRandomId = function genRandomId() {
  let len = 24;
  let chars = '0a1b2c3d4e5f6789';
  let buff = [];
  for (let i = 0; i < len; i++) {
    let p = Math.floor(Math.random() * chars.length);
    buff.push(chars.charAt(p));
  }
  return buff.join('');
};

module.exports.genRandomToken = function genRandomToken() {
  let len = 64;
  let chars = '0123456789AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz';
  let buff = [];
  for (let i = 0; i < len; i++) {
    let p = Math.floor(Math.random() * chars.length);
    buff.push(chars.charAt(p));
  }
  return buff.join('');
};

module.exports.createTestUser = function createTestUser(u) {
  return userService.createUser(u);
};

module.exports.createTestUserWithSession = function createTestUserWithSession(u, s) {
  return userService.createUser(u)
    .then(user => {
      return sessionService.createSession(user.id, s)
        .then(session => {
          return { user, session };
        });
    })
};

module.exports.createTestUserWithSessions = function createTestUserWithSessions(u, ss) {
  return userService.createUser(u)
    .then(user => {
      return Promise.map(ss, s => sessionService.createSession(user.id, s))
        .then(sessions => {
          return { user, sessions };
        });
    });
};

module.exports.cleanTestUser = function cleanTestUser(uid) {
  return userService.UserModel
    .findByIdAndRemove(uid).exec()
    .then(() => sessionService.deleteUserSessions(uid));
};

module.exports.debug = function debug(s) {
  logger.debug(s);
};

module.exports.apiV1 = apiV1;
module.exports.apiKey = apiKey;
