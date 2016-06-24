'use strict';

let chai = require('chai');
let should = chai.should();

let apiClient = require('./api-client');
let helper = require('./helper');

describe('/auth', function() {

  describe('POST /auth', function() {

    let user;

    before(function() {
      return apiClient
        .createUser({
          email: 'foo@example.org',
          phone: '10122223333',
          password: '123456'
        })
        .then(res => user = res.body.data.user);
    });

    after(function() {
      return helper.cleanTestUser(user.id);
    });

    it('should auth user by email and password without creating a session', function() {
      return apiClient.basicAuth({
          account: user.email,
          password: '123456',
          session_opts: { mode: 'none' }
        })
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          let d = res.body.data, u = res.body.data.user;
          helper.validateObject(u, {
            phone: { equal: user.phone },
            email: { equal: user.email }
          });
          d.should.not.have.property('session');
        });
    });

    it('should auth user by phone and password without creating a session', function() {
      return apiClient.basicAuth({
        account: user.phone,
        password: '123456',
        session_opts: { mode: 'none' }
      })
      .then(res => {
        helper.debug(res.body);
        res.should.have.status(200);
        let d = res.body.data, u = res.body.data.user;
        helper.validateObject(u, {
          phone: { equal: user.phone },
          email: { equal: user.email }
        });
        d.should.not.have.property('session');
      });
    });

    it('should fail for invalid password', function() {
      return apiClient.basicAuth({
        account: user.email,
        password: '12345678',
        session_opts: { mode: 'none' }
      })
      .then(res => {
        helper.debug(res.body);
        helper.shouldFail(res, 400, '40015', 'Invalid user password')
      });
    });

    it('should fail for user not found', function() {
      return apiClient.basicAuth({
        account: 'bar@example.org',
        password: '12345678',
        session_opts: { mode: 'none' }
      })
      .then(res => {
        helper.debug(res.body);
        helper.shouldFail(res, 404, '40401', /user not found/i)
      });
    });

    helper.testUnauthorized({ api: helper.apiV1, path: '/auth', method: 'post' });

    helper.testForbidden({ api: helper.apiV1, path: '/auth', method: 'post' });

  });

});
