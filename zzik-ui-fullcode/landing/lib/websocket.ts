/**
 * WebSocket Server for Real-time Updates
 * Handles live notifications, check-in updates, leaderboard changes
 */

import { Server as HTTPServer } from 'http';
import { Socket } from 'net';
import { logger } from './logger';

/**
 * WebSocket message types
 */
export enum WSMessageType {
  // Client -> Server
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  PING = 'ping',
  
  // Server -> Client
  CHECK_IN_UPDATE = 'check_in_update',
  VOUCHER_ISSUED = 'voucher_issued',
  LEVEL_UP = 'level_up',
  LEADERBOARD_UPDATE = 'leaderboard_update',
  NOTIFICATION = 'notification',
  PONG = 'pong',
  ERROR = 'error',
}

/**
 * WebSocket message interface
 */
export interface WSMessage {
  type: WSMessageType;
  data?: any;
  timestamp?: number;
}

/**
 * Subscription channels
 */
export enum WSChannel {
  USER = 'user',           // User-specific updates
  PLACE = 'place',         // Place-specific updates
  LEADERBOARD = 'leaderboard', // Global leaderboard
  NOTIFICATIONS = 'notifications', // General notifications
}

/**
 * WebSocket connection manager
 */
class WebSocketManager {
  private connections: Map<string, any> = new Map(); // connectionId -> connection
  private subscriptions: Map<string, Set<string>> = new Map(); // channel -> Set<connectionId>
  
  /**
   * Register a new connection
   */
  registerConnection(connectionId: string, connection: any): void {
    this.connections.set(connectionId, connection);
    logger.info('WebSocket connection registered', { connectionId });
  }
  
  /**
   * Remove a connection
   */
  removeConnection(connectionId: string): void {
    // Remove from all subscriptions
    this.subscriptions.forEach((subscribers, channel) => {
      subscribers.delete(connectionId);
    });
    
    this.connections.delete(connectionId);
    logger.info('WebSocket connection removed', { connectionId });
  }
  
  /**
   * Subscribe connection to a channel
   */
  subscribe(connectionId: string, channel: string): void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    
    this.subscriptions.get(channel)?.add(connectionId);
    logger.info('WebSocket subscription added', { connectionId, channel });
  }
  
  /**
   * Unsubscribe connection from a channel
   */
  unsubscribe(connectionId: string, channel: string): void {
    this.subscriptions.get(channel)?.delete(connectionId);
    logger.info('WebSocket subscription removed', { connectionId, channel });
  }
  
  /**
   * Send message to a specific connection
   */
  sendToConnection(connectionId: string, message: WSMessage): void {
    const connection = this.connections.get(connectionId);
    
    if (!connection) {
      logger.warn('Connection not found', { connectionId });
      return;
    }
    
    try {
      const payload = JSON.stringify({
        ...message,
        timestamp: Date.now(),
      });
      
      connection.send(payload);
      
      logger.debug('Message sent to connection', {
        connectionId,
        type: message.type,
      });
    } catch (error) {
      logger.error('Failed to send message', error, { connectionId });
    }
  }
  
  /**
   * Broadcast message to all subscribers of a channel
   */
  broadcast(channel: string, message: WSMessage): void {
    const subscribers = this.subscriptions.get(channel);
    
    if (!subscribers || subscribers.size === 0) {
      logger.debug('No subscribers for channel', { channel });
      return;
    }
    
    const payload = JSON.stringify({
      ...message,
      timestamp: Date.now(),
    });
    
    let sentCount = 0;
    let errorCount = 0;
    
    subscribers.forEach((connectionId) => {
      const connection = this.connections.get(connectionId);
      
      if (connection) {
        try {
          connection.send(payload);
          sentCount++;
        } catch (error) {
          logger.error('Failed to broadcast to connection', error, { connectionId });
          errorCount++;
        }
      }
    });
    
    logger.info('Broadcast completed', {
      channel,
      type: message.type,
      sentCount,
      errorCount,
    });
  }
  
  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.connections.size;
  }
  
  /**
   * Get subscriber count for a channel
   */
  getSubscriberCount(channel: string): number {
    return this.subscriptions.get(channel)?.size || 0;
  }
  
  /**
   * Get statistics
   */
  getStats(): {
    connections: number;
    subscriptions: Record<string, number>;
  } {
    const subscriptions: Record<string, number> = {};
    
    this.subscriptions.forEach((subscribers, channel) => {
      subscriptions[channel] = subscribers.size;
    });
    
    return {
      connections: this.connections.size,
      subscriptions,
    };
  }
}

// Singleton instance
export const wsManager = new WebSocketManager();

/**
 * Event emitters for real-time updates
 */

