import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodshare';
    
    const conn = await mongoose.connect(mongoURI);

    console.log(`📊 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // For demo purposes, continue without database
    console.log('🔄 Running in demo mode without database connection');
    console.log('💡 To use with real data, set up MongoDB Atlas and update MONGODB_URI in .env');
  }
};

export default connectDB;