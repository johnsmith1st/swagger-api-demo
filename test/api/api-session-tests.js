'use strict';

let Promise = require('bluebird');
let chai = require('chai');
let should = chai.should();

let apiClient = require('./api-client');
let helper = require('./helper');

describe('/sessions', function() {

  let user, sessions;

  before(function() {
    return helper
      .createTestUserWithSessions(
        { email: 'foo@example.org', password: '123456' },
        [{ ip: '127.0.0.1', data: { foo: 'foo' } }, { ip: '255.255.255.0', data: { bar: 'bar' } }]
      )
      .then(r => {
        user = r.user;
        sessions = r.sessions;
      });
  });

  after(function() {
    return helper.cleanTestUser(user.id);
  });

  describe('GET /sessions/:token', function() {

    let path = `/sessions/${helper.genRandomToken()}`, method = 'get';

    it('should get session by token', function() {
      return Promise
        .map(sessions, s => apiClient.getSession(s.token))
        .then(rs => {
          rs.forEach((res, i) => {
            helper.debug(res.body);
            res.should.have.status(200);
            helper.validateObject(res.body.data.session, {
              uid: { equal: user.id },
              token: { equal: sessions[i].token },
              ttl: { be: 'number' },
              data: { deepEqual: sessions[i].data }
            });
          });
        });
    });

    it('should fail 400 for invalid session token format', function() {
      return apiClient
        .getSession('foo')
        .then(res => {
          helper.debug(res.body);
          helper.shouldFail(res, 400, '40020', 'Invalid session token format');
        });
    });

    helper.testUnauthorized({ api: helper.apiV1, path, method });

    helper.testForbidden({ api: helper.apiV1, path, method });

    helper.testNotFound({ api: helper.apiV1, path, method, resource: 'session' });

  });

  describe('PUT /sessions/:token/data', function() {

    let path = `/sessions/${helper.genRandomToken()}/data`, method = 'patch';

    it('should set session data', function() {
      return apiClient.updateSessionData(sessions[0].token, { foo: 'foo', bar: 'bar' })
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
        });
    });

    it('should update session data', function() {
      return apiClient.updateSessionData(sessions[0].token, { foo: 'bar', bar: 'foo' })
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
        });
    });

    it('should delete session data by set to null', function() {
      return apiClient.updateSessionData(sessions[0].token, { foo: null, bar: null })
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
        });
    });

    it('should fail 400 for invalid session token format', function() {
      return apiClient
        .updateSessionData('foo', {})
        .then(res => {
          helper.debug(res.body);
          helper.shouldFail(res, 400, '40020', 'Invalid session token format')
        });
    });

    helper.testUnauthorized({ api: helper.apiV1, path, method });

    helper.testForbidden({ api: helper.apiV1, path, method });

    helper.testNotFound({ api: helper.apiV1, path, method , body: { data: { _v: 0 } }, resource: 'session' });

  });

  describe('DELETE /sessions/:token', function() {

    let path = `/sessions/${helper.genRandomToken()}`, method = 'delete';

    it('should delete session by token', function() {
      return Promise
        .map(sessions, s => apiClient.deleteSession(s.token))
        .then(rs => {
          rs.forEach(res => {
            helper.debug(res.body);
            res.should.have.status(200);
            res.body.data.should.deep.equal({ kill: 1 });
          });
        });
    });

    it('should be ok if session not found', function() {
      return apiClient.deleteSession(helper.genRandomToken())
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          res.body.data.kill.should.equal(0);
        });
    });

    it('should fail 400 for invalid session token format', function() {
      return apiClient
        .deleteSession('foo')
        .then(res => {
          helper.debug(res.body);
          helper.shouldFail(res, 400, '40020', 'Invalid session token format')
        });
    });

    helper.testUnauthorized({ api: helper.apiV1, path, method });

    helper.testForbidden({ api: helper.apiV1, path, method });

  });

});