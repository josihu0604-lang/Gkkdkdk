/**
 * WebSocket Server for Real-time Notifications
 * Handles live updates for check-ins, reviews, vouchers, and leaderboard
 * 
 * Usage:
 * - Clients connect via WebSocket
 * - Subscribe to channels (user, place, global)
 * - Receive real-time events
 */

import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { verifyJWT } from '@/lib/jwt';

// ============================================================================
// Types
// ============================================================================

export interface WSClient {
  ws: WebSocket;
  userId?: string;
  channels: Set<string>;
  authenticated: boolean;
}

export interface WSMessage {
  type: 'subscribe' | 'unsubscribe' | 'event' | 'auth' | 'ping' | 'pong';
  channel?: string;
  event?: string;
  data?: any;
  token?: string;
}

export interface WSEvent {
  event: string;
  data: any;
  timestamp: string;
}

// Event types
export type EventType =
  | 'check-in:created'
  | 'check-in:approved'
  | 'check-in:rejected'
  | 'voucher:issued'
  | 'voucher:redeemed'
  | 'review:created'
  | 'review:updated'
  | 'review:helpful'
  | 'level:up'
  | 'leaderboard:updated'
  | 'achievement:unlocked';

// ============================================================================
// WebSocket Manager
// ============================================================================

