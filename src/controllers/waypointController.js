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
    const { types, minAge, maxAge } = req.query;

    // Convert types to an array of numbers, ensuring no invalid entries
    const typeArray = types ? types.split(',').map(type => {
        const num = Number(type);
        if (isNaN(num)) throw new Error('Invalid type input');
        return num;
    }) : [];

    // Validate age inputs
    const minAgeInt = parseInt(minAge, 10) || 0;
    const maxAgeInt = parseInt(maxAge, 10) || 2147483647;
    if (isNaN(minAgeInt) || isNaN(maxAgeInt) || minAgeInt > maxAgeInt) {
        return res.status(400).send("Invalid age range");
    }

    console.log("Received types:", typeArray);
    console.log("Received minAge:", minAgeInt);
    console.log("Received maxAge:", maxAgeInt);

    let query;
    let queryParams;

    if (typeArray.length > 0) {
        query = `
            SELECT
                w.wayptid,
                w.lat,
                w.long,
                array_agg(DISTINCT m.megaid) AS matching_megaid_list
            FROM
                tbWaypt w
                INNER JOIN tbmegastructure m ON w.wayptid = m.wayptid
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
                LEFT JOIN tbmegaproperties p ON m.megaid = p.megaid
            WHERE
                p.age BETWEEN $2 AND $3
            GROUP BY
                w.wayptid;
        `;
        queryParams = [typeArray, minAgeInt, maxAgeInt];
    } else {
        query = `
            SELECT
                w.wayptid,
                w.lat,
                w.long,
                array_agg(DISTINCT m.megaid) AS matching_megaid_list
            FROM
                tbWaypt w
                INNER JOIN tbmegastructure m ON w.wayptid = m.wayptid
                LEFT JOIN tbmegaproperties p ON m.megaid = p.megaid
            WHERE
                p.age BETWEEN $1 AND $2
            GROUP BY
                w.wayptid;
        `;
        queryParams = [minAgeInt, maxAgeInt];
    }

    try {
        const result = await db.query(query, queryParams);
        console.log("Query result:", result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching filtered waypoints:", error);
        res.status(500).send("Failed to fetch filtered waypoints");
    }
};



module.exports = {
    getAllWaypoints,
    getAllFilteredWaypoints
}