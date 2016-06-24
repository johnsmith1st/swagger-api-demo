'use strict';

let _ = require('lodash');
let async = require('async');
let Promise = require('bluebird');
let config = require('config');
let chai = require('chai');
let should = chai.should();

let userService = require('../../src/services/user-service');
let apiClient = require('./api-client');
let helper = require('./helper');

describe('/users', function() {

  describe('GET /users', function() {

    let path = '/users', method = 'get', _users = [], total = 50;

    before(function() {
      this.timeout(30 * 1000);
      let usrArr = _.range(total).map(i => {
        let acc = 'test_foo_' + (i + 1);
        return {
          fullname: acc,
          nickname: acc,
          email: acc + '@example.org',
          phone: (10200000001 + i).toString(),
          password: '123456'
        };
      });
      return Promise
        .map(usrArr, s => helper.createTestUser(s))
        .then(r => {
          _users = r;
          helper.debug(_users);
        });
    });

    after(function() {
      return Promise.map(_users, s => helper.cleanTestUser(s.id));
    });

    it('should get user by id', function() {
      return Promise
        .map(_users, s => apiClient.getUsers({ id: s.id }))
        .then(r => {
          r.should.be.an('array').and.have.length(_users.length);
          r.forEach((res, i) => {
            helper.debug(res.body);
            res.should.have.status(200);
            let d = res.body.data, u = d.users;
            u.should.be.an('array').and.have.length(1);
            helper.validateObject(u[0], {
              id: { equal: _users[i].id },
              email: { equal: _users[i].email },
              phone: { equal: _users[i].phone },
              fullname: { equal: _users[i].fullname },
              nickname: { equal: _users[i].nickname }
            });
          });
        });
    });

    it('should get users by id array', function() {
      return apiClient.getUsers({ id: _users.map(s => s.id).join(',') })
        .then(res => {
          res.should.have.status(200);
          let users = res.body.data.users;
          users.should.be.an('array').and.have.length(_users.length);
          users.forEach((u, i) => {
            helper.validateObject(u, {
              id: { equal: _users[i].id },
              email: { equal: _users[i].email },
              phone: { equal: _users[i].phone },
              fullname: { equal: _users[i].fullname },
              nickname: { equal: _users[i].nickname }
            });
          });
        });
    });

    it('should get user by phone', function() {
      return Promise
        .map(_users, s => apiClient.getUsers({ phone: s.phone }))
        .then(r => {
          r.should.be.an('array').and.have.length(_users.length);
          r.forEach((res, i) => {
            res.should.have.status(200);
            let d = res.body.data, u = d.users;
            u.should.be.an('array').and.have.length(1);
            helper.validateObject(u[0], {
              id: { equal: _users[i].id },
              email: { equal: _users[i].email },
              phone: { equal: _users[i].phone },
              fullname: { equal: _users[i].fullname },
              nickname: { equal: _users[i].nickname }
            });
          });
        });
    });

    it('should get user by email', function() {
      return Promise
        .map(_users, s => apiClient.getUsers({ email: s.email }))
        .then(r => {
          r.should.be.an('array').and.have.length(_users.length);
          r.forEach((res, i) => {
            res.should.have.status(200);
            let d = res.body.data, u = d.users;
            u.should.be.an('array').and.have.length(1);
            helper.validateObject(u[0], {
              id: { equal: _users[i].id },
              email: { equal: _users[i].email },
              phone: { equal: _users[i].phone },
              fullname: { equal: _users[i].fullname },
              nickname: { equal: _users[i].nickname }
            });
          });
        });
    });

    it('should query with fields', function() {
      return apiClient.getUsers({ fields: 'id,phone,email' })
        .then(res => {
          res.should.have.status(200);
          let u = res.body.data.users;
          helper.debug(u);
          let users = u.filter(s => s.email && s.email.startsWith('test_foo'));
          users.forEach(u => {
            helper.validateObject(u, {
              id: { match: /[0-9a-f]{24}/ },
              email: { match: /test_foo_\d+@example\.org/ },
              phone: { match: /\d{11}/ }
            });
            ['fullname', 'nickname', 'gender', 'birthday', 'portrait', 'created_at'].forEach(prop => {
              u.should.not.have.property(prop);
            });
          });
        })
        .then(() => apiClient.getUsers({ fields: 'phone,email,data,some' }))
        .then(res => {
          res.should.have.status(200);
          let u = res.body.data.users;
          let users = u.filter(s => s.email && s.email.startsWith('test_foo'));
          users.forEach(u => {
            helper.validateObject(u, {
              email: { match: /test_foo_\d+@example\.org/ },
              phone: { match: /\d{11}/ }
            });
            ['id', 'fullname', 'nickname', 'gender', 'birthday', 'portrait', 'created_at'].forEach(prop => {
              u.should.not.have.property(prop);
            });
          });
        });
    });

    it('should query with pagination', function() {

      function rollPage(index, size) {
        return apiClient.getUsers({ pageIndex: index, pageSize: size })
          .then(res => {
            res.should.have.status(200);
            res.body.data.users.should.be.an('array');
            helper.validateObject(res.body.data.pagination, {
              pageIndex: { equal: index },
              pageSize: { equal: size },
              totalPageCount: { atLeast: Math.ceil(_users.length / size) },
              totalItemCount: { atLeast: _users.length }
            });
            return res.body.data.users.length;
          });
      }

      return new Promise((resolve, reject) => {
        let index = 1, size = 10, last;
        async.doUntil(
          (next) => {
            return rollPage(index++, size)
              .then(r => {
                last = r;
                next();
              })
              .catch(err => next(err));
          },
          () => last === 0,
          (err, r) => err ? reject(err) : resolve(r)
        );
      });

    });

    helper.testUnauthorized({ api: helper.apiV1, path, method });

    helper.testForbidden({ api: helper.apiV1, path, method });

  });

  describe('POST /users', function() {

    let path = '/users', method = 'post', _set = new Set();

    after(function() {
      return Promise.map(Array.from(_set), id => helper.cleanTestUser(id));
    });

    it('should be ok', function() {
      return apiClient
        .createUser({
          phone: '12344556677',
          email: 'foo@example.org',
          password: '123456',
          fullname: 'Foo Bared',
          nickname: 'Foo',
          gender: 1,
          birthday: +Date.now()
        })
        .then(res => {
          res.should.have.status(200);
          helper.debug(res.body);
          let usr = res.body.data.user;
          _set.add(usr.id);
          helper.validateObject(usr, {
            id: {match: /[0-9a-f]{24}/},
            email: {equal: 'foo@example.org'},
            phone: {equal: '12344556677'},
            fullname: {equal: 'Foo Bared'},
            nickname: {equal: 'Foo'},
            gender: {equal: 1},
            birthday: {match: /\d{13}/},
            created_at: {match: /\d{13}/}
          });
        });
    });

    it('should fail for phone duplicated', function() {
      return apiClient
        .createUser({ phone: '12344556677', password: '123456' })
        .then(res => {
          helper.debug(res.body);
          helper.shouldFail(res, 400, '40016', 'Duplicated user phone');
        });
    });

    it('should fail for email duplicated', function() {
      return apiClient
        .createUser({ email: 'foo@example.org', password: '123456' })
        .then(res => {
          helper.debug(res.body);
          helper.shouldFail(res, 400, '40017', 'Duplicated user email');
        });
    });

    helper.testUnauthorized({ api: helper.apiV1, path, method });

    helper.testForbidden({ api: helper.apiV1, path, method });

  });

  describe('GET /users/:id', function() {

    let path = `/users/${helper.genRandomId()}`, method = 'get', user, session;

    before(function() {
      return helper
        .createTestUserWithSession({ email: 'foo@example.org', phone: '13122229999', password: '123456' }, {})
        .then(r => {
          user = r.user;
          session = r.session;
        });
    });

    after(function() {
      return helper.cleanTestUser(user.id);
    });

    it('should get user by id', function() {
      return apiClient.getUser(session.uid)
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          helper.validateObject(res.body.data.user, {
            id: { match: /[0-9a-f]{24}/ },
            email: { equal: 'foo@example.org' },
            phone: { equal: '13122229999' }
          });
        });
    });

    it('should get user by token', function() {
      return apiClient.getUser(session.token)
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          helper.validateObject(res.body.data.user, {
            id: { match: /[0-9a-f]{24}/ },
            email: { equal: 'foo@example.org' },
            phone: { equal: '13122229999' }
          });
        });
    });

    it('should select fields', function() {
      return apiClient.getUser(session.uid, { fields: 'phone,email' })
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          res.body.data.user.should.not.have.property('id');
          helper.validateObject(res.body.data.user, {
            email: { equal: 'foo@example.org' },
            phone: { equal: '13122229999' }
          });
        });
    });

    helper.testUnauthorized({ api: helper.apiV1, path, method });

    helper.testForbidden({ api: helper.apiV1, path, method });

    helper.testNotFound({ api: helper.apiV1, path, method, resource: 'user' });

  });

  describe('DELETE /users/:id', function() {

    let path = `/users/${helper.genRandomId()}`, method = 'delete', user;

    after(function() {
      return helper.cleanTestUser(user.id);
    });

    it('should delete user by id', function() {
      return helper.createTestUser({ email: 'foo@example.org', password: '123456' })
        .then(r => {
          user = r;
          return apiClient.deleteUser(user.id);
        })
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          return apiClient.getUser(user.id);
        })
        .then(res => {
          helper.debug(res.body);
          helper.shouldFail(res, 404, '40401', /user not found/i);
        });
    });

    helper.testUnauthorized({ api: helper.apiV1, path, method });

    helper.testForbidden({ api: helper.apiV1, path, method });

    helper.testNotFound({ api: helper.apiV1, path, method, resource: 'user' });

  });

  describe('PUT /users/:id', function() {

    let path = `/users/${helper.genRandomId()}`, method = 'patch';
    let users;

    before(function() {
      let usrArr = [
        { email: 'foo@example.org', password: '123456' },
        { phone: '11122225555', password: '123456' }
      ];
      return Promise.map(usrArr, s => helper.createTestUser(s)).then(r => users = r);
    });

    after(function() {
      return Promise.map(users, s => helper.cleanTestUser(s.id));
    });

    it('should update user phone', function() {
      return apiClient
        .updateUser(users[0].id, { phone: '11122223333' })
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          res.body.data.user.phone.should.equal('11122223333');
        });
    });

    it('should fail to update user phone for duplicated phone', function() {
      return apiClient
        .updateUser(users[0].id, { phone: users[1].phone })
        .then(res => {
          helper.debug(res.body);
          helper.shouldFail(res, 400, '40016', 'Duplicated user phone');
        });
    });

    it('should update user email', function() {
      return apiClient
        .updateUser(users[1].id, { email: 'bar@example.org' })
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          res.body.data.user.email.should.equal('bar@example.org');
        });
    });

    it('should fail to update user email for duplicated email', function() {
      return apiClient
        .updateUser(users[1].id, { email: users[0].email })
        .then(res => {
          helper.debug(res.body);
          helper.shouldFail(res, 400, '40017', 'Duplicated user email')
        });
    });

    it('should update user fullname', function() {
      return apiClient
        .updateUser(users[0].id, { fullname: 'foo-name' })
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          res.body.data.user.fullname.should.equal('foo-name');
        });
    });

    it('should update user nickname', function() {
      return apiClient
        .updateUser(users[0].id, { nickname: 'foo-nickname' })
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          res.body.data.user.nickname.should.equal('foo-nickname');
        });
    });

    it('should update user gender', function() {
      return apiClient
        .updateUser(users[0].id, { gender: 1 })
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          res.body.data.user.gender.should.equal(1);
        })
        .then(() => apiClient.updateUser(users[0].id, { gender: 2 }))
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          res.body.data.user.gender.should.equal(2);
        });
    });

    it('should update user birthday', function() {
      let birthday = +Date.now();
      return apiClient
        .updateUser(users[0].id, { birthday })
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          res.body.data.user.birthday.should.equal(birthday);
        });
    });

    it('should update user portrait', function() {
      let portrait = 'http://img.example.org/foo/path/to/portrait';
      return apiClient
        .updateUser(users[0].id, { portrait })
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          res.body.data.user.portrait.should.equal(portrait);
        });
    });

    it('should update user info', function() {
      return apiClient
        .updateUser(users[1].id, {
          phone: '11122226666',
          email: 'bar@example.org',
          nickname: 'bar',
          fullname: 'barry',
          gender: 1,
          birthday: +Date.now(),
          portrait: 'http://img.example.org/foo/path/to/portrait'
        })
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          helper.validateObject(res.body.data.user, {
            phone: { equal: '11122226666' },
            email: { equal: 'bar@example.org' },
            nickname: { equal: 'bar' },
            fullname: { equal: 'barry' },
            gender: { equal: 1 },
            birthday: { match: /\d{13}/ },
            portrait: { equal: 'http://img.example.org/foo/path/to/portrait' }
          });
        });
    });

    it('should fail for empty body', function() {
      return apiClient
        .updateUser(users[1].id, {})
        .then(res => {
          helper.debug(res.body);
          helper.shouldFail(res, 400, '40001', /request validation failed/i);
        });
    });

    helper.testUnauthorized({ api: helper.apiV1, path, method });

    helper.testForbidden({ api: helper.apiV1, path, method });

    helper.testNotFound({ api: helper.apiV1, path, method, body: { nickname: 'foo-name' }, resource: 'user' });

  });

  describe('PUT /users/:id/password', function() {

    let path = `/users/${helper.genRandomId()}/password`, method = 'patch';
    let user;

    before(function() {
      return helper
        .createTestUserWithSession({ email: 'foo@example.org', password: '123456' }, {})
        .then(r => user = r.user);
    });

    after(function() {
      return helper.cleanTestUser(user.id);
    });

    it('should update user password', function() {
      let oldPwd;
      return userService.UserModel.findById(user.id).exec()
        .then(usr => {
          oldPwd = usr.password;
        })
        .then(() => apiClient.updateUserPassword(user.id, { old_password: '123456', new_password: '12345678' }))
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          return userService.UserModel.findById(user.id).exec();
        })
        .then(usr => {
          usr.password.should.not.equal(oldPwd);
        });
    });

    it('should fail for invalid old password', function() {
      return apiClient
        .updateUserPassword(user.id, { old_password: '123456', new_password: '1234567890' })
        .then(res => {
          helper.debug(res.body);
          helper.shouldFail(res, 400, '40015', 'Invalid user password');
        });
    });

    it('should revoke user sessions', function() {
      return apiClient
        .updateUserPassword(user.id, { old_password: '12345678', new_password: '1234567890', revoke_sessions: true })
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
        })
        .then(() => apiClient.getUserSessions(user.id))
        .then(res => {
          helper.debug(res.body);
          helper.debug(res.body.data);
          res.should.have.status(200);
          res.body.data.sessions.should.be.an('array').and.have.length(0);
        });
    });

    helper.testUnauthorized({ api: helper.apiV1, path, method });

    helper.testForbidden({ api: helper.apiV1, path, method });

    helper.testNotFound({ api: helper.apiV1, path, method, body: { old_password: '123456', new_password: '1234567' }, resource: 'user' });

  });

  describe('GET /users/:id/sessions', function() {

    let path = `/users/${helper.genRandomId()}/sessions`, method = 'get';
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

    it('should get sessions by user id', function() {
      return apiClient
        .getUserSessions(user.id)
        .then(res => {
          res.should.have.status(200);
          res.body.data.sessions.should.be.an('array').and.have.length(2);
          res.body.data.sessions.forEach(s => {
            helper.validateObject(s, {
              uid: { equal: user.id },
              ttl: { be: 'number' },
              data: { be: 'object' }
            })
          });
        });
    });

    helper.testUnauthorized({ api: helper.apiV1, path, method });

    helper.testForbidden({ api: helper.apiV1, path, method });

    helper.testNotFound({ api: helper.apiV1, path, method, resource: 'user' });

  });

  describe('POST /users/:id/sessions', function() {

    let path = `/users/${helper.genRandomId()}/sessions`, method = 'post';
    let user;

    before(function() {
      return helper
        .createTestUser({ email: 'foo@example.org', password: '123456' })
        .then(r => user = r);
    });

    after(function() {
      return helper.cleanTestUser(user.id);
    });

    it('should create session for user', function() {
      return apiClient.createUserSessions(user.id, {})
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          let d = res.body.data, s = d.session;
          helper.validateObject(s, {
            uid: { equal: user.id },
            token: { match: /[0-9A-Za-z]{64}/ }
          });
        });
    });

    it('should create session for user with extra data', function() {
      return apiClient
        .createUserSessions(user.id, {
          ip: '127.0.0.1',
          ttl: 3600,
          data: { foo: 'foo', bar: 'bar' }
        })
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          let d = res.body.data, s = d.session;
          helper.validateObject(s, {
            uid: { equal: user.id },
            token: { match: /[0-9A-Za-z]{64}/ }
          });
          return apiClient.getSession(s.token);
        })
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          let d = res.body.data, s = d.session;
          helper.validateObject(s, {
            uid: { equal: user.id },
            token: { match: /[0-9A-Za-z]{64}/ },
            ttl: { be: 'number' },
            data: { deepEqual: { foo: 'foo', bar: 'bar' } }
          });
        });
    });

    helper.testUnauthorized({ api: helper.apiV1, path, method });

    helper.testForbidden({ api: helper.apiV1, path, method });

    helper.testNotFound({ api: helper.apiV1, path, method, body: {}, resource: 'user' });

  });

  describe('DELETE /users/:id/sessions', function() {

    let path = `/users/${helper.genRandomId()}/sessions`, method = 'delete';
    let user, sessions, count = 10;

    before(function() {
      return helper
        .createTestUserWithSessions(
          { email: 'foo@example.org', password: '123456' },
          _.range(count).map(s => { return { i: s } })
        )
        .then(r => {
          user = r.user;
          sessions = r.sessions;
        });
    });

    after(function() {
      return helper.cleanTestUser(user.id);
    });

    it('should delete sessions by user id', function() {
      helper.debug(user);
      return apiClient.deleteUserSessions(user.id)
        .then(res => {
          helper.debug(res.body);
          res.should.have.status(200);
          res.body.data.kill.should.equal(count);
        })
        .catch(err => {
          helper.debug(err.response.res.body);
        });
    });

    helper.testUnauthorized({ api: helper.apiV1, path, method });

    helper.testForbidden({ api: helper.apiV1, path, method });

    helper.testNotFound({ api: helper.apiV1, path, method, resource: 'user' });

  });

});