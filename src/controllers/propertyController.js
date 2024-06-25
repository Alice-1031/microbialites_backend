// /src/controllers/propertyController.js
const db = require('../config/db');
const { getTableName, getMetadataTableName } = require('../utils/tbNameMapper');

const addProperty = async (req, res) => {
  const {
    structureType,
    propertyName,
    displayName,
    isRequired,
    isMultiValued,
    singleValuedDataType,
    lookupTableId, //would it be better to pass the name directly?
    newLookupTableName,
    initialData  // Including initialData here to be used later
} = req.body;
  const tableName = getTableName(structureType);
  const metadataTableName = getMetadataTableName(structureType);

  try {
      let actualDataType = singleValuedDataType;
      let actualLookupTableId = lookupTableId;

      // Handle the creation of a new lookup table or use an existing one
      if (newLookupTableName) {
          actualLookupTableId = await createAndPopulateLookupTable(newLookupTableName, initialData);
      }

      if (!singleValuedDataType && !isMultiValued) {
        return res.status(400).send("Missing singleValuedDataType for single-valued property.");
      }

      if(!isMultiValued && actualLookupTableId && actualDataType != 'INT'){
        return res.status(400).send("Single valued type needs to be INT for referecning provided lookup table");
      }

      // Create and modify structure table based on the property type
      await createOrUpdateStructureTable(tableName, propertyName, actualDataType, actualLookupTableId, isMultiValued, structureType);

      // Insert property details into metadata table
      await db.query(
        `INSERT INTO ${metadataTableName} (propertyName, displayName, isRequired, isMultiValued, singleValuedDataType, lookupTableId) 
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [propertyName, displayName, isRequired, isMultiValued, actualDataType, actualLookupTableId]
    );

      res.send(`Property added: ${propertyName} with datatype ${actualDataType} referencing lookuptable id: ${actualLookupTableId}`);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error adding new property');
  }
};

async function createAndPopulateLookupTable(tableName, initialData) {
  const tableId = await createLookupTable(tableName);
  await populateLookupTable(tableName, initialData);
  return tableId;
}

async function createLookupTable(tableName) {
  try{
  const lookupTableInsertResult = await db.query(
      `INSERT INTO tbLookupTables (tableName) VALUES ($1) RETURNING tableId`,
      [tableName]
  );
  return lookupTableInsertResult.rows[0].tableid;
  }catch (error) {
    console.error(`Error in createLookupTable: ${error.message}`);
    throw error; // Propagate the error up to be handled by the caller
  }
}

async function populateLookupTable(tableName, initialData) {
  try{
  const createTableSQL = `
      CREATE TABLE ${tableName} (
          ID SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          notes TEXT
      );
  `;
  await db.query(createTableSQL);

  if (initialData && initialData.length > 0) {
      const insertSQL = `INSERT INTO ${tableName} (name, notes) VALUES ($1, $2)`;
      for (let item of initialData) {
          await db.query(insertSQL, [item.name, item.notes || null]);
      }
  }
  }catch (error) {
    console.error(`Error in populateLookupTable: ${error.message}`);
    throw error; // Propagate the error up to be handled by the caller
  }
}

async function createOrUpdateStructureTable(tableName, propertyName, dataType, lookupTableId, isMultiValued, structureType) {
  try {
      if (isMultiValued) {
          await createJunctionTable(structureType, propertyName, lookupTableId);
      } else {
          let columnDefinition = `${propertyName} ${dataType}`;
          if (dataType === 'INT' && lookupTableId) {
              const lookupTableName = await getLookupTableName(lookupTableId);
              if (!lookupTableName) {
                throw new Error(`Lookup table name could not be resolved for lookupTableId: ${lookupTableId}`);
            }
              columnDefinition += `, ADD CONSTRAINT fk_${propertyName} FOREIGN KEY (${propertyName}) REFERENCES ${lookupTableName}(ID) ON DELETE SET NULL`;
          }
          if (!tableName) {
            throw new Error("tableName is undefined, cannot alter table");
        }
          await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnDefinition};`);
      }
  } catch (error) {
      console.error(`Error in createOrUpdateStructureTable: ${error.message}`);
      throw error; // Propagate the error up to be handled by the caller
  }
}

async function createJunctionTable(structureType, propertyName, lookupTableId) {
  try {
      const lookupTableName = await getLookupTableName(lookupTableId);
      const junctionTableName = `tbjn${structureType}${propertyName}`;
      const junctionTableSQL = `
          CREATE TABLE ${junctionTableName} (
              ${structureType}ID INT,
              ${propertyName}ID INT,
              PRIMARY KEY (${structureType}ID, ${propertyName}ID),
              FOREIGN KEY (${structureType}ID) REFERENCES tb${structureType}Structure(${structureType}ID) ON DELETE CASCADE,
              FOREIGN KEY (${propertyName}ID) REFERENCES ${lookupTableName}(ID) ON DELETE CASCADE
          );
      `;
      await db.query(junctionTableSQL);
  } catch (error) {
      console.error(`Error in createJunctionTable: ${error.message}`);
      throw error; // Propagate the error up to be handled by the caller
  }
}


/**
 * 
 * @param {*} lookupTableId 
 * @returns tablename 
 * this ensures integrity by returning tablename from tableid
 */
async function getLookupTableName(lookupTableId) {
  console.log(`Fetching lookup table name for ID: ${lookupTableId}`);
  const result = await db.query(`SELECT tableName FROM tbLookupTables WHERE tableId = $1`, [lookupTableId]);
  console.log(`Query result:`, result.rows);
  if (result.rows.length === 0) {
      console.error(`No lookup table found for ID: ${lookupTableId}`);
      throw new Error(`Lookup table name could not be resolved for lookupTableId: ${lookupTableId}`);
  }
  return result.rows[0].tablename;
}

/**
 * Fetch all lookup tables from the database and return them.
 */
const getLookupTables = async (req, res) => {
  try {
      const result = await db.query('SELECT tableId, tableName FROM tbLookupTables');
      res.json(result.rows); // Send the lookup tables as JSON
  } catch (error) {
      console.error('Failed to fetch lookup tables:', error);
      res.status(500).send('Failed to fetch lookup tables');
  }
};


module.exports = {
addProperty,
getLookupTables
};
