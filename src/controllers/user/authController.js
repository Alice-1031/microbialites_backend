const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Correctly extracting the user from the query result
        const result = await db.query('SELECT * FROM Users WHERE Username = $1', [username]);
        const user = result.rows[0];  // This is necessary to correctly access the first user
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.hashed_password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const rolesResult = await db.query(
            'SELECT role_name FROM Roles r JOIN User_Roles ur ON r.role_id = ur.role_id WHERE ur.user_id = $1',
            [user.user_id]
        );
        const roles = rolesResult.rows.map(row => row.role_name);


        const token = jwt.sign({ id: user.user_id, roles}, process.env.JWT_SECRET, { expiresIn: '3h' });
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    // Check for Bearer prefix
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Invalid token format' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { ...decoded, roles: Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles] }; // Ensure roles is an array
        console.log("Decoded token:", decoded); // Log decoded token
        next();
    } catch (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ message: 'Failed to authenticate token' });
    }
};


const checkRole = (requiredRoles) => (req, res, next) => {
    // Check if req.user and req.user.roles are defined and an array
    if (!req.user || !Array.isArray(req.user.roles)) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    // Check if the user's roles array includes at least one of the required roles
    const hasRequiredRole = req.user.roles.some(role => requiredRoles.includes(role));

    if (!hasRequiredRole) {
        console.log("User does not have required role");
        return res.status(403).json({ message: 'Forbidden' });
    }

    next(); // User has the required role, proceed to the next middleware
};


module.exports = {
    login,
    verifyToken,
    checkRole
};