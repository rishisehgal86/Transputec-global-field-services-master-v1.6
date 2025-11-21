#!/usr/bin/env node
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

console.log('[DB Init] Connecting to database...');

try {
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);
  
  console.log('[DB Init] Connected successfully');
  console.log('[DB Init] Database initialization complete');
  
  await connection.end();
  process.exit(0);
} catch (error) {
  console.error('[DB Init] Failed:', error);
  process.exit(1);
}

