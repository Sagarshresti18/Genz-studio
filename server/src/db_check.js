const { getDatabasePool } = require('./config/database');

async function check() {
  try {
    const pool = getDatabasePool();
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'video_projects'
    `);
    console.log('Columns in video_projects:', res.rows);
  } catch (err) {
    console.error('Error checking database:', err);
  }
  process.exit(0);
}

check();
