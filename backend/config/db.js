const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dayflow_hrms';
  try {
    await mongoose.connect(uri);
    console.log(`[dayflow] MongoDB connected -> ${uri}`);
  } catch (err) {
    console.error('[dayflow] MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
