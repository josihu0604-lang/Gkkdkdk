/**
 * Email Service
 * Transactional emails with Resend API
 * Production-ready with templates and error handling
 */

import { logger } from './logger';

/**
 * Email configuration
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@zzik.app';
const APP_NAME = 'ZZIK';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://zzik.app';

/**
 * Email types
 */
export enum EmailType {
  WELCOME = 'welcome',
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  CHECK_IN_APPROVED = 'check_in_approved',
  VOUCHER_ISSUED = 'voucher_issued',
  VOUCHER_EXPIRING = 'voucher_expiring',
  LEVEL_UP = 'level_up',
  WEEKLY_DIGEST = 'weekly_digest',
}

/**
 * Email data interfaces
 */
interface WelcomeEmailData {
  username: string;
  walletAddress: string;
}

interface EmailVerificationData {
  username: string;
  verificationUrl: string;
}

interface PasswordResetData {
  username: string;
  resetUrl: string;
  expiresIn: string;
}

interface CheckInApprovedData {
  username: string;
  placeName: string;
  points: number;
}

interface VoucherIssuedData {
  username: string;
  placeName: string;
  voucherType: string;
  voucherValue: string;
  expiresAt: string;
  redeemUrl: string;
}

interface VoucherExpiringData {
  username: string;
  placeName: string;
  voucherValue: string;
  expiresAt: string;
  redeemUrl: string;
}

interface LevelUpData {
  username: string;
  newLevel: number;
  reward: string;
}

interface WeeklyDigestData {
  username: string;
  checkInCount: number;
  pointsEarned: number;
  currentStreak: number;
  rank: number;
  topPlaces: Array<{ name: string; checkIns: number }>;
}

/**
 * Send email using Resend API
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  replyTo?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!RESEND_API_KEY) {
      logger.warn('RESEND_API_KEY not configured, skipping email send');
      return { success: false, error: 'Email service not configured' };
    }
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
        ...(replyTo && { reply_to: replyTo }),
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      logger.error('Failed to send email', data, { to, subject });
      return { success: false, error: data.message || 'Failed to send email' };
    }
    
    logger.info('Email sent successfully', {
      to,
      subject,
      messageId: data.id,
    });
    
    return { success: true, messageId: data.id };
    
  } catch (error) {
    logger.error('Email send error', error, { to, subject });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Email Templates
 */

/**
 * Base email template with consistent styling
 */
function createEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #F5F5F5;
      color: #1A1A1A;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #FFFFFF;
      border: 1px solid #E5E5E5;
    }
    .header {
      padding: 40px;
      border-bottom: 1px solid #E5E5E5;
    }
    .logo {
      font-size: 24px;
      font-weight: 600;
      color: #1A1A1A;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px;
    }
    .content h1 {
      font-size: 24px;
      font-weight: 600;
      color: #1A1A1A;
      margin: 0 0 16px 0;
      letter-spacing: -0.5px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.6;
      color: #666666;
      margin: 0 0 16px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #5E6AD2;
      color: #FFFFFF !important;
      text-decoration: none;
      font-size: 16px;
      font-weight: 500;
      border-radius: 4px;
      margin: 24px 0;
    }
    .stats {
      background-color: #F5F5F5;
      padding: 24px;
      margin: 24px 0;
    }
    .stat-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #E5E5E5;
    }
    .stat-item:last-child {
      border-bottom: none;
    }
    .stat-label {
      color: #666666;
      font-size: 14px;
    }
    .stat-value {
      color: #1A1A1A;
      font-size: 14px;
      font-weight: 600;
    }
    .footer {
      padding: 40px;
      border-top: 1px solid #E5E5E5;
      text-align: center;
    }
    .footer p {
      font-size: 14px;
      color: #999999;
      margin: 8px 0;
    }
    .footer a {
      color: #5E6AD2;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">${APP_NAME}</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p>
        <a href="${APP_URL}">Visit website</a> •
        <a href="${APP_URL}/help">Help</a> •
        <a href="${APP_URL}/unsubscribe">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Welcome email
 */
export async function sendWelcomeEmail(
  to: string,
  data: WelcomeEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const content = `
    <h1>Welcome to ${APP_NAME}! 🎉</h1>
    <p>Hey ${data.username},</p>
    <p>We're thrilled to have you on board! You've just joined a community of explorers who earn rewards by checking in at their favorite places.</p>
    <p>Your wallet <code>${data.walletAddress.slice(0, 6)}...${data.walletAddress.slice(-4)}</code> is now connected, and you're ready to start earning.</p>
    <a href="${APP_URL}/map" class="button">Start Exploring</a>
    <p><strong>What's next?</strong></p>
    <ul>
      <li>Find nearby places on the map</li>
      <li>Check in to earn points and vouchers</li>
      <li>Redeem USDC rewards on Base network</li>
      <li>Build your streak and level up</li>
    </ul>
    <p>Happy exploring!</p>
  `;
  
  return sendEmail(
    to,
    `Welcome to ${APP_NAME}!`,
    createEmailTemplate(content)
  );
}

/**
 * Email verification
 */
export async function sendEmailVerification(
  to: string,
  data: EmailVerificationData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const content = `
    <h1>Verify your email</h1>
    <p>Hey ${data.username},</p>
    <p>Click the button below to verify your email address and complete your ${APP_NAME} account setup.</p>
    <a href="${data.verificationUrl}" class="button">Verify Email</a>
    <p style="color: #999999; font-size: 14px;">
      If you didn't request this email, you can safely ignore it.
    </p>
    <p style="color: #999999; font-size: 14px;">
      Link: ${data.verificationUrl}
    </p>
  `;
  
  return sendEmail(
    to,
    `Verify your ${APP_NAME} email`,
    createEmailTemplate(content)
  );
}

/**
 * Check-in approved notification
 */
export async function sendCheckInApprovedEmail(
  to: string,
  data: CheckInApprovedData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const content = `
    <h1>Check-in approved! ✅</h1>
    <p>Great news ${data.username}!</p>
    <p>Your check-in at <strong>${data.placeName}</strong> has been approved.</p>
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Points earned</span>
        <span class="stat-value">+${data.points}</span>
      </div>
    </div>
    <a href="${APP_URL}/vouchers" class="button">View My Vouchers</a>
    <p>Keep building your streak to unlock even more rewards!</p>
  `;
  
  return sendEmail(
    to,
    'Check-in approved!',
    createEmailTemplate(content)
  );
}

/**
 * Voucher issued notification
 */
export async function sendVoucherIssuedEmail(
  to: string,
  data: VoucherIssuedData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const content = `
    <h1>You've earned a voucher! 🎁</h1>
    <p>Congratulations ${data.username}!</p>
    <p>You've received a voucher for your check-in at <strong>${data.placeName}</strong>.</p>
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Voucher type</span>
        <span class="stat-value">${data.voucherType}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Value</span>
        <span class="stat-value">${data.voucherValue}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Expires</span>
        <span class="stat-value">${data.expiresAt}</span>
      </div>
    </div>
    <a href="${data.redeemUrl}" class="button">Redeem Now</a>
    <p>Don't forget to use your voucher before it expires!</p>
  `;
  
  return sendEmail(
    to,
    'You've earned a voucher!',
    createEmailTemplate(content)
  );
}

/**
 * Voucher expiring soon notification
 */
export async function sendVoucherExpiringEmail(
  to: string,
  data: VoucherExpiringData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const content = `
    <h1>Your voucher expires soon ⏰</h1>
    <p>Hey ${data.username},</p>
    <p>Don't let your voucher for <strong>${data.placeName}</strong> go to waste!</p>
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Value</span>
        <span class="stat-value">${data.voucherValue}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Expires</span>
        <span class="stat-value">${data.expiresAt}</span>
      </div>
    </div>
    <a href="${data.redeemUrl}" class="button">Redeem Now</a>
    <p>Act fast before it's too late!</p>
  `;
  
  return sendEmail(
    to,
    'Your voucher expires soon',
    createEmailTemplate(content)
  );
}

/**
 * Level up notification
 */
export async function sendLevelUpEmail(
  to: string,
  data: LevelUpData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const content = `
    <h1>Level Up! 🚀</h1>
    <p>Amazing work ${data.username}!</p>
    <p>You've just reached <strong>Level ${data.newLevel}</strong>!</p>
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">New level</span>
        <span class="stat-value">${data.newLevel}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Reward unlocked</span>
        <span class="stat-value">${data.reward}</span>
      </div>
    </div>
    <a href="${APP_URL}/profile" class="button">View My Profile</a>
    <p>Keep going to unlock even more rewards!</p>
  `;
  
  return sendEmail(
    to,
    `Level Up! You're now Level ${data.newLevel}`,
    createEmailTemplate(content)
  );
}

/**
 * Weekly digest email
 */
export async function sendWeeklyDigestEmail(
  to: string,
  data: WeeklyDigestData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const topPlacesHtml = data.topPlaces
    .map(
      (place, i) => `
      <div class="stat-item">
        <span class="stat-label">${i + 1}. ${place.name}</span>
        <span class="stat-value">${place.checkIns} check-ins</span>
      </div>
    `
    )
    .join('');
  
  const content = `
    <h1>Your weekly recap 📊</h1>
    <p>Hey ${data.username},</p>
    <p>Here's what you accomplished this week:</p>
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Check-ins</span>
        <span class="stat-value">${data.checkInCount}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Points earned</span>
        <span class="stat-value">+${data.pointsEarned}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Current streak</span>
        <span class="stat-value">${data.currentStreak} days</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Leaderboard rank</span>
        <span class="stat-value">#${data.rank}</span>
      </div>
    </div>
    <p><strong>Top places this week:</strong></p>
    <div class="stats">
      ${topPlacesHtml}
    </div>
    <a href="${APP_URL}/map" class="button">Continue Exploring</a>
    <p>Keep up the great work!</p>
  `;
  
  return sendEmail(
    to,
    'Your weekly recap',
    createEmailTemplate(content)
  );
}