export class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WSClient> = new Map();
  private channels: Map<string, Set<string>> = new Map();

  /**
   * Initialize WebSocket server
   */
  initialize(server: any): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      this.handleConnection(ws, request);
    });

    console.log('[WebSocket] Server initialized on /ws');
  }

  /**
   * Handle new connection
   */
  private handleConnection(ws: WebSocket, request: IncomingMessage): void {
    const clientId = this.generateClientId();
    const client: WSClient = {
      ws,
      channels: new Set(),
      authenticated: false,
    };

    this.clients.set(clientId, client);
    console.log(`[WebSocket] Client connected: ${clientId}`);

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'event',
      event: 'connected',
      data: { clientId, timestamp: new Date().toISOString() },
    });

    // Handle messages
    ws.on('message', (data: Buffer) => {
      this.handleMessage(clientId, data);
    });

    // Handle disconnect
    ws.on('close', () => {
      this.handleDisconnect(clientId);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`[WebSocket] Client error ${clientId}:`, error);
    });

    // Ping/pong for keep-alive
    ws.on('pong', () => {
      // Client is alive
    });
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(clientId: string, data: Buffer): Promise<void> {
    try {
      const message: WSMessage = JSON.parse(data.toString());
      const client = this.clients.get(clientId);

      if (!client) {
        return;
      }

      switch (message.type) {
        case 'auth':
          await this.handleAuth(clientId, message.token);
          break;

        case 'subscribe':
          if (message.channel) {
            this.subscribe(clientId, message.channel);
          }
          break;

        case 'unsubscribe':
          if (message.channel) {
            this.unsubscribe(clientId, message.channel);
          }
          break;

        case 'ping':
          this.sendToClient(clientId, { type: 'pong' });
          break;

        default:
          console.warn(`[WebSocket] Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('[WebSocket] Error handling message:', error);
      this.sendToClient(clientId, {
        type: 'event',
        event: 'error',
        data: { message: 'Invalid message format' },
      });
    }
  }

  /**
   * Handle authentication
   */
  private async handleAuth(clientId: string, token?: string): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client || !token) {
      this.sendToClient(clientId, {
        type: 'event',
        event: 'auth:failed',
        data: { message: 'Invalid token' },
      });
      return;
    }

    try {
      const payload = await verifyJWT(token);
      
      if (payload && payload.userId) {
        client.userId = payload.userId;
        client.authenticated = true;

        // Auto-subscribe to user channel
        this.subscribe(clientId, `user:${payload.userId}`);

        this.sendToClient(clientId, {
          type: 'event',
          event: 'auth:success',
          data: { userId: payload.userId },
        });

        console.log(`[WebSocket] Client ${clientId} authenticated as ${payload.userId}`);
      } else {
        throw new Error('Invalid token payload');
      }
    } catch (error) {
      this.sendToClient(clientId, {
        type: 'event',
        event: 'auth:failed',
        data: { message: 'Authentication failed' },
      });
    }
  }

  /**
   * Subscribe client to channel
   */
  private subscribe(clientId: string, channel: string): void {
    const client = this.clients.get(clientId);
    if (!client) {
      return;
    }

    // Add client to channel
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(clientId);
    client.channels.add(channel);

    this.sendToClient(clientId, {
      type: 'event',
      event: 'subscribed',
      data: { channel },
    });

    console.log(`[WebSocket] Client ${clientId} subscribed to ${channel}`);
  }

  /**
   * Unsubscribe client from channel
   */
  private unsubscribe(clientId: string, channel: string): void {
    const client = this.clients.get(clientId);
    if (!client) {
      return;
    }

    this.channels.get(channel)?.delete(clientId);
    client.channels.delete(channel);

    this.sendToClient(clientId, {
      type: 'event',
      event: 'unsubscribed',
      data: { channel },
    });

    console.log(`[WebSocket] Client ${clientId} unsubscribed from ${channel}`);
  }

  /**
   * Handle disconnect
   */
  private handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) {
      return;
    }

    // Remove from all channels
    client.channels.forEach((channel) => {
      this.channels.get(channel)?.delete(clientId);
    });

    this.clients.delete(clientId);
    console.log(`[WebSocket] Client disconnected: ${clientId}`);
  }

  /**
   * Broadcast event to channel
   */
  broadcast(channel: string, event: string, data: any): void {
    const subscribers = this.channels.get(channel);
    if (!subscribers || subscribers.size === 0) {
      return;
    }

    const message: WSMessage = {
      type: 'event',
      event,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    };

    const payload = JSON.stringify(message);

    subscribers.forEach((clientId) => {
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    });

    console.log(`[WebSocket] Broadcasted ${event} to ${channel} (${subscribers.size} clients)`);
  }

  /**
   * Send message to specific client
   */
  private sendToClient(clientId: string, message: WSMessage): void {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    client.ws.send(JSON.stringify(message));
  }

  /**
   * Send to user (all their connections)
   */
  sendToUser(userId: string, event: string, data: any): void {
    this.broadcast(`user:${userId}`, event, data);
  }

  /**
   * Send to place (all subscribed users)
   */
  sendToPlace(placeId: string, event: string, data: any): void {
    this.broadcast(`place:${placeId}`, event, data);
  }

  /**
   * Send to all connected clients
   */
  sendToAll(event: string, data: any): void {
    this.broadcast('global', event, data);
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Get stats
   */
  getStats(): { clients: number; channels: number; authenticated: number } {
    let authenticated = 0;
    this.clients.forEach((client) => {
      if (client.authenticated) {
        authenticated++;
      }
    });

    return {
      clients: this.clients.size,
      channels: this.channels.size,
      authenticated,
    };
  }

  /**
   * Periodic cleanup (remove dead connections)
   */
  cleanup(): void {
    this.clients.forEach((client, clientId) => {
      if (client.ws.readyState === WebSocket.CLOSED) {
        this.handleDisconnect(clientId);
      }
    });
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let wsManager: WebSocketManager | null = null;

export function getWebSocketManager(): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager();
  }
  return wsManager;
}

// ============================================================================
// Helper Functions for Broadcasting Events
// ============================================================================

/**
 * Notify check-in created
 */
export function notifyCheckInCreated(checkIn: any): void {
  const ws = getWebSocketManager();
  
  // Notify user
  ws.sendToUser(checkIn.userId, 'check-in:created', {
    checkInId: checkIn.id,
    placeId: checkIn.placeId,
    status: checkIn.status,
    integrityScore: checkIn.integrityScore,
  });

  // Notify place subscribers
  ws.sendToPlace(checkIn.placeId, 'check-in:created', {
    checkInId: checkIn.id,
    placeId: checkIn.placeId,
    userId: checkIn.userId,
  });
}

/**
 * Notify check-in approved
 */
export function notifyCheckInApproved(checkIn: any, pointsEarned: number): void {
  const ws = getWebSocketManager();
  
  ws.sendToUser(checkIn.userId, 'check-in:approved', {
    checkInId: checkIn.id,
    placeId: checkIn.placeId,
    pointsEarned,
  });
}

/**
 * Notify voucher issued
 */
export function notifyVoucherIssued(voucher: any): void {
  const ws = getWebSocketManager();
  
  ws.sendToUser(voucher.userId, 'voucher:issued', {
    voucherId: voucher.id,
    placeId: voucher.placeId,
    type: voucher.type,
    value: voucher.value,
    expiresAt: voucher.expiresAt,
  });
}

/**
 * Notify review created
 */
export function notifyReviewCreated(review: any): void {
  const ws = getWebSocketManager();
  
  // Notify place subscribers
  ws.sendToPlace(review.placeId, 'review:created', {
    reviewId: review.id,
    placeId: review.placeId,
    userId: review.userId,
    rating: review.rating,
    title: review.title,
  });
}

/**
 * Notify level up
 */
export function notifyLevelUp(userId: string, newLevel: number, rewards: any): void {
  const ws = getWebSocketManager();
  
  ws.sendToUser(userId, 'level:up', {
    newLevel,
    rewards,
  });
}

/**
 * Notify leaderboard updated
 */
export function notifyLeaderboardUpdated(leaderboard: any[]): void {
  const ws = getWebSocketManager();
  
  ws.sendToAll('leaderboard:updated', {
    top10: leaderboard.slice(0, 10),
  });
}
