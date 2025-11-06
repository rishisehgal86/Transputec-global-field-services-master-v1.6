import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { users, type User } from '../drizzle/schema';
import { getDb } from './db';
import { ENV } from './_core/env';

const SALT_ROUNDS = 10;
const JWT_SECRET = ENV.jwtSecret;
const JWT_EXPIRES_IN = '7d'; // 7 days

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): { userId: number; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };
  } catch (error) {
    return null;
  }
}

/**
 * Authenticate a user with email and password
 */
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const db = await getDb();
  if (!db) {
    console.warn('[Auth] Database not available');
    return null;
  }

  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (result.length === 0) {
      return null;
    }

    const user = result[0];

    // Check if user is active
    if (!user.isActive) {
      return null;
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    // Update last login
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    return user;
  } catch (error) {
    console.error('[Auth] Authentication error:', error);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  password: string,
  name: string,
  role: 'super_admin' | 'admin' = 'admin'
): Promise<User | null> {
  const db = await getDb();
  if (!db) {
    console.warn('[Auth] Database not available');
    return null;
  }

  try {
    const passwordHash = await hashPassword(password);

    const result = await db.insert(users).values({
      email,
      passwordHash,
      name,
      role,
      isActive: true,
    });

    // Fetch the created user
    const userId = Number(result[0].insertId);
    const createdUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    return createdUser[0] || null;
  } catch (error) {
    console.error('[Auth] User creation error:', error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number): Promise<User | null> {
  const db = await getDb();
  if (!db) {
    return null;
  }

  try {
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('[Auth] Get user error:', error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  if (!db) {
    return null;
  }

  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('[Auth] Get user error:', error);
    return null;
  }
}

/**
 * Initialize super admin if no users exist
 */
export async function initializeSuperAdmin(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn('[Auth] Database not available for super admin initialization');
    return;
  }

  try {
    // Check if any users exist
    const existingUsers = await db.select().from(users).limit(1);
    
    if (existingUsers.length === 0) {
      // Create default super admin
      const defaultEmail = ENV.superAdminEmail || 'admin@transputec.com';
      const defaultPassword = ENV.superAdminPassword || 'Admin@123';
      
      await createUser(defaultEmail, defaultPassword, 'Super Admin', 'super_admin');
      
      console.log('[Auth] Super admin created:', defaultEmail);
      console.log('[Auth] IMPORTANT: Change the default password immediately!');
    }
  } catch (error) {
    console.error('[Auth] Super admin initialization error:', error);
  }
}



/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    const result = await db.select().from(users);
    return result;
  } catch (error) {
    console.error('[Auth] Get all users error:', error);
    return [];
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(userId: number, newPassword: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  try {
    const passwordHash = await hashPassword(newPassword);
    await db.update(users)
      .set({ passwordHash })
      .where(eq(users.id, userId));
    
    return true;
  } catch (error) {
    console.error('[Auth] Update password error:', error);
    return false;
  }
}

/**
 * Update user active status
 */
export async function updateUserStatus(userId: number, isActive: boolean): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  try {
    await db.update(users)
      .set({ isActive })
      .where(eq(users.id, userId));
    
    return true;
  } catch (error) {
    console.error('[Auth] Update user status error:', error);
    return false;
  }
}

