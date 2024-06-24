// /src/controllers/propertyController.js
const db = require('../config/db');
const { getTableName, getMetadataTableName } = require('../utils/tbNameMapper');

const addProperty = async (req, res) => {
    const { structureType, propertyName, displayName, isRequired, isMultiValued, singleValuedDataType, lookupTableId, newLookupTableName } = req.body;
    const tableName = getTableName(structureType);
    const metadataTableName = getMetadataTableName(structureType);

    try {
      let actualDataType = singleValuedDataType;
      let actualLookupTableId = null;

      // Handling the creation of a new lookup table or use an existing one
      if (isMultiValued) {
        actualDataType = 'INT';  // Default data type for multivalued properties
        if (!lookupTableId && newLookupTableName) {
          const lookupResult = await db.query(
            `INSERT INTO tbLookupTables (tableName) VALUES ($1) RETURNING tableId`, 
            [newLookupTableName]
          );
          actualLookupTableId = lookupResult.rows[0].tableId;
        } else if (lookupTableId) {
          actualLookupTableId = lookupTableId;
        } else {
          throw new Error("Missing lookupTableId for a multivalued property.");
        }
      } else if (!singleValuedDataType) {
        throw new Error("Missing singleValuedDataType for single-valued property.");
      }

      // Insert property details into metadata table
      await db.query(
        `INSERT INTO ${metadataTableName} (propertyName, display_name, is_required, isMultiValued, singleValuedDataType, lookupTable) 
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [propertyName, displayName, isRequired, isMultiValued, actualDataType, actualLookupTableId]
      );

      // Alter the structure table based on the property type
      if (!isMultiValued) {
        let columnDefinition = `${propertyName} ${actualDataType}`;
        if (lookupTableId) {  // Add foreign key constraint if lookup table ID is provided
            columnDefinition += `, ADD CONSTRAINT fk_${propertyName} FOREIGN KEY (${propertyName}) REFERENCES tbLookupTables(tableId)`;
        }
        await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnDefinition};`);
        res.send(`Single-valued property added: ${propertyName} with datatype ${actualDataType} in ${tableName}`);
    } else {
        // For multi-valued, we assume a junction table setup will be handled separately
        res.send(`Multivalued property metadata added, prepare for junction table configuration.`);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error adding new property');
    }
};

module.exports = {
  addProperty
};
