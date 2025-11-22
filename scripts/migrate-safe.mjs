#!/usr/bin/env node
/**
 * SAFE DATABASE MIGRATION SCRIPT
 * 
 * This script adds missing columns to existing tables WITHOUT dropping data.
 * Safe to run on production databases.
 * 
 * ⚠️ NEVER use create-tables.mjs on production - it DROPS all tables!
 */
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

console.log('🔧 Starting safe database migration...');
console.log('✅ This script will NOT drop any tables or delete data\n');

const migrations = [
  {
    name: 'Add cancelAtPeriodEnd to organizations',
    check: async (connection) => {
      const [columns] = await connection.execute(
        "SHOW COLUMNS FROM organizations LIKE 'cancelAtPeriodEnd'"
      );
      return columns.length > 0;
    },
    migrate: async (connection) => {
      await connection.execute(
        'ALTER TABLE organizations ADD COLUMN cancelAtPeriodEnd BOOLEAN NOT NULL DEFAULT FALSE AFTER billingCycleEnd'
      );
    },
  },
  // Add more migrations here as needed
  // {
  //   name: 'Add another column',
  //   check: async (connection) => { ... },
  //   migrate: async (connection) => { ... },
  // },
];

try {
  console.log('📡 Connecting to database...');
  const connection = await mysql.createConnection(DATABASE_URL);
  console.log('✅ Connected successfully\n');

  console.log('🔍 Checking which migrations need to run...\n');

  let migrationsRun = 0;
  let migrationsSkipped = 0;

  for (const migration of migrations) {
    try {
      const exists = await migration.check(connection);
      
      if (exists) {
        console.log(`⏭️  SKIP: ${migration.name} (already exists)`);
        migrationsSkipped++;
      } else {
        console.log(`🔄 RUN: ${migration.name}`);
        await migration.migrate(connection);
        console.log(`✅ SUCCESS: ${migration.name}`);
        migrationsRun++;
      }
    } catch (error) {
      console.error(`❌ FAILED: ${migration.name}`);
      console.error(`   Error: ${error.message}`);
      throw error;
    }
  }

  await connection.end();

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Migration completed successfully!');
  console.log(`   Migrations run: ${migrationsRun}`);
  console.log(`   Migrations skipped: ${migrationsSkipped}`);
  console.log('='.repeat(50));
  
  process.exit(0);
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  console.error('\n⚠️  Database may be in an inconsistent state!');
  console.error('   Please review the error and fix manually if needed.');
  process.exit(1);
}

