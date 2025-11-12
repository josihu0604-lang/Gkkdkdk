/**
 * Payment Integration
 * Supports both Stripe (fiat) and USDC on Base network (crypto)
 */

import { logger } from './logger';

/**
 * Payment types
 */
export enum PaymentType {
  STRIPE = 'stripe',
  CRYPTO = 'crypto',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Payment interfaces
 */
export interface Payment {
  id: string;
  type: PaymentType;
  status: PaymentStatus;
  amount: number;
  currency: string;
  userId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StripePaymentIntent {
  clientSecret: string;
  intentId: string;
  amount: number;
  currency: string;
}

export interface CryptoPaymentDetails {
  recipientAddress: string;
  amount: string; // In USDC (6 decimals)
  chainId: number;
  contractAddress: string;
  estimatedGas: string;
}

/**
 * Stripe configuration
 */
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const STRIPE_API_VERSION = '2023-10-16';

/**
 * USDC on Base configuration
 */
const USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const BASE_CHAIN_ID = 8453;
const BASE_RPC_URL = 'https://mainnet.base.org';

/**
 * Stripe Payment Methods
 */

/**
 * Create Stripe payment intent
 */
export async function createStripePayment(
  amount: number,
  currency: string = 'usd',
  metadata?: Record<string, string>
): Promise<StripePaymentIntent | { error: string }> {
  try {
    if (!STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': STRIPE_API_VERSION,
      },
      body: new URLSearchParams({
        amount: Math.round(amount * 100).toString(), // Convert to cents
        currency,
        'automatic_payment_methods[enabled]': 'true',
        ...(metadata && {
          ...Object.entries(metadata).reduce((acc, [key, value]) => {
            acc[`metadata[${key}]`] = value;
            return acc;
          }, {} as Record<string, string>),
        }),
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      logger.error('Stripe payment intent creation failed', data);
      return { error: data.error?.message || 'Failed to create payment' };
    }
    
    logger.info('Stripe payment intent created', {
      intentId: data.id,
      amount,
      currency,
    });
    
    return {
      clientSecret: data.client_secret,
      intentId: data.id,
      amount: data.amount / 100,
      currency: data.currency,
    };
    
  } catch (error) {
    logger.error('Stripe payment error', error);
    return {
      error: error instanceof Error ? error.message : 'Payment failed',
    };
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeWebhook(
  payload: string,
  signature: string
): { verified: boolean; event?: any; error?: string } {
  try {
    if (!STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }
    
    // Note: In production, use Stripe's SDK for proper signature verification
    // This is a simplified version
    const event = JSON.parse(payload);
    
    logger.info('Stripe webhook received', {
      type: event.type,
      id: event.id,
    });
    
    return { verified: true, event };
    
  } catch (error) {
    logger.error('Stripe webhook verification failed', error);
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Get payment status from Stripe
 */
export async function getStripePaymentStatus(
  paymentIntentId: string
): Promise<{ status: PaymentStatus; error?: string }> {
  try {
    if (!STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    
    const response = await fetch(
      `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Stripe-Version': STRIPE_API_VERSION,
        },
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      logger.error('Failed to get Stripe payment status', data);
      return { status: PaymentStatus.FAILED, error: data.error?.message };
    }
    
    // Map Stripe status to our status
    const statusMap: Record<string, PaymentStatus> = {
      requires_payment_method: PaymentStatus.PENDING,
      requires_confirmation: PaymentStatus.PENDING,
      requires_action: PaymentStatus.PENDING,
      processing: PaymentStatus.PROCESSING,
      succeeded: PaymentStatus.COMPLETED,
      canceled: PaymentStatus.CANCELLED,
    };
    
    const status = statusMap[data.status] || PaymentStatus.FAILED;
    
    return { status };
    
  } catch (error) {
    logger.error('Error getting Stripe payment status', error);
    return {
      status: PaymentStatus.FAILED,
      error: error instanceof Error ? error.message : 'Status check failed',
    };
  }
}

/**
 * Crypto Payment Methods (USDC on Base)
 */

/**
 * Get USDC payment details for Base network
 */
export function getCryptoPaymentDetails(
  recipientAddress: string,
  amountUSD: number
): CryptoPaymentDetails {
  // USDC has 6 decimals
  const amountUSDC = (amountUSD * 1_000_000).toString();
  
  return {
    recipientAddress,
    amount: amountUSDC,
    chainId: BASE_CHAIN_ID,
    contractAddress: USDC_CONTRACT_ADDRESS,
    estimatedGas: '100000', // Typical USDC transfer gas
  };
}

/**
 * Verify USDC transaction on Base network
 */
export async function verifyUSDCTransaction(
  txHash: string,
  expectedAmount: string,
  expectedRecipient: string
): Promise<{
  verified: boolean;
  blockNumber?: number;
  from?: string;
  to?: string;
  value?: string;
  error?: string;
}> {
  try {
    // Call Base RPC to get transaction details
    const response = await fetch(BASE_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1,
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      logger.error('Failed to get transaction receipt', data.error);
      return { verified: false, error: data.error.message };
    }
    
    const receipt = data.result;
    
    if (!receipt) {
      return { verified: false, error: 'Transaction not found' };
    }
    
    // Verify transaction success
    if (receipt.status !== '0x1') {
      return { verified: false, error: 'Transaction failed' };
    }
    
    // Parse USDC transfer event from logs
    // Transfer event signature: Transfer(address,address,uint256)
    const transferEventSignature =
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    
    const transferLog = receipt.logs.find(
      (log: any) =>
        log.topics[0] === transferEventSignature &&
        log.address.toLowerCase() === USDC_CONTRACT_ADDRESS.toLowerCase()
    );
    
    if (!transferLog) {
      return { verified: false, error: 'Transfer event not found' };
    }
    
    // Decode transfer event
    // topics[1] = from address (indexed)
    // topics[2] = to address (indexed)
    // data = value (not indexed)
    const from = '0x' + transferLog.topics[1].slice(26);
    const to = '0x' + transferLog.topics[2].slice(26);
    const value = BigInt(transferLog.data).toString();
    
    // Verify recipient and amount
    const recipientMatch = to.toLowerCase() === expectedRecipient.toLowerCase();
    const amountMatch = value === expectedAmount;
    
    if (!recipientMatch || !amountMatch) {
      return {
        verified: false,
        error: 'Recipient or amount mismatch',
        from,
        to,
        value,
      };
    }
    
    logger.info('USDC transaction verified', {
      txHash,
      blockNumber: parseInt(receipt.blockNumber, 16),
      from,
      to,
      value,
    });
    
    return {
      verified: true,
      blockNumber: parseInt(receipt.blockNumber, 16),
      from,
      to,
      value,
    };
    
  } catch (error) {
    logger.error('Error verifying USDC transaction', error, { txHash });
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Get current USDC balance on Base
 */
export async function getUSDCBalance(address: string): Promise<{
  balance: string;
  balanceUSD: number;
  error?: string;
}> {
  try {
    // Call Base RPC to get USDC balance
    // balanceOf(address) function signature: 0x70a08231
    const data = '0x70a08231' + address.slice(2).padStart(64, '0');
    
    const response = await fetch(BASE_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: USDC_CONTRACT_ADDRESS,
            data,
          },
          'latest',
        ],
        id: 1,
      }),
    });
    
    const result = await response.json();
    
    if (result.error) {
      logger.error('Failed to get USDC balance', result.error);
      return { balance: '0', balanceUSD: 0, error: result.error.message };
    }
    
    const balanceWei = BigInt(result.result);
    const balance = balanceWei.toString();
    const balanceUSD = Number(balanceWei) / 1_000_000; // USDC has 6 decimals
    
    return { balance, balanceUSD };
    
  } catch (error) {
    logger.error('Error getting USDC balance', error, { address });
    return {
      balance: '0',
      balanceUSD: 0,
      error: error instanceof Error ? error.message : 'Balance check failed',
    };
  }
}

/**
 * Format USDC amount for display
 */
export function formatUSDC(amount: string | number): string {
  const amountNum = typeof amount === 'string' ? Number(amount) : amount;
  const usd = amountNum / 1_000_000;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(usd);
}

/**
 * Payment helper: Create payment record in database
 */
export interface CreatePaymentParams {
  userId: string;
  type: PaymentType;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
}

export async function createPaymentRecord(
  params: CreatePaymentParams
): Promise<Payment | { error: string }> {
  try {
    // TODO: Implement database insert
    // This is a placeholder that would use Prisma
    
    const payment: Payment = {
      id: `pay_${Date.now()}`,
      type: params.type,
      status: PaymentStatus.PENDING,
      amount: params.amount,
      currency: params.currency,
      userId: params.userId,
      metadata: params.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    logger.info('Payment record created', {
      paymentId: payment.id,
      type: payment.type,
      amount: payment.amount,
    });
    
    return payment;
    
  } catch (error) {
    logger.error('Failed to create payment record', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create payment',
    };
  }
}
