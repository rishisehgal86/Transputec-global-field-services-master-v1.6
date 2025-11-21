import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function checkColumns() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  const [columns] = await connection.execute(`
    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'jobs'
    ORDER BY ORDINAL_POSITION
  `);
  
  console.log('Current columns in jobs table:');
  columns.forEach(col => {
    console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
  });
  
  await connection.end();
}

checkColumns();
