'use strict';

let config = require('config');
let mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

let logger = require('./logger');

let connString = config.get('mongoConnectionStrings.demo');
let dbConn = mongoose.createConnection(connString);
dbConn.on('error', logger.error.bind(logger, 'mongodb connection error:'));
dbConn.once('open', () => {
  logger.info('mongodb connection opened:', connString);
});

let userSchema = new mongoose.Schema({
  phone: { type: String, unique: true, index: true, sparse: true },       // unique phone number
  email: { type: String, unique: true, index: true, sparse: true },       // unique email address
  password: String,                                                       // password
  fullname: String,                                                       // fullname or real name
  nickname: String,                                                       // nickname or display name
  gender: { type: Number, enum: [0, 1, 2], default: 0 },                  // gender (0 for not set, 1 for male, 2 for female)
  birthday: Date,                                                         // birthday
  portrait: String,                                                       // portrait url
  created_at: { type: Date, default: Date.now },                          // creation time
  creation_type: { type: String, enum: ['phone', 'email'] },              // creation type
  del_state: { type: Number, default: 0 }                                 // identify if user is deleted
});

module.exports.UserModel = dbConn.model('User', userSchema);
module.exports.UserDefaultFields = ['id', 'phone', 'email', 'fullname', 'nickname', 'gender', 'birthday', 'portrait', 'created_at' ];
