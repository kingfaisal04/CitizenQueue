import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async (uri = process.env.MONGO_URI) => {
  if (isConnected) {
    return;
  }

  if (!uri) {
    throw new Error('MONGO_URI is required but was not provided in environment configuration.');
  }

  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      autoIndex: process.env.NODE_ENV !== 'production'
    });

    isConnected = conn.connections[0].readyState === 1;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log('[Database] MongoDB disconnected cleanly.');
};
