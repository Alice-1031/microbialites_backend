// /src/utils/tableNameMapper.js

/**
 * Generates table names based on the structure type.
 * @param {string} structureType - The type of the structure (e.g., 'Mega', 'Micro').
 */
const getTableName = structureType => {
    return `tb${structureType}Properties`;
};

const getMetadataTableName = structureType => {
    return `tb${structureType}PropertyMetadata`;
};

module.exports = { getTableName, getMetadataTableName };
