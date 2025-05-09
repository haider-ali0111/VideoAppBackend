const validateAzureStorageConfig = () => {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || 'DefaultEndpointsProtocol=https;AccountName=videoserviceapp;AccountKey=k/4M98sffK1zHKlUDUlVzHCVS1x55/yqcgbU5duVO5pgG2b/afUddkHfWrK3uKCvUi8iy5GQWeOu+AStxc+YUw==;EndpointSuffix=core.windows.net';
    
    if (!connectionString.includes('DefaultEndpointsProtocol=https')) {
        throw new Error('Azure Storage connection string must use HTTPS');
    }
    
    return connectionString;
};

module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://haideraliak91:pW4lmU556BdBcYGn@videoapp.ezy2xek.mongodb.net/?retryWrites=true&w=majority&appName=VideoApp',
    JWT_SECRET: '100',
    JWT_EXPIRE: '30d',
    JWT_COOKIE_EXPIRE: 30,
    AZURE_STORAGE_CONNECTION_STRING: validateAzureStorageConfig(),
    AZURE_STORAGE_CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME || 'video-uploads'
}; 
