import mongoose from 'mongoose';
import dns from 'dns';

// Ensure robust SRV resolution on Windows environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if permissions disallow setting custom DNS
}

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
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      autoIndex: process.env.NODE_ENV !== 'production',
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
