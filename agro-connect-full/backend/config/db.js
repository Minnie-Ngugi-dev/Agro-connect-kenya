import mongoose from 'mongoose';
import logger from './logger.js';
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB: ${conn.connection.host}`);
  } catch (err) {
    logger.error(`DB error: ${err.message}`);
    process.exit(1);
  }
};
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
export default connectDB;
