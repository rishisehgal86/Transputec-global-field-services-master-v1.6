import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const BACKUP_DIR = './database-backups';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

async function backupDatabase() {
  try {
    console.log('📦 Starting database backup...');
    
    // Create backup directory
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    const connection = await mysql.createConnection(DATABASE_URL);
    console.log('✅ Connected to database');
    
    // Get all tables
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `);
    
    const backup = {
      timestamp: new Date().toISOString(),
      tables: {}
    };
    
    console.log(`\n📊 Found ${tables.length} tables to backup:`);
    
    for (const { TABLE_NAME } of tables) {
      console.log(`  - Backing up ${TABLE_NAME}...`);
      const [rows] = await connection.execute(`SELECT * FROM \`${TABLE_NAME}\``);
      backup.tables[TABLE_NAME] = rows;
      console.log(`    ✓ ${rows.length} rows backed up`);
    }
    
    // Save backup to file
    const backupFile = path.join(BACKUP_DIR, `backup-${TIMESTAMP}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    await connection.end();
    
    console.log(`\n✅ Backup completed successfully!`);
    console.log(`📁 Backup saved to: ${backupFile}`);
    console.log(`\n💾 Total data backed up:`);
    
    for (const [tableName, rows] of Object.entries(backup.tables)) {
      console.log(`   ${tableName}: ${rows.length} rows`);
    }
    
    return backupFile;
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

backupDatabase();

