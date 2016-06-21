'use strict';

let router = require('express').Router();

/**
 * Expose server availability test via HTTP HEAD /
 */
router.head('/', function (req, res) {
  res.status(200).end();
});

module.exports = router;
