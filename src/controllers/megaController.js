const db = require('../config/db');
const {generateSasToken} = require('../utils/azureUtils');


const megaThumbnails = async(req,res) => {
    const {megaIds} = req.body;

    if (!megaIds || megaIds.length === 0) {
        return res.status(400).json({ error: 'No megaids provided' });
    }

    try {
        const thumbnailUrls = await Promise.all(
            megaIds.map(async (megaid) => {
                const query = `
                    SELECT p.photolink
                    FROM tbmegaphotos mp
                    JOIN photolinks p ON mp.photoid = p.photoid
                    WHERE mp.megaid = $1 AND mp.isThumbnail = true;
                `;

                const { rows } = await db.query(query, [megaid]);

                if (rows.length === 0) {
                    return { megaid, thumbnailUrl: null }; // Handle case where no thumbnail is found
                }

                // Generate SAS token for the URL
                const thumbnailUrl = generateSasToken(rows[0].photolink);

                return { megaid, thumbnailUrl };
            })
        );

        res.json(thumbnailUrls);
    } catch (error) {
        console.error('Error fetching thumbnails:', error);
        res.status(500).json({ error: 'Failed to fetch thumbnails' });
    }

}


module.exports = {
    megaThumbnails
}