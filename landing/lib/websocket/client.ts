/**
 * WebSocket Client for Real-time Notifications
 * Browser-side WebSocket client with auto-reconnect
 * 
 * Usage:
 * ```typescript
 * const ws = new ZZIKWebSocket('wss://api.zzik.io/ws', accessToken);
 * 
 * ws.on('check-in:approved', (data) => {
 *   console.log('Check-in approved!', data);
 * });
 * 
 * ws.subscribe('place:123');
 * ```
 */

'use client';

// ============================================================================
// Types
// ============================================================================

export type EventHandler = (data: any) => void;

export interface ZZIKWebSocketConfig {
  url: string;
  token?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  pingInterval?: number;
}

// ============================================================================
// WebSocket Client
// ============================================================================

export class ZZIKWebSocket {
  private ws: WebSocket | null = null;
  private config: Required<ZZIKWebSocketConfig>;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private connected: boolean = false;
  private authenticated: boolean = false;

  constructor(url: string, token?: string) {
    this.config = {
      url,
      token: token || '',
      autoReconnect: true,
      reconnectInterval: 5000,
      pingInterval: 30000,
    };

    this.connect();
  }

  /**
   * Connect to WebSocket server
   */
  private connect(): void {
    try {
      this.ws = new WebSocket(this.config.url);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected');
        this.connected = true;

        // Authenticate if token available
        if (this.config.token) {
          this.authenticate(this.config.token);
        }

        // Start ping/pong
        this.startPing();

        // Emit connected event
        this.emit('connected', { timestamp: new Date().toISOString() });
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        this.connected = false;
        this.authenticated = false;
        this.stopPing();

        // Emit disconnected event
        this.emit('disconnected', { timestamp: new Date().toISOString() });

        // Auto-reconnect
        if (this.config.autoReconnect) {
          this.reconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        this.emit('error', { error: 'WebSocket error' });
      };
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      if (this.config.autoReconnect) {
        this.reconnect();
      }
    }
  }

  /**
   * Reconnect with exponential backoff
   */
  private reconnect(): void {
    if (this.reconnectTimeout) {
      return;
    }

    console.log(`[WebSocket] Reconnecting in ${this.config.reconnectInterval}ms...`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, this.config.reconnectInterval);
  }

  /**
   * Handle incoming message
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      if (message.type === 'event') {
        // Handle special events
        if (message.event === 'auth:success') {
          this.authenticated = true;
          console.log('[WebSocket] Authenticated');
        } else if (message.event === 'auth:failed') {
          this.authenticated = false;
          console.error('[WebSocket] Authentication failed');
        }

        // Emit event to handlers
        this.emit(message.event, message.data);
      } else if (message.type === 'pong') {
        // Pong received, connection is alive
      }
    } catch (error) {
      console.error('[WebSocket] Error parsing message:', error);
    }
  }

  /**
   * Authenticate with token
   */
  authenticate(token: string): void {
    this.config.token = token;
    this.send({
      type: 'auth',
      token,
    });
  }

  /**
   * Subscribe to channel
   */
  subscribe(channel: string): void {
    if (!this.connected) {
      console.warn('[WebSocket] Not connected, cannot subscribe');
      return;
    }

    this.send({
      type: 'subscribe',
      channel,
    });
  }

  /**
   * Unsubscribe from channel
   */
  unsubscribe(channel: string): void {
    if (!this.connected) {
      return;
    }

    this.send({
      type: 'unsubscribe',
      channel,
    });
  }

  /**
   * Send message to server
   */
  private send(data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot send, not connected');
      return;
    }

    this.ws.send(JSON.stringify(data));
  }

  /**
   * Start ping interval
   */
  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.connected) {
        this.send({ type: 'ping' });
      }
    }, this.config.pingInterval);
  }

  /**
   * Stop ping interval
   */
  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Add event listener
   */
  on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * Remove event listener
   */
  off(event: string, handler: EventHandler): void {
    this.eventHandlers.get(event)?.delete(handler);
  }

  /**
   * Emit event to handlers
   */
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error('[WebSocket] Error in event handler:', error);
        }
      });
    }

    // Also emit to wildcard handlers
    const wildcardHandlers = this.eventHandlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        try {
          handler({ event, data });
        } catch (error) {
          console.error('[WebSocket] Error in wildcard handler:', error);
        }
      });
    }
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    this.config.autoReconnect = false;
    this.stopPing();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connected = false;
    this.authenticated = false;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.authenticated;
  }

  /**
   * Update token
   */
  updateToken(token: string): void {
    this.config.token = token;
    if (this.connected) {
      this.authenticate(token);
    }
  }
}

// ============================================================================
// React Hook for WebSocket
// ============================================================================

import { useEffect, useState, useCallback, useRef } from 'react';

export interface UseWebSocketOptions {
  url: string;
  token?: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const wsRef = useRef<ZZIKWebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket instance
    const ws = new ZZIKWebSocket(options.url, options.token);
    wsRef.current = ws;

    // Handle connection events
    ws.on('connected', () => {
      setConnected(true);
      options.onConnected?.();
    });

    ws.on('disconnected', () => {
      setConnected(false);
      setAuthenticated(false);
      options.onDisconnected?.();
    });

    ws.on('auth:success', () => {
      setAuthenticated(true);
    });

    ws.on('auth:failed', () => {
      setAuthenticated(false);
    });

    ws.on('error', (data) => {
      options.onError?.(data);
    });

    // Cleanup on unmount
    return () => {
      ws.disconnect();
    };
  }, [options.url]);

  // Update token when it changes
  useEffect(() => {
    if (options.token && wsRef.current) {
      wsRef.current.updateToken(options.token);
    }
  }, [options.token]);

  const subscribe = useCallback((channel: string) => {
    wsRef.current?.subscribe(channel);
  }, []);

  const unsubscribe = useCallback((channel: string) => {
    wsRef.current?.unsubscribe(channel);
  }, []);

  const on = useCallback((event: string, handler: EventHandler) => {
    wsRef.current?.on(event, handler);
    return () => {
      wsRef.current?.off(event, handler);
    };
  }, []);

  return {
    connected,
    authenticated,
    subscribe,
    unsubscribe,
    on,
    ws: wsRef.current,
  };
}
