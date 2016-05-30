'use strict';

let fs = require('fs');
let express = require('express');
let swaggerJSDoc = require('swagger-jsdoc');
let swaggerTools = require('swagger-tools');
let logger = require('./logger');

let app = express();
let port = 3000;

app.use(require('./request-logger'));

let options = {
  swaggerDefinition: {
    info: {
      title: 'Swagger API demo',
      version: '1.0.0'
    },
    consumes: ['application/json'],
    produces: ['application/json'],
    basePath: '/api/v1',
  },
  // Path to the API docs
  apis: [
    './routes/index.js',
    './routes/users.js',
    './routes/sessions.js',
    './docs/pagination.yml',
    './docs/users.yml',
    './docs/sessions.yml',
    './docs/parameters.yml',
    './docs/responses.yml',
  ]
};

let routeOptions = {
  controllers: './routes',
};

// Initialize swagger-jsdoc -> returns validated swagger spec in json format
let swaggerSpec = swaggerJSDoc(options);

swaggerSpec.securityDefinitions = {
  apiKey: {
    name: 'X-API-KEY',
    type: 'apiKey',
    in: 'header'
  }
};

swaggerTools.initializeMiddleware(swaggerSpec, function (middleware) {

  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(routeOptions));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  // Handle api errors
  app.use(require('./routes/error').apiErrorMiddleware);

  // Handle errors
  app.use(function(err, req, res, next) {
    res.status(500).end(err.message);
  });

  // Start the server
  app.listen(port, (err) => {
    if (err) {
      logger.error(err);
      process.exit(-1);
      return;
    }
    console.log('server is listening on port %d', port);
  });

});
