'use strict';

let ApiError = require('./error').ApiError;

/**
 * @swagger
 * /users:
 *   x-swagger-router-controller: users
 *   get:
 *     description: Query users.
 *     operationId: queryUsers
 *     parameters:
 *       - $ref: "#/parameters/queryUserId"
 *       - $ref: "#/parameters/queryApp"
 *       - $ref: "#/parameters/queryAccount"
 *       - $ref: "#/parameters/queryPassword"
 *       - $ref: "#/parameters/queryPhone"
 *       - $ref: "#/parameters/queryEmail"
 *       - $ref: "#/parameters/pageIndex"
 *       - $ref: "#/parameters/pageSize"
 *       - $ref: "#/parameters/queryFields"
 *     responses:
 *       200:
 *         $ref: "#/responses/UserQueryResult"
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *       default:
 *         $ref: "#/responses/Error"
 */
module.exports.queryUsers = function queryUsers(req, res) {
  res.json({
    message: 'query users, yes'
  });
};

/**
 * @swagger
 * /users:
 *   x-swagger-router-controller: users
 *   post:
 *     description: Create new user.
 *     operationId: createUsers
 *     parameters:
 *       - $ref: "#/parameters/userCreationBody"
 *     responses:
 *       200:
 *         $ref: "#/responses/UserCreationResult"
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *       default:
 *         $ref: "#/responses/Error"
 */
module.exports.createUser = function createUser(req, res) {
  res.json({});
};

/**
 * @swagger
 * /users/{user_id}:
 *   x-swagger-router-controller: users
 *   get:
 *     description: Get user information.
 *     operationId: getUser
 *     parameters:
 *       - $ref: "#/parameters/userId"
 *       - $ref: "#/parameters/queryFields"
 *     responses:
 *       200:
 *         $ref: "#/responses/UserResult"
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *       default:
 *         $ref: "#/responses/Error"
 */
module.exports.getUser = function getUser(req, res, next) {
  next(Error('dame'));
};

/**
 * @swagger
 * /users/{user_id}:
 *   x-swagger-router-controller: users
 *   delete:
 *     description: Delete user.
 *     operationId: deleteUser
 *     parameters:
 *       - $ref: "#/parameters/userId"
 *     responses:
 *       200:
 *         $ref: "#/responses/Done200"
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *       default:
 *         $ref: "#/responses/Error"
 */
module.exports.deleteUser = function deleteUser(req, res, next) {
  next(new ApiError(403, 'Forbidden'));
};

/**
 * @swagger
 * /users/{user_id}:
 *   x-swagger-router-controller: users
 *   patch:
 *     description: Update user.
 *     operationId: updateUser
 *     parameters:
 *       - $ref: "#/parameters/userId"
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           minProperties: 1
 *           additionalProperties: true
 *           properties:
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *             portrait:
 *               type: string
 *             portrait_large:
 *               type: string
 *             data:
 *               type: object
 *     responses:
 *       200:
 *         $ref: "#/responses/Done200"
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *       default:
 *         $ref: "#/responses/Error"
 */
module.exports.updateUser = function updateUser(req, res) {

};

/**
 * @swagger
 * /users/{user_id}/pwd:
 *   x-swagger-router-controller: users
 *   patch:
 *     description: Update user password.
 *     operationId: updateUserPassword
 *     parameters:
 *       - $ref: "#/parameters/userId"
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           required:
 *             - old_password
 *             - new_password
 *           properties:
 *             old_password:
 *               type: string
 *             new_password:
 *               type: string
 *             revoke_sessions:
 *               type: boolean
 *               default: false
 *     responses:
 *       200:
 *         $ref: "#/responses/Done200"
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *       default:
 *         $ref: "#/responses/Error"
 */
module.exports.updateUserPassword = function updateUserPassword(req, res) {

};

/**
 * @swagger
 * /users/{user_id}/sessions:
 *   x-swagger-router-controller: users
 *   get:
 *     description: Get user sessions.
 *     operationId: getUserSessions
 *     parameters:
 *       - $ref: "#/parameters/userId"
 *     responses:
 *       200:
 *         $ref: "#/responses/SessionQueryResult"
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *       default:
 *         $ref: "#/responses/Error"
 */
module.exports.getUserSessions = function getUserSessions(req, res) {

};

/**
 * @swagger
 * /users/{user_id}/sessions:
 *   x-swagger-router-controller: users
 *   post:
 *     description: Create user sessions.
 *     operationId: createUserSession
 *     parameters:
 *       - $ref: "#/parameters/userId"
 *       - $ref: "#/parameters/sessionCreationBody"
 *     responses:
 *       200:
 *         $ref: "#/responses/SessionCreationResult"
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *       default:
 *         $ref: "#/responses/Error"
 */
module.exports.createUserSession = function createUserSession(req, res) {

};
