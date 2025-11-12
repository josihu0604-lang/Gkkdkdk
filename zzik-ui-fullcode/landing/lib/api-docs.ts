/**
 * OpenAPI/Swagger Documentation Generator
 * Automatic API documentation for all endpoints
 */

/**
 * OpenAPI 3.0 Specification
 */
export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'ZZIK Platform API',
    version: '1.0.0',
    description: 'RESTful API for ZZIK - Location-based rewards platform with USDC on Base',
    contact: {
      name: 'ZZIK Support',
      email: 'support@zzik.app',
      url: 'https://zzik.app',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'https://zzik.app/api',
      description: 'Production server',
    },
    {
      url: 'http://localhost:3001/api',
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Users', description: 'User management endpoints' },
    { name: 'Places', description: 'Place management endpoints' },
    { name: 'Check-ins', description: 'Check-in operations' },
    { name: 'Vouchers', description: 'Voucher management' },
    { name: 'Reviews', description: 'Review operations' },
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Health', description: 'Health check endpoints' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns the health status of the API',
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                    version: { type: 'string', example: '1.0.0' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        description: 'Returns user profile with statistics',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'User ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'User found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '429': {
            description: 'Too many requests',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update user profile',
        description: 'Updates user profile information',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'User ID',
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserUpdate' },
            },
          },
        },
        responses: {
          '200': {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationError' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '409': {
            description: 'Username already taken',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
        security: [{ bearerAuth: [] }],
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user account',
        description: 'Soft deletes user account (anonymizes data)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'User ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'User deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'User login',
        description: 'Authenticates user and returns JWT tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'User signup',
        description: 'Creates new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'username'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password', minLength: 8 },
                  username: { type: 'string', minLength: 3, maxLength: 30 },
                  displayName: { type: 'string', maxLength: 50 },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Account created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationError' },
              },
            },
          },
          '409': {
            description: 'Email or username already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/vitals': {
      post: {
        tags: ['Health'],
        summary: 'Submit Web Vitals',
        description: 'Submits Core Web Vitals metrics for monitoring',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WebVitalsPayload' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Vitals recorded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'user_123abc' },
          walletAddress: { type: 'string', example: '0x1234...5678' },
          username: { type: 'string', example: 'alice' },
          email: { type: 'string', format: 'email', example: 'alice@example.com' },
          displayName: { type: 'string', example: 'Alice Smith' },
          bio: { type: 'string', example: 'Love exploring new places!' },
          avatarUrl: { type: 'string', format: 'uri', example: 'https://example.com/avatar.jpg' },
          level: { type: 'integer', example: 5 },
          totalPoints: { type: 'integer', example: 1250 },
          currentStreak: { type: 'integer', example: 7 },
          longestStreak: { type: 'integer', example: 15 },
          createdAt: { type: 'string', format: 'date-time' },
          stats: {
            type: 'object',
            properties: {
              checkInCount: { type: 'integer', example: 42 },
              voucherCount: { type: 'integer', example: 12 },
              reviewCount: { type: 'integer', example: 8 },
            },
          },
        },
      },
      UserUpdate: {
        type: 'object',
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 30 },
          displayName: { type: 'string', minLength: 1, maxLength: 50 },
          bio: { type: 'string', maxLength: 500 },
          avatarUrl: { type: 'string', format: 'uri' },
          email: { type: 'string', format: 'email' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          user: { $ref: '#/components/schemas/User' },
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
      WebVitalsPayload: {
        type: 'object',
        required: ['url', 'vitals', 'userAgent', 'timestamp'],
        properties: {
          url: { type: 'string', format: 'uri' },
          vitals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', enum: ['FCP', 'LCP', 'CLS', 'FID', 'INP', 'TTFB'] },
                value: { type: 'number' },
                rating: { type: 'string', enum: ['good', 'needs-improvement', 'poor'] },
                id: { type: 'string' },
              },
            },
          },
          userAgent: { type: 'string' },
          timestamp: { type: 'number' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Resource not found' },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Validation failed' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token from /auth/login or /auth/signup',
      },
    },
  },
};

/**
 * Generate OpenAPI JSON
 */
export function getOpenApiJson(): string {
  return JSON.stringify(openApiSpec, null, 2);
}

/**
 * Generate Swagger UI HTML
 */
export function getSwaggerUiHtml(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZZIK API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui.css">
  <style>
    body {
      margin: 0;
      padding: 0;
    }
    .topbar {
      display: none;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        spec: ${JSON.stringify(openApiSpec)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true,
        showExtensions: true,
      });
      
      window.ui = ui;
    };
  </script>
</body>
</html>
  `.trim();
}
