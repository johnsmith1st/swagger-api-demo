'use strict';

let tracer = require('tracer');

let logger = tracer.colorConsole({
  format: [
    `[{{title}}] ({{file}}:{{line}}) {{message}}`,
    {
      error: `[{{title}}] ({{file}}:{{line}}) {{message}}\nCall Stack:\n{{stack}}`
    }
  ],
  level: 'debug'
});

module.exports = logger;
