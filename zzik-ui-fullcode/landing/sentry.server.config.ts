import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Server-specific options
  integrations: [
    Sentry.prismaIntegration(),
  ],
  
  // Filter sensitive data
  beforeSend(event) {
    // Remove sensitive data from server logs
    if (event.contexts?.trace?.data) {
      const data = event.contexts.trace.data;
      if (data['db.statement']) {
        data['db.statement'] = '[REDACTED]';
      }
    }
    
    return event;
  },
});
