'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * 
 * Features:
 * - Logs error details
 * - Shows fallback UI
 * - Allows error recovery
 * - Reports to analytics
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('Error Boundary caught an error:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    });

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to analytics in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      this.sendErrorToAnalytics(error, errorInfo);
    }
  }

  private sendErrorToAnalytics(error: Error, errorInfo: ErrorInfo) {
    try {
      const errorData = {
        type: 'react-error',
        name: error.name,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      };

      // Send to analytics endpoint
      fetch('/api/analytics/errors', {
        method: 'POST',
        body: JSON.stringify(errorData),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch((err) => {
        console.error('Failed to send error to analytics:', err);
      });
    } catch (err) {
      console.error('Error in sendErrorToAnalytics:', err);
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconContainer}>
              <span style={styles.icon}>⚠️</span>
            </div>
            <h1 style={styles.title}>Oops! Something went wrong</h1>
            <p style={styles.message}>
              We're sorry for the inconvenience. The error has been logged and we'll look into it.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Error Details (Development)</summary>
                <div style={styles.errorDetails}>
                  <p><strong>Error:</strong> {this.state.error.message}</p>
                  <pre style={styles.stack}>{this.state.error.stack}</pre>
                  {this.state.errorInfo && (
                    <>
                      <p><strong>Component Stack:</strong></p>
                      <pre style={styles.stack}>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <div style={styles.actions}>
              <button onClick={this.handleReset} style={styles.buttonPrimary}>
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                style={styles.buttonSecondary}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Inline styles for fallback UI (no external dependencies)
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: '20px',
  },
  icon: {
    fontSize: '64px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '12px',
  },
  message: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  details: {
    marginTop: '24px',
    marginBottom: '24px',
    textAlign: 'left',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    padding: '16px',
  },
  summary: {
    cursor: 'pointer',
    fontWeight: '600',
    marginBottom: '12px',
  },
  errorDetails: {
    marginTop: '12px',
  },
  stack: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    padding: '12px',
    borderRadius: '4px',
    overflow: 'auto',
    fontSize: '12px',
    lineHeight: '1.4',
    maxHeight: '200px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginTop: '24px',
  },
  buttonPrimary: {
    backgroundColor: '#FF6B35',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonSecondary: {
    backgroundColor: 'white',
    color: '#333',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
};

/**
 * Async Error Boundary Wrapper
 * For catching errors in async operations
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
