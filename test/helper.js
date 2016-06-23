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

let userService = require('../src/services/user-service');
let sessionService = require('../src/services/session-service');
let logger = require('../src/logger');


module.exports.shouldFail = function shouldFail(res, status, code, message) {
  res.should.have.status(status);
  if (code instanceof RegExp) res.body.error_code.should.match(code);
  else res.body.error_code.should.equal(code);
  if (message instanceof RegExp) res.body.error_message.should.match(message);
  else res.body.error_message.should.equal(message);
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
      .then(res => {
        logger.log(res.body);
        validator(res);
      });
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
      .then(res => {
        logger.log(res.body);
        validator(res);
      });
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
      .then(res => {
        console.log(res.body);
        validator(res);
      });
  });
};

module.exports.genRandomToken = function genRandomToken() {
  let len = 64;
  let chars = '0123456789AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz';
  let buff = [];
  for (let i = 0; i < len; i++) {
    let p = Math.floor(Math.random() * 62);
    buff.push(chars.charAt(p));
  }
  return buff.join('');
};

module.exports.cleanUserData = function cleanUserData(uid) {
  return userService.UserModel
    .findByIdAndRemove(uid).exec()
    .then(() => sessionService.deleteUserSessions(uid));
};

module.exports.apiV1 = apiV1;
module.exports.apiKey = apiKey;
