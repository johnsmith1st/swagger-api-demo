'use strict';

let _ = require('lodash');
let bcrypt = require('bcrypt');
let config = require('config');
let Promise = require('bluebird');
let mongoose = require('mongoose');

let sessionService = require('./session-service');
let UserModel = require('../models').UserModel;
let UserDefaultFields = require('../models').UserDefaultFields;
let NotFoundError = require('../errors').NotFoundError;
let ApiError = require('../errors').ApiError;
let logger = require('../logger');

/**
 * Assign specific values from source to target object.
 * @private
 */
function _assign(target, source, fields) {
  return _.assign(target, _.pick(source, fields));
}

/**
 * Return user object from service layer.
 * @param model
 * @param {Array} [fields]
 * @returns {object}
 * @private
 */
function _returnUserInfo(model, fields) {
  return _.pick({
    id: model.id,
    email: model.email,
    phone: model.phone,
    fullname: model.fullname,
    nickname: model.nickname,
    gender: model.gender,
    birthday: model.birthday && model.birthday.getTime(),
    portrait: model.portrait,
    tags: model.tags,
    created_at: model.created_at && model.birthday.getTime()
  }, fields || UserDefaultFields);
}

/**
 * Guess id type.
 * @param {string} id
 * @returns {string}
 * @private
 */
function _guessIdType(id) {
  if (/^[0-9A-Za-z]{64}$/i.test(id)) return 'token';
  if (/^[a-f\d]{24}$/i.test(id)) return 'objectId';
  if (/^\d{11}$/.test(id)) return 'phone';
  if (/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(id)) return 'email';
  return '?';
}

/**
 * Get user from repository by id, phone or email.
 * @param {string} id
 * @param {string} [type] id type, * for any valid type
 * @private
 */
function _getUserFromRepository(id, type) {

  let condition = { activated: true }, query;
  let idType = (type && typeof type === 'string' && type.length)
    ? ('*' === type ? _guessIdType(id) : type)
    : 'objectId';

  switch(idType) {
    case 'phone':
      condition.phone = id;
      break;
    case 'email':
      condition.email = id;
      break;
    default:
      query = UserModel.findById(id);
      break;
  }

  query = query || UserModel.findOne(condition);

  return query
    .exec()
    .then(user => {
      if (!user) throw NotFoundError.UserNotFound(id);
      return user;
    })
    .catch(err => {
      if (err.name === 'CastError' && err.kind === 'ObjectId')
        throw NotFoundError.UserNotFound(id);
      throw err;
    });
}

/**
 * Validate password.
 * @param user
 * @param {string} password
 * @private
 */
function _validateUserByPassword(user, password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (err, res) => {
      if (err) return reject(err);
      if (!res) return reject(ApiError.InvalidUserPassword);
      return resolve(user);
    });
  });
}

/**
 * Query users.
 * @param {object} query
 * @param {string|Array} [query.id]
 * @param {string} [query.phone]
 * @param {string} [query.email]
 * @param {number} [query.pageIndex]
 * @param {number} [query.pageSize]
 * @param {Array} [query.fields]
 */
function queryUsers(query) {

  let condition = {};

  try {
    if (query.id && typeof query.id === 'string' && query.id.length) condition._id = mongoose.Types.ObjectId(query.id);
    else if (query.id && Array.isArray(query.id) && query.id.length) condition._id = { $in: query.id };
  }
  catch(err) {
    return Promise.reject(ApiError.InvalidUserId);
  }

  if (query.phone) condition.phone = query.phone;
  if (query.email) condition.email = query.email;

  let q = UserModel.find(condition), count = false, size = 10;

  if (query.pageIndex) {
    size = query.pageSize || size;
    let skip = ((query.pageIndex - 1) * size);
    q = q.skip(skip).limit(size);
    count = true;
  }

  let fields = (query.fields && Array.isArray(query.fields) && query.fields.length)
    ? _.intersection(UserDefaultFields, query.fields)
    : UserDefaultFields;

  q = q.select(fields.join(' '));

  return Promise
    .all([
      q.exec(),
      count ? UserModel.find(condition).count() : Promise.resolve(0)
    ])
    .then(r => {
      let result = {
        users: r[0] && r[0].map(s => _returnUserInfo(s, fields))
      };
      if (count) {
        result.pagination = {
          pageIndex: query.pageIndex,
          pageSize: size,
          totalPageCount: Math.ceil(r[1] / size),
          totalItemCount: r[1]
        };
      }
      return result;
    });
}

/**
 * Create user.
 * @param {object} params
 * @param {string} [params.phone]
 * @param {string} [params.email]
 * @param {string} [params.password]
 * @param {string} [params.encoded_password]
 * @param {string} [params.fullname]
 * @param {string} [params.nickname]
 * @param {number} [params.gender]
 * @param {number} [params.birthday]
 * @param {number} [params.portrait]
 * @return Promise
 */
