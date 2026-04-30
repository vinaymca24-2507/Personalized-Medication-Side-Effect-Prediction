const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const logger = require('../utils/logger');

let mongoServer = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    
    // If no URI provided, use built-in memory database
    if (!uri) {
      logger.info('No MONGO_URI specified. Starting built-in in-memory MongoDB...');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log('🌱 Started built-in in-memory database at:', uri);
    }

    await mongoose.connect(uri);
    logger.info('MongoDB connected successfully');
    console.log('✅ MongoDB connected to:', uri.includes('localhost') || uri.includes('127.0.0.1') ? 'Local/Memory DB' : 'Cloud DB');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;


