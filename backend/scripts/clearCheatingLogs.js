import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import the CheatingLog model
import CheatingLog from '../models/cheatingLogModel.js';

const clearCheatingLogs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete all cheating logs
    const result = await CheatingLog.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} cheating logs`);
    
    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

clearCheatingLogs();
