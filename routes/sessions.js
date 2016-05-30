'use strict';

/**
 * @swagger
 * /sessions/{session_token}:
 *   x-swagger-router-controller: sessions
 *   get:
 *     description: Get session.
 *     operationId: getSession
 *     parameters:
 *       - $ref: "#/parameters/sessionToken"
 *       - $ref: "#/parameters/queryFields"
 *     responses:
 *       200:
 *         $ref: "#/responses/SessionResult"
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *       default:
 *         $ref: "#/responses/Error"
 */
module.exports.getSession = function getSession(req, res) {

};

/**
 * @swagger
 * /sessions/{session_token}/data:
 *   x-swagger-router-controller: sessions
 *   put:
 *     description: Set or replace session data.
 *     operationId: setSessionData
 *     parameters:
 *       - $ref: "#/parameters/sessionToken"
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           properties:
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
 *         description: Not found
 *       500:
 *         description: Internal server error
 *       default:
 *         $ref: "#/responses/Error"
 */
module.exports.setSessionData = function setSessionData(req, res) {

};

/**
 * @swagger
 * /sessions/{session_token}/data:
 *   x-swagger-router-controller: sessions
 *   patch:
 *     description: Update session data.
 *     operationId: updateSessionData
 *     parameters:
 *       - $ref: "#/parameters/sessionToken"
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           properties:
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
 *         description: Not found
 *       500:
 *         description: Internal server error
 *       default:
 *         $ref: "#/responses/Error"
 */
module.exports.updateSessionData = function updateSessionData(req, res) {

};

/**
 * @swagger
 * /sessions/{session_token}:
 *   x-swagger-router-controller: sessions
 *   delete:
 *     description: Delete session.
 *     operationId: deleteSession
 *     parameters:
 *       - $ref: "#/parameters/sessionToken"
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
 *         description: Not found
 *       500:
 *         description: Internal server error
 *       default:
 *         $ref: "#/responses/Error"
 */
module.exports.deleteSession = function deleteSession(req, res) {

};