/**
 * Notify user about check-in approval
 */
export function notifyCheckInApproved(userId: string, data: {
  checkInId: string;
  placeName: string;
  points: number;
}): void {
  const channel = `${WSChannel.USER}:${userId}`;
  
  wsManager.broadcast(channel, {
    type: WSMessageType.CHECK_IN_UPDATE,
    data: {
      status: 'approved',
      ...data,
    },
  });
}

/**
 * Notify user about voucher issuance
 */
export function notifyVoucherIssued(userId: string, data: {
  voucherId: string;
  placeName: string;
  type: string;
  value: string;
  expiresAt: string;
}): void {
  const channel = `${WSChannel.USER}:${userId}`;
  
  wsManager.broadcast(channel, {
    type: WSMessageType.VOUCHER_ISSUED,
    data,
  });
}

/**
 * Notify user about level up
 */
export function notifyLevelUp(userId: string, data: {
  newLevel: number;
  reward: string;
}): void {
  const channel = `${WSChannel.USER}:${userId}`;
  
  wsManager.broadcast(channel, {
    type: WSMessageType.LEVEL_UP,
    data,
  });
}

/**
 * Broadcast leaderboard update
 */
export function broadcastLeaderboardUpdate(data: {
  topUsers: Array<{
    userId: string;
    username: string;
    points: number;
    rank: number;
  }>;
}): void {
  wsManager.broadcast(WSChannel.LEADERBOARD, {
    type: WSMessageType.LEADERBOARD_UPDATE,
    data,
  });
}

/**
 * Send notification to user
 */
export function sendNotification(userId: string, notification: {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
}): void {
  const channel = `${WSChannel.USER}:${userId}`;
  
  wsManager.broadcast(channel, {
    type: WSMessageType.NOTIFICATION,
    data: notification,
  });
}

/**
 * Heartbeat/ping mechanism
 */
export function startHeartbeat(): void {
  setInterval(() => {
    const stats = wsManager.getStats();
    
    logger.debug('WebSocket heartbeat', stats);
    
    // Send ping to all connections to keep alive
    // This would be implemented in the actual WebSocket server
  }, 30000); // Every 30 seconds
}

/**
 * WebSocket upgrade handler for Next.js API routes
 * Note: This is a simplified version. For production, use a dedicated WebSocket server
 * or services like Pusher, Ably, or Socket.IO
 */
export function handleWebSocketUpgrade(
  req: any,
  socket: Socket,
  head: Buffer
): void {
  logger.info('WebSocket upgrade requested');
  
  // TODO: Implement proper WebSocket upgrade
  // This would typically use 'ws' library or similar
  
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    '\r\n'
  );
  
  const connectionId = `conn_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  
  // Mock connection object (replace with actual WebSocket)
  const connection = {
    id: connectionId,
    socket,
    send: (data: string) => {
      socket.write(`data: ${data}\n\n`);
    },
  };
  
  wsManager.registerConnection(connectionId, connection);
  
  // Handle disconnection
  socket.on('close', () => {
    wsManager.removeConnection(connectionId);
  });
  
  socket.on('error', (error) => {
    logger.error('WebSocket error', error, { connectionId });
    wsManager.removeConnection(connectionId);
  });
}

/**
 * Client-side WebSocket helper
 * Usage example for React components
 */
export const createWebSocketClient = (url: string) => {
  return {
    connect: () => {
      // TODO: Implement WebSocket client connection
      logger.info('WebSocket client connecting', { url });
    },
    
    subscribe: (channel: string, callback: (data: any) => void) => {
      // TODO: Implement subscription
      logger.info('Subscribing to channel', { channel });
    },
    
    unsubscribe: (channel: string) => {
      // TODO: Implement unsubscription
      logger.info('Unsubscribing from channel', { channel });
    },
    
    disconnect: () => {
      // TODO: Implement disconnection
      logger.info('WebSocket client disconnecting');
    },
  };
};

/**
 * Server-Sent Events (SSE) alternative to WebSocket
 * Simpler implementation for one-way server->client communication
 */
export function createSSEStream(userId: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`)
      );
      
      // Subscribe to user channel
      const channel = `${WSChannel.USER}:${userId}`;
      const connectionId = `sse_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      
      // Mock connection for SSE
      const connection = {
        send: (data: string) => {
          try {
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          } catch (error) {
            logger.error('Failed to send SSE message', error);
          }
        },
      };
      
      wsManager.registerConnection(connectionId, connection);
      wsManager.subscribe(connectionId, channel);
      
      // Cleanup on close
      const cleanup = () => {
        wsManager.removeConnection(connectionId);
      };
      
      // Set cleanup for when stream is cancelled
      return cleanup;
    },
  });
}
