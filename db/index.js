const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://postgres:1234@localhost:5432/postgres' || process.env.DATABASE_URL || 'postgres://postgres:1234@localhost:5432/postgres',
  ssl: false,
  // ssl: {
  //   rejectUnauthorized: false
  // },
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 0,
});
module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  }
}