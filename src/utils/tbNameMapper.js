// /src/utils/tableNameMapper.js

/**
 * Generates property table names based on the structure type. eg tbMegaProperties, tbMicroProperties etc.
 * @param {string} structureType - The type of the structure (e.g., 'Mega', 'Micro').
 */
const getTableName = structureType => {
    return `tb${structureType}Properties`;
};

const getMetadataTableName = structureType => {
    return `tb${structureType}PropertyMetadata`;
};

module.exports = { getTableName, getMetadataTableName };
