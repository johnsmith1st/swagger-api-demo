'use strict';

let router = require('express').Router();

/**
 * Expose node garbage collection via HTTP DELETE /garbage
 */
router.delete('/garbage', function (req, res) {

  if (typeof global.gc !== 'function') {
    return res.status(503).end();
  }

  global.gc();
  res.status(200).end();
  global.gc();

});

module.exports = router;
