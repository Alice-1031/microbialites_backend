// Load environment variables from a .env file into process.env
require('dotenv').config();

// Import Express.js framework
const express = require('express');

// Create an instance of an Express application
const app = express();

// Import the main routes from the routes folder (likely ./routes/index.js)
const mainRoutes = require('./routes/index');

// Import CORS middleware to handle cross-origin requests
const cors = require('cors');

// Define CORS options to control which origins are allowed to access the API
const corsOptions = {
  // Allow requests from a specified origin (from .env or default to localhost:3001)
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  
  // Specify allowed HTTP methods
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  
  // Allow cookies and credentials in CORS requests
  credentials: true,
  
  // Respond with a 204 status code for successful OPTIONS preflight requests
  optionsSuccessStatus: 204,
};

// Apply CORS middleware with the defined options
app.use(cors(corsOptions));

// Middleware to parse JSON request bodies
app.use(express.json());

// Attach all defined routes to the root URL ('/')
app.use('/', mainRoutes);

// Define the port for the server, using an environment variable if available
const port = process.env.PORT || 3000;

// Start the Express server and listen on the defined port
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Error-handling middleware: catches and logs errors, then sends a 500 response
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
 
// Export the app instance (useful for testing or integrating with other modules)
// module.exports = app;