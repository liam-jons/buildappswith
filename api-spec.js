module.exports = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'BuildAppsWith API',
      version: '1.0.0',
      description: 'API documentation for the BuildAppsWith platform',
      license: {
        name: 'Private',
        url: 'https://buildappswith.com/terms'
      },
      contact: {
        name: 'BuildAppsWith Support',
        url: 'https://buildappswith.com/support',
        email: 'support@buildappswith.com'
      }
    },
    servers: [
      {
        url: 'https://buildappswith.com/api',
        description: 'Production API'
      },
      {
        url: 'http://localhost:3000/api',
        description: 'Development API'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./app/api/**/*.ts', './lib/*/schemas.ts']
};
