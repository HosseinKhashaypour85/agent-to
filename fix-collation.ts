import { sequelize } from './src/config/database';
import 'dotenv/config';

async function fixCollation() {
  try {
    await sequelize.authenticate();
    console.log('Connected');
    
    // Check current collations
    const [results] = await sequelize.query(`
      SELECT TABLE_NAME, TABLE_COLLATION 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'personalsite898_jason' 
      AND TABLE_NAME IN ('customers', 'lead_scores')
    `);
    console.log('Current collations:', results);
    
    // Fix customers table collation
    await sequelize.query('ALTER TABLE customers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci');
    console.log('Fixed customers table');
    
    // Verify
    const [results2] = await sequelize.query(`
      SELECT TABLE_NAME, TABLE_COLLATION 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'personalsite898_jason' 
      AND TABLE_NAME IN ('customers', 'lead_scores')
    `);
    console.log('New collations:', results2);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixCollation();