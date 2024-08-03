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


const getAllFilteredWaypoints = async (req, res) => {
    const { types, period_name } = req.query;

    // Convert types to an array of numbers, ensuring no invalid entries
    const typeArray = types ? types.split(',').map(type => {
        const num = Number(type);
        if (isNaN(num)) throw new Error('Invalid type input');
        return num;
    }) : [];

    try {
        let periodPath = null;
        if (period_name) {
            // Fetch the path for the given period name
            const periodResult = await db.query('SELECT path FROM geological_periods WHERE period_name = $1', [period_name]);
            if (periodResult.rows.length === 0) {
                return res.status(404).send("Period not found");
            }
            periodPath = periodResult.rows[0].path + '%';
        }

        console.log("received types:", typeArray);
        console.log("received period_name:", period_name);

        let query = `
            SELECT
                w.wayptid,
                w.lat,
                w.long,
                array_agg(DISTINCT m.megaid) AS matching_megaid_list
            FROM
                tbWaypt w
                INNER JOIN tbmegastructure m ON w.wayptid = m.wayptid
        `;

        let joinCondition = "";
        let whereCondition = "";
        let queryParams = [];

        if (typeArray.length > 0) {
            joinCondition += `
                INNER JOIN (
                    SELECT
                        mt.megaid
                    FROM
                        tbjnmegamicrobialitetypes mt
                    GROUP BY
                        mt.megaid
                    HAVING
                        ARRAY_AGG(mt.microbialitetypesid ORDER BY mt.microbialitetypesid) = $1
                ) AS filtered_megaids ON m.megaid = filtered_megaids.megaid
            `;
            queryParams.push(typeArray);
        }

        if (periodPath) {
            joinCondition += `
                LEFT JOIN tbmegaproperties p ON m.megaid = p.megaid
                LEFT JOIN geological_periods gp ON p.age = gp.id
            `;
            whereCondition += ` WHERE gp.path LIKE $${queryParams.length + 1}`;
            queryParams.push(periodPath);
        }

        query += joinCondition;
        query += whereCondition;
        query += " GROUP BY w.wayptid";

        const result = await db.query(query, queryParams);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching filtered waypoints:", error);
        res.status(500).send("Failed to fetch filtered waypoints");
    }
};

const getAllPeriodNames = async (req, res) => {
    try {
        const result = await db.query('SELECT period_name FROM geological_periods');
        res.json(result.rows.map(row => row.period_name));
    } catch (error) {
        console.error("Error fetching period names:", error);
        res.status(500).send("Failed to fetch period names");
    }
};



module.exports = {
    getAllWaypoints,
    getAllFilteredWaypoints,
    getAllPeriodNames
}