'use strict';

let Promise = require('bluebird');
let redis = require('redis');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

const _default = Symbol();

/**
 * Host redis clients.
 */
class RedisManager {

  /**
   * @constructor
   */
  constructor() {
    this._clients = new Map();
  }

  /**
   * Create redis client.
   * @param config
   * @param {function} [onCreated]
   * @returns {redis}
   */
  create(config, onCreated) {

    config.options = config.options || {};
    let key = `${config.host}:${config.port}`;
    if (this._clients.has(key)) return this._clients.get(key);

    let client = redis.createClient(config.port, config.host, config.options);
    this._clients.set(key, client);

    if (typeof onCreated === 'function') onCreated(client);
    return client;
  }

  /**
   * Get default instance.
   * @returns {RedisManager}
   */
  static get default() {
    if (!RedisManager[_default])
      RedisManager[_default] = new RedisManager();
    return RedisManager[_default];
  }

}

module.exports = RedisManager;
