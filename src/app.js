'use strict';

let path = require('path');
let config = require('config');
let express = require('express');
let swaggerTools = require('swagger-tools');
let logger = require('./logger');
let utils = require('./utils');

let app = express();
let port = config.get('port');

app.use(require('./middleware/request-logger'));
app.use(require('./middleware/api-result'));
app.use(require('./middleware/api-promise'));
app.use(require('./middleware/serv-detect'));
app.use(require('./middleware/serv-gc'));

let swaggerSpec = require('./docs/swagger');
swaggerSpec.host = `${utils.getIpAddress()}:${port}`;

let routeOptions = {
  controllers: path.resolve(__dirname, 'routes')
};

swaggerTools.initializeMiddleware(swaggerSpec, function (middleware) {

  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Provide the security handlers
  app.use(middleware.swaggerSecurity({
    apiKey: require('./middleware/api-key-auth')
  }));

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(routeOptions));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  // Handle not found errors
  app.use(require('./errors').notFoundErrorMiddleware);

  // Handle api errors
  app.use(require('./errors').apiErrorMiddleware);

  // Handle validation errors
  app.use(require('./errors').validationErrorMiddleware);

  // Handle errors
  app.use(require('./errors').defaultErrorMiddleware);

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
