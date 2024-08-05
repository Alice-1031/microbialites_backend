const db = require('../../config/db');
const bcrypt = require('bcrypt');
const saltRounds = 10;  // The cost factor controls how much time is needed to calculate a single BCrypt hash.

async function hashPassword(password) {
    if (!password) {
        throw new Error('Password is required for hashing.');
    }

    try {
        const salt = await bcrypt.genSalt(saltRounds);
        if (!salt) {
            throw new Error('Failed to generate salt.');
        }
        const hashedPassword = await bcrypt.hash(password, salt);
        if (!hashedPassword) {
            throw new Error('Failed to hash the password.');
        }
        return hashedPassword;
    } catch (error) {
        console.error('Hashing failed:', error);
        throw error;
    }
}

const createUser = async(req,res) => {
    const{username,password} = req.body;

    const hashedPassword = await hashPassword(password);
    const query = `INSERT INTO Users (username, hashed_password) VALUES ($1, $2) RETURNING *`;
    try {
        const result = await db.query(query, [username, hashedPassword]);
        const newUser = result.rows[0];
        console.log('User created:', newUser);
        res.json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' }); // Send a 500 Internal Server Error response
    }
};

const updateLogin = async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the user's password in the database
    const query = `UPDATE Users SET hashed_password = $1 WHERE username = $2 RETURNING *`;
    const result = await db.query(query, [hashedPassword, username]);

    // Check if the user was found and updated
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' }); // Send a 404 Not Found response if user does not exist
    }

    const updatedUser = result.rows[0];
    console.log('Password updated for user:', updatedUser);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal server error' }); // Send a 500 Internal Server Error response
  }
};

module.exports = {
    createUser,
    updateLogin
};