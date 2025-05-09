module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI || 'your_mongodb_connection_string',
    JWT_SECRET: 'your-secure-jwt-secret-key-here',
    JWT_EXPIRE: '30d',
    JWT_COOKIE_EXPIRE: 30,
    AZURE_STORAGE_CONNECTION_STRING: 'your_azure_storage_connection_string',
    AZURE_STORAGE_CONTAINER_NAME: 'your_container_name'
}; 