import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function addCreatedByColumn() {
  try {
    console.log('📡 Connecting to database...');
    const connection = await mysql.createConnection(DATABASE_URL);
    console.log('✅ Connected successfully\n');

    // Check if column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'jobs' 
        AND COLUMN_NAME = 'createdBy'
    `);

    if (columns.length > 0) {
      console.log('✅ Column createdBy already exists in jobs table');
    } else {
      console.log('📝 Adding createdBy column to jobs table...');
      await connection.execute(`
        ALTER TABLE jobs 
        ADD COLUMN createdBy INT NULL,
        ADD FOREIGN KEY (createdBy) REFERENCES users(id)
      `);
      console.log('✅ Column createdBy added successfully');
    }

    await connection.end();
    console.log('\n🎉 Migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addCreatedByColumn();

