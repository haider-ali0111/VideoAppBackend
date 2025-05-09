module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://haideraliak91:pW4lmU556BdBcYGn@videoapp.ezy2xek.mongodb.net/?retryWrites=true&w=majority&appName=VideoApp',
    JWT_SECRET: '100',
    JWT_EXPIRE: '30d',
    JWT_COOKIE_EXPIRE: 30,
    AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING || 'DefaultEndpointsProtocol=https;AccountName=videodistributionstorage;AccountKey=SHhz7aR43i+eOKXde7+Sg0OpMw3UlJmLOl3W1e70GAN5qMi+vT1x6zyES+i7SOlAsGGgtiaCQQz9+AStluu5Zg==;EndpointSuffix=core.windows.net',
    AZURE_STORAGE_CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME || 'video-uploads'
}; 