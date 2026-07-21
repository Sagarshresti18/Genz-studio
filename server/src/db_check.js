const { getDatabasePool } = require("./config/database");

async function check() {
  try {
    const pool = getDatabasePool();

    const result = await pool.query(`
      SELECT
        current_database() AS database_name,
        current_user AS username,
        version();
    `);

    console.log("✅ Successfully connected to Neon!");
    console.table(result.rows);

  } catch (err) {
    console.error("❌ Connection Failed");
    console.error(err);
  } finally {
    process.exit(0);
  }
}

check();