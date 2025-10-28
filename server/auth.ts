import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a new user (admin or super_admin)
 */
export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role: "super_admin" | "admin";
  createdBy?: number;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const passwordHash = await hashPassword(data.password);

  const [user] = await db.insert(users).values({
    email: data.email,
    passwordHash,
    name: data.name,
    role: data.role,
    isActive: 1,
    createdBy: data.createdBy || null,
  });

  return user;
}

/**
 * Authenticate a user with email and password
 */
export async function authenticateUser(email: string, password: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return null;
  }

  if (user.isActive !== 1) {
    throw new Error("Account is inactive");
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  // Update last login
  await db
    .update(users)
    .set({ lastLogin: new Date() })
    .where(eq(users.id, user.id));

  return user;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user || null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user || null;
}

/**
 * Initialize super admin if none exists
 */
export async function initializeSuperAdmin() {
  const db = await getDb();
  if (!db) {
    console.warn("[Auth] Database not available, skipping super admin initialization");
    return;
  }

  try {
    // Check if any super admin exists
    const [existingSuperAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.role, "super_admin"))
      .limit(1);

    if (existingSuperAdmin) {
      console.log("[Auth] Super admin already exists");
      return;
    }

    // Create default super admin
    const defaultEmail = process.env.SUPER_ADMIN_EMAIL || "rishis@transputec.com";
    const defaultPassword = process.env.SUPER_ADMIN_PASSWORD || "Admin@123";
    const defaultName = process.env.SUPER_ADMIN_NAME || "Super Admin";

    await createUser({
      email: defaultEmail,
      password: defaultPassword,
      name: defaultName,
      role: "super_admin",
    });

    console.log(`[Auth] Super admin created: ${defaultEmail}`);
    console.log(`[Auth] Default password: ${defaultPassword}`);
    console.log("[Auth] IMPORTANT: Change this password immediately after first login!");
  } catch (error) {
    console.error("[Auth] Failed to initialize super admin:", error);
  }
}

/**
 * Get all users (for admin management)
 */
export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(users);
}

/**
 * Update user
 */
export async function updateUser(
  id: number,
  data: {
    name?: string;
    email?: string;
    password?: string;
    role?: "super_admin" | "admin";
    isActive?: number;
  }
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: any = {};

  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;
  if (data.password) updateData.passwordHash = await hashPassword(data.password);
  if (data.role) updateData.role = data.role;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  await db.update(users).set(updateData).where(eq(users.id, id));
}

/**
 * Delete user (deactivate)
 */
export async function deactivateUser(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(users).set({ isActive: 0 }).where(eq(users.id, id));
}

