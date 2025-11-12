import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // Recommended by OWASP (10-12 rounds)

/**
 * Hash password using bcrypt
 * 
 * Security features:
 * - 12 salt rounds (2^12 iterations = 4096 iterations)
 * - Resistant to rainbow table attacks
 * - Automatically handles salt generation
 * 
 * @param password - Plain text password
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('[Password Hash Error]', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Compare password with hash
 * 
 * @param password - Plain text password
 * @param hash - Hashed password from database
 * @returns true if password matches
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.error('[Password Compare Error]', error);
    return false;
  }
}

/**
 * Validate password strength
 * 
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * 
 * @param password - Password to validate
 * @returns Object with validation result and message
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  message: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters',
    };
  }
  
  if (password.length > 128) {
    return {
      isValid: false,
      message: 'Password must be less than 128 characters',
    };
  }
  
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }
  
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }
  
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character',
    };
  }
  
  // Check for common weak passwords
  const weakPasswords = [
    'password123',
    '12345678',
    'qwerty123',
    'admin123',
    'password',
  ];
  
  if (weakPasswords.includes(password.toLowerCase())) {
    return {
      isValid: false,
      message: 'Password is too common. Please choose a stronger password',
    };
  }
  
  return {
    isValid: true,
    message: 'Password is strong',
  };
}

/**
 * Generate secure random password
 * 
 * @param length - Password length (default: 16)
 * @returns Random password string
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}
