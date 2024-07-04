const db = require('../config/db');

const getAllWaypoints = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tbWaypt');
        res.json(result.rows); // Send all waypoints as JSON
    } catch (error) {
        console.error("Error fetching waypoints: ", error);
        res.status(500).send("Failed to fetch waypoints");
    }
}

module.exports = {
    getAllWaypoints
}