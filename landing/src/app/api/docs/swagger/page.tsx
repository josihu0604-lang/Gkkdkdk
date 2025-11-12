/**
 * Swagger UI Page
 * Interactive API documentation
 */

'use client';

import { useEffect } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function SwaggerUIPage() {
  return (
    <div className="swagger-container">
      <SwaggerUI url="/api/docs" />
      <style jsx global>{`
        .swagger-container {
          width: 100%;
          min-height: 100vh;
        }
        
        .swagger-ui .topbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
