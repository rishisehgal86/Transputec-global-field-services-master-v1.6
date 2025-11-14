import { eq, and } from "drizzle-orm";
import { passwordResetTokens } from "../drizzle/schema";
import { getDb } from "./db";
import { randomBytes } from "crypto";

/**
 * Generate a secure random token for password reset
 */
export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Create a password reset token for a user
 * Token expires in 1 hour
 */
export async function createPasswordResetToken(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  try {
    await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt,
      used: false,
    });

    return token;
  } catch (error) {
    console.error('[PasswordReset] Create token error:', error);
    throw new Error('Failed to create password reset token');
  }
}

/**
 * Validate a password reset token
 * Returns userId if valid, null otherwise
 */
export async function validatePasswordResetToken(token: string): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const resetToken = result[0];

    // Check if token has expired
    if (new Date() > new Date(resetToken.expiresAt)) {
      return null;
    }

    return resetToken.userId;
  } catch (error) {
    console.error('[PasswordReset] Validate token error:', error);
    return null;
  }
}

/**
 * Mark a password reset token as used
 */
export async function markTokenAsUsed(token: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.token, token));

    return true;
  } catch (error) {
    console.error('[PasswordReset] Mark token as used error:', error);
    return false;
  }
}

/**
 * Delete expired password reset tokens (cleanup)
 */
export async function deleteExpiredTokens(): Promise<void> {
  const db = await getDb();
  if (!db) {
    return;
  }

  try {
    const now = new Date();
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.expiresAt, now));
  } catch (error) {
    console.error('[PasswordReset] Delete expired tokens error:', error);
  }
}

