'use strict';

let chai = require('chai');
let chaiHttp = require('chai-http');
let Promise = require('bluebird');
let helper = require('./helper');

chai.use(chaiHttp);
chai.request.addPromises(Promise);

let apiV1 = helper.apiV1;
let apiKey = helper.apiKey;

module.exports.getUsers = function getUsers(query) {
  return chai.request(apiV1).get('/users').set('X-API-KEY', apiKey).query(query || {});
};

module.exports.createUser = function createUser(body) {
  return chai.request(apiV1).post('/users').set('X-API-KEY', apiKey).send(body || {});
};

module.exports.getUser = function getUser(uid, query) {
  return chai.request(apiV1).get(`/users/${uid}`).set('X-API-KEY', apiKey).query(query || {});
};

module.exports.deleteUser = function deleteUser(uid) {
  return chai.request(apiV1).delete(`/users/${uid}`).set('X-API-KEY', apiKey);
};

module.exports.updateUser = function updateUser(uid, body) {
  return chai.request(apiV1).put(`/users/${uid}`).set('X-API-KEY', apiKey).send(body || {});
};

module.exports.updateUserPassword = function updateUserPassword(uid, body) {
  return chai.request(apiV1).put(`/users/${uid}/password`).set('X-API-KEY', apiKey).send(body || {});
};

module.exports.getUserSessions = function getUserSessions(uid) {
  return chai.request(apiV1).get(`/users/${uid}/sessions`).set('X-API-KEY', apiKey);
};

module.exports.createUserSessions = function getUserSessions(uid, body) {
  return chai.request(apiV1).post(`/users/${uid}/sessions`).set('X-API-KEY', apiKey).send(body || {});
};

module.exports.deleteUserSessions = function deleteUserSessions(uid) {
  return chai.request(apiV1).delete(`/users/${uid}/sessions`).set('X-API-KEY', apiKey);
};

module.exports.getSession = function getSession(token) {
  return chai.request(apiV1).get(`/sessions/${token}`).set('X-API-KEY', apiKey);
};

module.exports.updateSession = function updateSession(token, data) {
  return chai.request(apiV1).put(`/sessions/${token}/data`).set('X-API-KEY', apiKey).send({ data });
};

module.exports.deleteSession = function deleteSession(token) {
  return chai.request(apiV1).delete(`/sessions/${token}`).set('X-API-KEY', apiKey);
};

module.exports.basicAuth = function basicAuth(body) {
  return chai.request(apiV1).post('/auth').set('X-API-KEY', apiKey).send(body || {});
};

