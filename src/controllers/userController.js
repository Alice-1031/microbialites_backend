const db = require('../config/db');
const bcrypt = require('bcrypt');
const saltRounds = 10;  // The cost factor controls how much time is needed to calculate a single BCrypt hash.

async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
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

module.exports = {
    createUser
};