function createUser(params) {

  let creation_type;

  // validate creation type
  if (params.email) creation_type = 'email';
  else if (params.phone) creation_type = 'phone';
  else return Promise.reject(ApiError.RequireUserAccount);

  // password is required when create by email
  if (creation_type === 'email' && !(params.password))
    return Promise.reject(ApiError.RequireUserPassword);

  // set fields to model
  let user = new UserModel();
  user.creation_type = creation_type;
  user = _assign(user, params, ['email', 'phone', 'fullname', 'nickname', 'gender', 'birthday', 'portrait']);

  // set password
  if (params.encoded_password) user.password = params.encoded_password;

  return user.save()
    .then(usr => _returnUserInfo(usr))
    .catch(err => {
      if (err.name === 'MongoError' && /duplicate.*phone/.test(err.message))
        return Promise.reject(ApiError.DuplicatedUserPhone);
      if (err.name === 'MongoError' && /duplicate.*email/.test(err.message))
        return Promise.reject(ApiError.DuplicatedUserEmail);
      throw err;
    });
}

/**
 * Get user by id, token, phone or email.
 * @param {string} id
 * @param {Array} fields
 */
function getUser(id, fields) {

  let idType = _guessIdType(id);
  let getUserAsync = (idType === 'token')
    ? sessionService.getSession(id).then(session => _getUserFromRepository(session.uid))
    : _getUserFromRepository(id, '*');

  return getUserAsync
    .then(user => {
      return _returnUserInfo(
        user,
        (fields && fields.length)
          ? _.intersection(fields, UserDefaultFields)
          : UserDefaultFields
      );
    });
}

/**
 * Update user.
 * @param {string} id
 * @param {object} params
 * @param {string} [params.phone]
 * @param {string} [params.email]
 * @param {string} [params.fullname]
 * @param {string} [params.nickname]
 * @param {string} [params.portrait]
 * @param {number} [params.gender]
 * @param {number} [params.birthday]
 */
function updateUser(id, params) {
  return _getUserFromRepository(id)
    .then(user => {
      user = _assign(user, params, ['phone', 'email', 'fullname', 'nickname', 'portrait', 'gender', 'birthday']);
      return user.save();
    })
    .then(user => _returnUserInfo(user, UserDefaultFields))
    .catch(err => {
      if (err.name === 'MongoError' && /duplicate.*phone/.test(err.message))
        return Promise.reject(ApiError.DuplicatedUserPhone);
      if (err.name === 'MongoError' && /duplicate.*email/.test(err.message))
        return Promise.reject(ApiError.DuplicatedUserEmail);
      throw err;
    });
}

/**
 * Update user password.
 * @param {string} id
 * @param {object} params
 * @param {string} params.old_password
 * @param {string} params.new_password
 * @param {string} params.encoded_new_password
 * @param {boolean} [params.revokeSessions]
 */
function updateUserPassword(id, params) {
  return _getUserFromRepository(id)
    .then(user => {
      return user.password
        ? _validateUserByPassword(user, params.old_password)  // validate password
        : user;                                               // password not set
    })
    .then(user => {
      user.password = params.encoded_new_password;
      return user.save();
    })
    .then(user => {
      return (params.revokeSessions)
        ? sessionService.deleteUserSessions(id).thenReturn(user)
        : Promise.resolve(user);
    })
    .then(user => _returnUserInfo(user));
}

/**
 * Delete user by id (not actually delete from db).
 * @param {string} id
 */
function deleteUser(id) {
  return _getUserFromRepository(id)
    .then(user => {
      user.del_state = 1;
      return user.save();
    })
    .then(user => user.del_state);
}

/**
 * Validate user password.
 * @param {string} id
 * @param {string} password
 */
function validateUserPassword(id, password) {

  if (!password)
    return Promise.reject(ApiError.InvalidUserPassword);

  // check id type to avoid id is the object id
  let idType = _guessIdType(id);
  if (idType !== 'phone' && idType !== 'email')
    return Promise.reject(ApiError.InvalidUserAccount);

  return _getUserFromRepository(id, idType)
    .then(user => _validateUserByPassword(user, password))
    .then(user => _returnUserInfo(user));
}

module.exports.queryUsers = queryUsers;
module.exports.createUser = createUser;
module.exports.getUser = getUser;
module.exports.updateUser = updateUser;
module.exports.deleteUser = deleteUser;
module.exports.updateUserPassword = updateUserPassword;
module.exports.validateUserPassword = validateUserPassword;
module.exports.UserModel = UserModel;
