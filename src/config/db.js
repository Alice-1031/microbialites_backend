const { Pool } = require('pg');
require('dotenv').config();
const connectionString = process.env.DATABASE_URL;

const pool = new Pool(connectionString ? { 
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  } 
} : {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool;
