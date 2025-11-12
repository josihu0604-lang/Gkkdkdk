/**
 * ZZIK Platform API Documentation
 * OpenAPI 3.0 Specification for all REST endpoints
 */

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'ZZIK Platform API',
    version: '1.0.0',
    description: 'RESTful API for ZZIK - Location-based rewards and check-in platform with blockchain integration',
    contact: {
      name: 'ZZIK Development Team',
      url: 'https://zzik.io',
      email: 'dev@zzik.io',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'https://api.zzik.io',
      description: 'Production server',
    },
    {
      url: 'http://localhost:3001',
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Users', description: 'User management and profiles' },
    { name: 'Places', description: 'Location and venue operations' },
    { name: 'Check-ins', description: 'Check-in operations with GPS validation' },
    { name: 'Vouchers', description: 'Voucher issuance and redemption' },
    { name: 'Reviews', description: 'Review creation, moderation, and voting' },
    { name: 'Leaderboard', description: 'User rankings and statistics' },
    { name: 'Admin', description: 'Administrative operations' },
  ],
  paths: {
    // ========================================================================
    // USERS ENDPOINTS
    // ========================================================================
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        description: 'Retrieve detailed user profile information',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'User ID',
          },
        ],
        responses: {
          '200': {
            description: 'User found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update user profile',
        description: 'Update user profile information (requires authentication)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'User updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Soft delete user',
        description: 'Mark user as deleted (soft delete)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'User deleted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ========================================================================
    // PLACES ENDPOINTS
    // ========================================================================
    '/api/places': {
      get: {
        tags: ['Places'],
        summary: 'List places',
        description: 'Get places with optional filtering and spatial search',
        parameters: [
          {
            name: 'lat',
            in: 'query',
            schema: { type: 'number' },
            description: 'Latitude for nearby search',
          },
          {
            name: 'lng',
            in: 'query',
            schema: { type: 'number' },
            description: 'Longitude for nearby search',
          },
          {
            name: 'radius',
            in: 'query',
            schema: { type: 'number', default: 5 },
            description: 'Search radius in kilometers',
          },
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by category',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 50, maximum: 100 },
            description: 'Maximum number of results',
          },
        ],
        responses: {
          '200': {
            description: 'Places list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PlacesListResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Places'],
        summary: 'Create place',
        description: 'Create a new place (requires admin role)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePlaceRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Place created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PlaceResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '429': { $ref: '#/components/responses/RateLimitExceeded' },
        },
      },
    },
    '/api/places/{id}': {
      get: {
        tags: ['Places'],
        summary: 'Get place by ID',
        description: 'Retrieve detailed place information',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Place found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PlaceResponse' },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ========================================================================
    // CHECK-INS ENDPOINTS
    // ========================================================================
    '/api/check-ins': {
      get: {
        tags: ['Check-ins'],
        summary: 'List check-ins',
        description: 'Get check-ins with optional filtering',
        parameters: [
          {
            name: 'userId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by user',
          },
          {
            name: 'placeId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by place',
          },
          {
            name: 'status',
            in: 'query',
            schema: { 
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED'],
            },
            description: 'Filter by status',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20 },
          },
          {
            name: 'cursor',
            in: 'query',
            schema: { type: 'string' },
            description: 'Pagination cursor',
          },
        ],
        responses: {
          '200': {
            description: 'Check-ins list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CheckInsListResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Check-ins'],
        summary: 'Create check-in',
        description: 'Submit a new check-in with GPS validation',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCheckInRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Check-in created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CheckInResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '429': { $ref: '#/components/responses/RateLimitExceeded' },
        },
      },
    },

    // ========================================================================
    // VOUCHERS ENDPOINTS
    // ========================================================================
    '/api/vouchers': {
      get: {
        tags: ['Vouchers'],
        summary: 'List vouchers',
        description: 'Get vouchers with filtering',
        parameters: [
          {
            name: 'userId',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'placeId',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['ACTIVE', 'REDEEMED', 'EXPIRED'],
            },
          },
        ],
        responses: {
          '200': {
            description: 'Vouchers list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VouchersListResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Vouchers'],
        summary: 'Issue voucher',
        description: 'Create a new voucher (admin only)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateVoucherRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Voucher created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VoucherResponse' },
              },
            },
          },
        },
      },
    },
    '/api/vouchers/{id}/redeem': {
      post: {
        tags: ['Vouchers'],
        summary: 'Redeem voucher',
        description: 'Redeem an active voucher',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Voucher redeemed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VoucherResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ========================================================================
    // REVIEWS ENDPOINTS
    // ========================================================================
    '/api/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'List reviews',
        description: 'Get reviews with filtering and pagination',
        parameters: [
          {
            name: 'placeId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by place',
          },
          {
            name: 'userId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by user',
          },
          {
            name: 'minRating',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 5 },
            description: 'Minimum rating filter',
          },
          {
            name: 'maxRating',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 5 },
            description: 'Maximum rating filter',
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['recent', 'helpful', 'rating'],
              default: 'recent',
            },
            description: 'Sort order',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, maximum: 100 },
          },
          {
            name: 'cursor',
            in: 'query',
            schema: { type: 'string' },
            description: 'Pagination cursor',
          },
        ],
        responses: {
          '200': {
            description: 'Reviews list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewsListResponse' },
              },
            },
          },
          '429': { $ref: '#/components/responses/RateLimitExceeded' },
        },
      },
      post: {
        tags: ['Reviews'],
        summary: 'Create review',
        description: 'Submit a new review (requires prior check-in)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateReviewRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Review created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '403': {
            description: 'No check-in found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Review already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '429': { $ref: '#/components/responses/RateLimitExceeded' },
        },
      },
    },
    '/api/reviews/{id}': {
      get: {
        tags: ['Reviews'],
        summary: 'Get review by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Review found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewResponse' },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Reviews'],
        summary: 'Update review',
        description: 'Update own review',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateReviewRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Review updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewResponse' },
              },
            },
          },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Reviews'],
        summary: 'Delete review',
        description: 'Soft delete own review',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'userId',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Review deleted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/reviews/{id}/moderate': {
      post: {
        tags: ['Reviews'],
        summary: 'Moderate review',
        description: 'Admin moderation actions (approve, reject, hide, unhide)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ModerateReviewRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Review moderated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewResponse' },
              },
            },
          },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/reviews/{id}/helpful': {
      post: {
        tags: ['Reviews'],
        summary: 'Mark review as helpful',
        description: 'Add a helpful vote to a review',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: {
                  userId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Vote recorded',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewResponse' },
              },
            },
          },
          '403': {
            description: 'Cannot vote on own review',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Already voted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Reviews'],
        summary: 'Remove helpful vote',
        description: 'Remove a helpful vote from a review',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'userId',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Vote removed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewResponse' },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ========================================================================
    // LEADERBOARD ENDPOINT
    // ========================================================================
    '/api/leaderboard': {
      get: {
        tags: ['Leaderboard'],
        summary: 'Get leaderboard',
        description: 'Get top users by points',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 50, maximum: 100 },
          },
        ],
        responses: {
          '200': {
            description: 'Leaderboard data',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LeaderboardResponse' },
              },
            },
          },
        },
      },
    },
  },

  // ==========================================================================
  // COMPONENTS - Schemas, Responses, Security
  // ==========================================================================
  components: {
    schemas: {
      // Success/Error responses
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
          details: { type: 'array', items: { type: 'object' } },
        },
      },

      // User schemas
      UserResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { $ref: '#/components/schemas/User' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          walletAddress: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string' },
          displayName: { type: 'string' },
          avatar: { type: 'string' },
          level: { type: 'integer' },
          totalPoints: { type: 'integer' },
          totalCheckIns: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          displayName: { type: 'string', minLength: 2, maxLength: 50 },
          avatar: { type: 'string', format: 'uri' },
          bio: { type: 'string', maxLength: 500 },
        },
      },

      // Place schemas
      PlacesListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Place' },
          },
        },
      },
      PlaceResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { $ref: '#/components/schemas/Place' },
        },
      },
      Place: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          category: { type: 'string' },
          address: { type: 'string' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          description: { type: 'string' },
          images: { type: 'array', items: { type: 'string' } },
          averageRating: { type: 'number' },
          totalReviews: { type: 'integer' },
          totalCheckIns: { type: 'integer' },
          isActive: { type: 'boolean' },
          distance: { type: 'number', description: 'Distance in km (when using spatial search)' },
        },
      },
      CreatePlaceRequest: {
        type: 'object',
        required: ['name', 'category', 'address', 'latitude', 'longitude'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          category: { type: 'string' },
          address: { type: 'string', minLength: 5 },
          latitude: { type: 'number', minimum: -90, maximum: 90 },
          longitude: { type: 'number', minimum: -180, maximum: 180 },
          description: { type: 'string', maxLength: 2000 },
          images: { type: 'array', items: { type: 'string' }, maxItems: 10 },
          wifiSsids: { type: 'array', items: { type: 'string' } },
        },
      },

      // Check-in schemas
      CheckInsListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'array', items: { $ref: '#/components/schemas/CheckIn' } },
          pagination: {
            type: 'object',
            properties: {
              hasMore: { type: 'boolean' },
              nextCursor: { type: 'string', nullable: true },
              limit: { type: 'integer' },
            },
          },
        },
      },
      CheckInResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              checkIn: { $ref: '#/components/schemas/CheckIn' },
              integrity: { $ref: '#/components/schemas/GPSIntegrity' },
            },
          },
        },
      },
      CheckIn: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          placeId: { type: 'string' },
          status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
          integrityScore: { type: 'number' },
          pointsEarned: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      GPSIntegrity: {
        type: 'object',
        properties: {
          totalScore: { type: 'number' },
          distanceScore: { type: 'number' },
          wifiScore: { type: 'number' },
          accuracyScore: { type: 'number' },
        },
      },
      CreateCheckInRequest: {
        type: 'object',
        required: ['userId', 'placeId', 'latitude', 'longitude'],
        properties: {
          userId: { type: 'string' },
          placeId: { type: 'string' },
          latitude: { type: 'number', minimum: -90, maximum: 90 },
          longitude: { type: 'number', minimum: -180, maximum: 180 },
          accuracy: { type: 'number', minimum: 0 },
          wifiNetworks: { type: 'array', items: { type: 'string' } },
          deviceInfo: { type: 'string' },
        },
      },

      // Voucher schemas
      VouchersListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'array', items: { $ref: '#/components/schemas/Voucher' } },
        },
      },
      VoucherResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { $ref: '#/components/schemas/Voucher' },
        },
      },
      Voucher: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          placeId: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          discountType: { type: 'string', enum: ['PERCENTAGE', 'FIXED'] },
          discountValue: { type: 'number' },
          status: { type: 'string', enum: ['ACTIVE', 'REDEEMED', 'EXPIRED'] },
          expiresAt: { type: 'string', format: 'date-time' },
          redeemedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      CreateVoucherRequest: {
        type: 'object',
        required: ['userId', 'placeId', 'title', 'discountType', 'discountValue', 'expiresAt'],
        properties: {
          userId: { type: 'string' },
          placeId: { type: 'string' },
          title: { type: 'string', minLength: 3, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          discountType: { type: 'string', enum: ['PERCENTAGE', 'FIXED'] },
          discountValue: { type: 'number', minimum: 0 },
          expiresAt: { type: 'string', format: 'date-time' },
        },
      },

      // Review schemas
      ReviewsListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'array', items: { $ref: '#/components/schemas/Review' } },
          pagination: {
            type: 'object',
            properties: {
              hasMore: { type: 'boolean' },
              nextCursor: { type: 'string', nullable: true },
              limit: { type: 'integer' },
            },
          },
        },
      },
      ReviewResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { $ref: '#/components/schemas/Review' },
        },
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          placeId: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          title: { type: 'string' },
          content: { type: 'string' },
          images: { type: 'array', items: { type: 'string' } },
          helpfulCount: { type: 'integer' },
          isApproved: { type: 'boolean' },
          visitDate: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              displayName: { type: 'string' },
              avatar: { type: 'string' },
              level: { type: 'integer' },
            },
          },
        },
      },
      CreateReviewRequest: {
        type: 'object',
        required: ['placeId', 'userId', 'rating', 'title', 'content'],
        properties: {
          placeId: { type: 'string' },
          userId: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          title: { type: 'string', minLength: 3, maxLength: 100 },
          content: { type: 'string', minLength: 10, maxLength: 2000 },
          images: { type: 'array', items: { type: 'string' }, maxItems: 5 },
          visitDate: { type: 'string', format: 'date-time' },
        },
      },
      UpdateReviewRequest: {
        type: 'object',
        properties: {
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          title: { type: 'string', minLength: 3, maxLength: 100 },
          content: { type: 'string', minLength: 10, maxLength: 2000 },
          images: { type: 'array', items: { type: 'string' }, maxItems: 5 },
        },
      },
      ModerateReviewRequest: {
        type: 'object',
        required: ['action', 'adminId'],
        properties: {
          action: { type: 'string', enum: ['approve', 'reject', 'hide', 'unhide'] },
          reason: { type: 'string', minLength: 3, maxLength: 500 },
          adminId: { type: 'string' },
        },
      },

      // Leaderboard schemas
      LeaderboardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rank: { type: 'integer' },
                id: { type: 'string' },
                username: { type: 'string' },
                displayName: { type: 'string' },
                avatar: { type: 'string' },
                totalPoints: { type: 'integer' },
                level: { type: 'integer' },
                totalCheckIns: { type: 'integer' },
              },
            },
          },
        },
      },
    },

    responses: {
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      ValidationError: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      Forbidden: {
        description: 'Forbidden - insufficient permissions',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      RateLimitExceeded: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string' },
                rateLimit: {
                  type: 'object',
                  properties: {
                    limit: { type: 'integer' },
                    remaining: { type: 'integer' },
                    reset: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },

    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },

  security: [
    {
      BearerAuth: [],
    },
  ],
};

export default openApiSpec;
