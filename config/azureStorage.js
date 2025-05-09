const { BlobServiceClient } = require('@azure/storage-blob');
const config = require('./config');

// Create the BlobServiceClient object with error handling
let blobServiceClient;
try {
    blobServiceClient = BlobServiceClient.fromConnectionString(
        config.AZURE_STORAGE_CONNECTION_STRING
    );
    console.log('Successfully created BlobServiceClient');
} catch (error) {
    console.error('Error creating BlobServiceClient:', error);
    throw new Error('Failed to initialize Azure Storage client');
}

// Get a reference to a container with error handling
let containerClient;
try {
    containerClient = blobServiceClient.getContainerClient(
        config.AZURE_STORAGE_CONTAINER_NAME
    );
    console.log('Successfully created ContainerClient');
} catch (error) {
    console.error('Error creating ContainerClient:', error);
    throw new Error('Failed to initialize Azure Storage container client');
}

const uploadToAzure = async (file, fileName) => {
    try {
        console.log('Starting upload to Azure for file:', fileName);
        
        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        console.log('Blob URL:', blockBlobClient.url);

        // Upload data to the blob
        const uploadResult = await blockBlobClient.upload(file.buffer, file.buffer.length);
        console.log('Upload successful:', uploadResult);

        // Return the blob URL
        return blockBlobClient.url;
    } catch (error) {
        console.error('Error uploading to Azure:', {
            error: error.message,
            stack: error.stack,
            details: error.details || {},
            fileName,
            containerName: config.AZURE_STORAGE_CONTAINER_NAME
        });
        throw new Error('Failed to upload file to storage: ' + error.message);
    }
};

const deleteFromAzure = async (fileName) => {
    try {
        console.log('Starting delete from Azure for file:', fileName);
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        await blockBlobClient.delete();
        console.log('Successfully deleted file:', fileName);
    } catch (error) {
        console.error('Error deleting from Azure:', {
            error: error.message,
            stack: error.stack,
            details: error.details || {},
            fileName,
            containerName: config.AZURE_STORAGE_CONTAINER_NAME
        });
        throw new Error('Failed to delete file from storage: ' + error.message);
    }
};

module.exports = {
    uploadToAzure,
    deleteFromAzure,
    containerClient
}; 
