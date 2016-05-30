'use strict';

let config = require('config');
let mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

let logger = require('./logger');

let connString = config.get('connectionString');
let dbConn = mongoose.createConnection(connString);
dbConn.on('error', logger.error.bind(logger, 'mongodb connection error:'));
dbConn.once('open', () => {
  logger.info('mongodb connection opened:', connString);
});

let userSchema = new mongoose.Schema({
  account: String,
  password: String,
  name: String,
  phone: String,
  email: String,
  portrait: String,
  portrait_large: String,
  num_id: Number,
  apps: [String]
});

module.exports.UserModel = dbConn.model('User', userSchema);
