/**
 * OpenAPI 3.0 Specification for ZZIK API
 * 
 * Auto-generated API documentation following OpenAPI 3.0 standard.
 * View at: /api/docs
 */

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'ZZIK API',
    version: '1.0.0',
    description: 'GPS-verified check-in system with blockchain-based voucher rewards on Base Network',
    contact: {
      name: 'ZZIK Team',
      email: 'api@zzik.app',
      url: 'https://zzik.app',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'https://zzik.app',
      description: 'Production server',
    },
    {
      url: 'http://localhost:3001',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Check-in',
      description: 'GPS-verified check-in operations',
    },
    {
      name: 'Places',
      description: 'Place information and discovery',
    },
    {
      name: 'Health',
      description: 'System health and monitoring',
    },
  ],
  paths: {
    '/api/check-in': {
      post: {
        tags: ['Check-in'],
        summary: 'Submit check-in request',
        description: 'Verify GPS location and Wi-Fi data to validate check-in at a place. Returns voucher on successful verification.',
        operationId: 'checkIn',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CheckInRequest',
              },
              example: {
                user_id: 'user-001',
                place_id: 'place-001',
                location: {
                  latitude: 37.4979,
                  longitude: 127.0276,
                  accuracy: 5,
                },
                wifi: {
                  ssids: ['DropTop_Guest', 'DropTop_5G'],
                },
                timestamp: '2024-01-15T10:30:00.000Z',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Check-in successful',
            headers: {
              'X-Processing-Time': {
                schema: { type: 'string' },
                description: 'Request processing time in milliseconds',
              },
              'X-RateLimit-Limit': {
                schema: { type: 'integer' },
                description: 'Rate limit capacity',
              },
              'X-RateLimit-Remaining': {
                schema: { type: 'integer' },
                description: 'Remaining requests in current window',
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CheckInResponse',
                },
              },
            },
          },
          '400': {
            description: 'Invalid request data',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  success: false,
                  error: 'Invalid latitude: must be between -90 and 90',
                  code: 'INVALID_COORDINATES',
                },
              },
            },
          },
          '404': {
            description: 'Place not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '429': {
            description: 'Rate limit exceeded',
            headers: {
              'Retry-After': {
                schema: { type: 'integer' },
                description: 'Seconds until rate limit resets',
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/places': {
      get: {
        tags: ['Places'],
        summary: 'List all places',
        description: 'Retrieve list of all available check-in places with optional filtering',
        operationId: 'listPlaces',
        parameters: [
          {
            name: 'id',
            in: 'query',
            description: 'Specific place ID to retrieve',
            schema: { type: 'string' },
          },
          {
            name: 'category',
            in: 'query',
            description: 'Filter by place category',
            schema: { 
              type: 'string',
              enum: ['cafe', 'restaurant', 'retail', 'entertainment', 'other'],
            },
          },
          {
            name: 'bounds',
            in: 'query',
            description: 'Geo-spatial bounding box (JSON)',
            schema: { type: 'string' },
            example: '{"north":37.52,"south":37.48,"east":127.06,"west":127.02}',
          },
        ],
        responses: {
          '200': {
            description: 'List of places',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PlacesResponse',
                },
              },
            },
          },
          '404': {
            description: 'Place not found (when querying by ID)',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'System health status and dependency checks',
        operationId: 'healthCheck',
        responses: {
          '200': {
            description: 'System is healthy',
            headers: {
              'X-Response-Time': {
                schema: { type: 'string' },
                description: 'Response time in milliseconds',
              },
              'Cache-Control': {
                schema: { type: 'string' },
                description: 'Caching policy (no-cache, no-store, must-revalidate)',
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
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
      CheckInRequest: {
        type: 'object',
        required: ['user_id', 'place_id', 'location', 'timestamp'],
        properties: {
          user_id: {
            type: 'string',
            description: 'User identifier',
            example: 'user-001',
          },
          place_id: {
            type: 'string',
            description: 'Place identifier',
            example: 'place-001',
          },
          location: {
            $ref: '#/components/schemas/Location',
          },
          wifi: {
            $ref: '#/components/schemas/WiFiData',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Check-in timestamp (ISO 8601)',
            example: '2024-01-15T10:30:00.000Z',
          },
        },
      },
      Location: {
        type: 'object',
        required: ['latitude', 'longitude', 'accuracy'],
        properties: {
          latitude: {
            type: 'number',
            format: 'double',
            minimum: -90,
            maximum: 90,
            description: 'GPS latitude',
            example: 37.4979,
          },
          longitude: {
            type: 'number',
            format: 'double',
            minimum: -180,
            maximum: 180,
            description: 'GPS longitude',
            example: 127.0276,
          },
          accuracy: {
            type: 'number',
            format: 'double',
            minimum: 0,
            description: 'GPS accuracy in meters',
            example: 5,
          },
        },
      },
      WiFiData: {
        type: 'object',
        properties: {
          ssids: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of detected Wi-Fi SSIDs',
            example: ['DropTop_Guest', 'DropTop_5G'],
          },
        },
      },
      CheckInResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            properties: {
              check_in: {
                $ref: '#/components/schemas/CheckIn',
              },
              integrity: {
                $ref: '#/components/schemas/IntegrityScore',
              },
              voucher: {
                $ref: '#/components/schemas/Voucher',
              },
            },
          },
        },
      },
      CheckIn: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'checkin-12345',
          },
          status: {
            type: 'string',
            enum: ['approved', 'rejected', 'pending'],
            example: 'approved',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      IntegrityScore: {
        type: 'object',
        properties: {
          score: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            description: 'Overall GPS integrity score (0-100, threshold: 60)',
            example: 85,
          },
          breakdown: {
            type: 'object',
            properties: {
              distance: {
                type: 'integer',
                description: 'Distance-based score (0-40 points)',
                example: 38,
              },
              wifi: {
                type: 'integer',
                description: 'Wi-Fi matching score (0-25 points)',
                example: 25,
              },
              time: {
                type: 'integer',
                description: 'Timing score (0-15 points)',
                example: 15,
              },
              accuracy: {
                type: 'integer',
                description: 'GPS accuracy score (0-10 points)',
                example: 7,
              },
              speed: {
                type: 'integer',
                description: 'Speed/movement score (0-10 points)',
                example: 0,
              },
            },
          },
        },
      },
      Voucher: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['percentage', 'fixed', 'points'],
            example: 'percentage',
          },
          value: {
            type: 'number',
            example: 15,
          },
          description: {
            type: 'string',
            example: '15% off any purchase',
          },
          expiresAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      PlacesResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            properties: {
              places: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Place',
                },
              },
              count: {
                type: 'integer',
                example: 10,
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
        },
      },
      Place: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'place-001',
          },
          name: {
            type: 'string',
            example: 'DropTop Seoul',
          },
          category: {
            type: 'string',
            enum: ['cafe', 'restaurant', 'retail', 'entertainment', 'other'],
            example: 'cafe',
          },
          location: {
            $ref: '#/components/schemas/Location',
          },
          address: {
            type: 'object',
            properties: {
              full: { type: 'string' },
              city: { type: 'string' },
              district: { type: 'string' },
              country: { type: 'string' },
            },
          },
          wifi: {
            $ref: '#/components/schemas/WiFiData',
          },
          vouchers: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Voucher',
            },
          },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['healthy', 'degraded', 'unhealthy'],
                example: 'healthy',
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
              uptime: {
                type: 'number',
                description: 'Process uptime in seconds',
                example: 86400,
              },
              version: {
                type: 'string',
                example: '1.0.0',
              },
              environment: {
                type: 'string',
                enum: ['development', 'production', 'test'],
                example: 'production',
              },
              checks: {
                type: 'object',
                properties: {
                  database: {
                    $ref: '#/components/schemas/HealthCheck',
                  },
                  cache: {
                    $ref: '#/components/schemas/HealthCheck',
                  },
                  api: {
                    $ref: '#/components/schemas/HealthCheck',
                  },
                },
              },
            },
          },
        },
      },
      HealthCheck: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['healthy', 'degraded', 'unhealthy'],
            example: 'healthy',
          },
          responseTime: {
            type: 'number',
            description: 'Response time in milliseconds',
            example: 15,
          },
          message: {
            type: 'string',
            description: 'Status message (present if not healthy)',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
            example: 'Invalid request data',
          },
          code: {
            type: 'string',
            example: 'VALIDATION_ERROR',
          },
          details: {
            type: 'object',
            description: 'Additional error details (optional)',
          },
        },
      },
    },
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for authenticated requests',
      },
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for service-to-service communication',
      },
    },
  },
  security: [],
};

/**
 * Generate OpenAPI JSON response
 */
export function getOpenApiJson(): string {
  return JSON.stringify(openApiSpec, null, 2);
}

/**
 * Generate Swagger UI HTML
 */
export function getSwaggerUI(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZZIK API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui.css" />
  <style>
    body { margin: 0; padding: 0; }
    .topbar { display: none; }
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
        layout: "StandaloneLayout"
      });
      window.ui = ui;
    };
  </script>
</body>
</html>
  `.trim();
}
