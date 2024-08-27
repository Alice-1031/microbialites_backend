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

        let query = `
            SELECT
                w.wayptid,
                w.lat,
                w.long,
                json_agg(
                    json_build_object(
                        'megaid', m.megaid,
                        'type_ids', t.type_ids
                    )
                ) AS megas
            FROM
                tbWaypt w
                INNER JOIN tbmegastructure m ON w.wayptid = m.wayptid
                INNER JOIN (
                    SELECT
                        mt.megaid,
                        array_agg(DISTINCT mt.microbialitetypesid ORDER BY mt.microbialitetypesid) AS type_ids
                    FROM
                        tbjnmegamicrobialitetypes mt
                    GROUP BY
                        mt.megaid
                ) t ON m.megaid = t.megaid
        `;

        let joinCondition = "";
        let whereCondition = "";
        let queryParams = [];

        if (periodPath) {
            joinCondition += `
                LEFT JOIN tbmegaproperties p ON m.megaid = p.megaid
                LEFT JOIN geological_periods gp ON p.age = gp.id
            `;
            whereCondition += ` WHERE gp.path LIKE $${queryParams.length + 1}`;
            queryParams.push(periodPath);
        }

        if (typeArray.length > 0) {
            // Filter to ensure the result contains all types from typeArray
            whereCondition += (whereCondition ? " AND " : " WHERE ") + `
                m.megaid IN (
                    SELECT mt.megaid
                    FROM tbjnmegamicrobialitetypes mt
                    WHERE mt.microbialitetypesid = ANY($${queryParams.length + 1})
                    GROUP BY mt.megaid
                    HAVING array_agg(mt.microbialitetypesid ORDER BY mt.microbialitetypesid) @> $${queryParams.length + 1}
                )
            `;
            queryParams.push(typeArray);
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


const getMegasAtWaypoint = async (req, res) => {
    const { waypointId } = req.params; // Extract waypointId from the request parameters

    try {
        const query = `
            SELECT megaid
            FROM tbmegastructure
            WHERE wayptid = $1;
        `;

        const { rows } = await db.query(query, [waypointId]);

        // If no megaids are found for the given waypointId, return an empty array
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No megas found for the given waypoint' });
        }

        // Extract megaids from the result rows
        const megaIds = rows.map(row => row.megaid);

        // Return the list of megaids as a JSON response
        res.json({ megaIds });
    } catch (error) {
        console.error('Error fetching megas at waypoint:', error.message);
        res.status(500).json({ error: 'Failed to fetch megas at waypoint' });
    }
};



module.exports = {
    getAllWaypoints,
    getAllFilteredWaypoints,
    getAllPeriodNames,
    getMegasAtWaypoint
}