'use strict';

let bcrypt = require('bcrypt');
let config = require('config');

let securitySaltRounds = config.get('security.saltRounds');

/**
 * Middleware to encode password into hash.
 * @param {string} inputField
 * @param {string} outputField
 * @returns {Function}
 */
module.exports = function encodePassword(inputField, outputField) {
  return function (req, res, next) {
    let password = req.body[inputField];
    if (!password) next();

    bcrypt.hash(password, securitySaltRounds, (err, passwordHash) => {
      if (err) return next(err);
      req.body[outputField] = passwordHash;
      return next();
    });
  };
};