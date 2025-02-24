// Import the 'pg' (node-postgres) module to interact with a PostgreSQL database
const { Pool } = require('pg');

// Load environment variables from a .env file
require('dotenv').config();

// Retrieve the database connection string from environment variables (useful for cloud-based services)
const connectionString = process.env.DATABASE_URL;

// Create a new database connection pool
const pool = new Pool(
  connectionString 
    ? { 
        // If a DATABASE_URL is provided, use it for connection (common in production setups like Heroku, Azure, etc.)
        connectionString: connectionString, 
        ssl: {
          rejectUnauthorized: false // Required for some managed cloud databases (e.g., Heroku PostgreSQL)
        }
      } 
    : { 
        // If no DATABASE_URL is provided, use individual environment variables for local development
        user: process.env.DB_USER,       // Database username
        host: process.env.DB_HOST,       // Database host (e.g., localhost or cloud instance)
        database: process.env.DB_NAME,   // Database name
        password: process.env.DB_PASSWORD, // Database password
        port: process.env.DB_PORT        // Database port (typically 5432 for PostgreSQL)
      }
);

// Export the pool object so that other modules can use it to query the database
module.exports = pool;
