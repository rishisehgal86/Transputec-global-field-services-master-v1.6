#!/usr/bin/env node
/**
 * ⚠️⚠️⚠️ DESTRUCTIVE SCRIPT - DO NOT USE ON PRODUCTION ⚠️⚠️⚠️
 * 
 * This script DROPS ALL TABLES and DELETES ALL DATA!
 * 
 * Use this ONLY for:
 * - Initial local development setup
 * - Resetting local test database
 * 
 * For production migrations, use: pnpm db:migrate
 * 
 * ⚠️⚠️⚠️ YOU HAVE BEEN WARNED ⚠️⚠️⚠️
 */
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function resetSchema() {
  try {
    console.log('🗑️  Resetting database schema...');
    
    const connection = await mysql.createConnection(DATABASE_URL);
    console.log('✅ Connected to database');
    
    // Disable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Get all tables
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `);
    
    console.log(`\n📊 Dropping ${tables.length} tables:`);
    
    for (const { TABLE_NAME } of tables) {
      console.log(`  - Dropping ${TABLE_NAME}...`);
      await connection.execute(`DROP TABLE IF EXISTS \`${TABLE_NAME}\``);
    }
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    await connection.end();
    
    console.log('\n✅ All tables dropped successfully!');
    console.log('🔄 Now run: pnpm drizzle-kit push --force');
    console.log('   This will create fresh tables with the correct schema');
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
}

resetSchema();

