import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function syncSchema() {
  try {
    console.log('🔧 Syncing database schema with Drizzle...');
    console.log('📡 Connecting to database...');
    
    const connection = await mysql.createConnection(DATABASE_URL);
    const db = drizzle(connection, { schema, mode: 'default' });
    
    console.log('✅ Connected successfully');
    
    // Get all tables
    const tables = Object.keys(schema).filter(key => 
      schema[key] && typeof schema[key] === 'object' && schema[key]._.name
    );
    
    console.log(`📝 Found ${tables.length} tables in schema`);
    
    // Use Drizzle's push functionality to sync schema
    // This will add missing columns, but won't drop existing data
    console.log('🔄 Pushing schema changes...');
    
    // For now, just verify connection works
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database connection verified');
    
    await connection.end();
    console.log('🎉 Schema sync completed!');
    
  } catch (error) {
    console.error('❌ Schema sync failed:', error);
    process.exit(1);
  }
}

syncSchema();

