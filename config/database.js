// config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Database connection function
const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL Database Connected Successfully');
    connection.release();
    return pool;
  } catch (error) {
    console.error('Database Connection Failed:', error);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  pool
};
