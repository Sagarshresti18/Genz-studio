const fs = require('fs');
const path = require('path');
const { getDatabasePool } = require('../config/database');

async function initDB() {
  const pool = getDatabasePool();
  try {
    console.log('Running extensions and modular schemas...');
    
    // Core extensions
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    
    const featuresDir = path.join(__dirname, '../features');
    
    // 1. Run Core Schemas (Users must exist before others)
    const runSchema = async (folder) => {
      const p = path.join(featuresDir, folder, 'schema.sql');
      if (fs.existsSync(p)) {
        await pool.query(fs.readFileSync(p, 'utf8'));
        console.log(`✅ ${folder} schema loaded`);
      }
    };
    
    await runSchema('users');
    await runSchema('projects');
    
    // 2. Run Feature Schemas
    const folders = fs.readdirSync(featuresDir);
    for (const folder of folders) {
      if (folder === 'users' || folder === 'projects') continue;
      await runSchema(folder);
    }
    
    console.log('🎉 All Database tables created successfully!');
    
  } catch (err) {
    console.error('❌ Failed to initialize database:');
    console.error(err);
  } finally {
    process.exit(0);
  }
}

initDB();