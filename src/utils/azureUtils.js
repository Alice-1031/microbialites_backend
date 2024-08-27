const { StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');

/**
 * Extracts the blob name from a full Azure Blob Storage URL.
 * @param {string} blobUrl - The full URL of the blob.
 * @returns {string} - The name of the blob.
 */
function extractBlobNameFromUrl(blobUrl) {
    // Assuming the blobUrl is in the format: https://<account>.blob.core.windows.net/<container>/<blob>
    const urlParts = blobUrl.split('/');
    return urlParts.slice(4).join('/'); // Get everything after the container name
}

/**
 * Extracts the blob name from a full Azure Blob Storage URL.
 * @param {string} blobUrl - The full URL of the blob.
 * @returns {string} - url appended with sas token.
 */
function generateSasToken(blobUrl) {
    const blobName = extractBlobNameFromUrl(blobUrl);
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    const containerName = 'microbialitephotos';

    // Create the shared key credential
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    // Set permissions
    const permissions = new BlobSASPermissions();
    permissions.read = true;

    // Set SAS signature values
    const sasOptions = {
        containerName: containerName,
        blobName: blobName,
        permissions: permissions.toString(), // Convert permissions to a string
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour from now
    };

    // Generate the SAS token
    const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();

    // Return the full URL with SAS token appended
    return `${blobUrl}?${sasToken}`;
}


// azureUtils.js
module.exports = {
    generateSasToken,
};
