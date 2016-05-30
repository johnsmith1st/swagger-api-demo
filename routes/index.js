'use strict';

/**
 * @swagger
 * /:
 *   x-swagger-router-controller: index
 *   get:
 *     description: Say hello.
 *     operationId: index
 *     responses:
 *       200:
 *         description: OK
 */
module.exports.index = function index(req, res) {
  res.json({
    code: 200,
    message: 'hello swagger api demo'
  });
};
