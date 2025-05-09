const { BlobServiceClient } = require('@azure/storage-blob');

// Direct configuration instead of using .env
const connectionString = "DefaultEndpointsProtocol=https;AccountName=videodistributionstorage;AccountKey=SHhz7aR43i+eOKXde7+Sg0OpMw3UlJmLOl3W1e70GAN5qMi+vT1x6zyES+i7SOlAsGGgtiaCQQz9+AStluu5Zg==;EndpointSuffix=core.windows.net";
const containerName = "video-uploads";

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

const uploadToAzure = async (file, fileName) => {
    try {
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        await blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: { blobContentType: file.mimetype }
        });
        return blockBlobClient.url;
    } catch (error) {
        console.error('Error uploading to Azure:', error);
        throw error;
    }
};

const deleteFromAzure = async (fileName) => {
    try {
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        await blockBlobClient.delete();
    } catch (error) {
        console.error('Error deleting from Azure:', error);
        throw error;
    }
};

module.exports = {
    uploadToAzure,
    deleteFromAzure,
    containerClient
}; 