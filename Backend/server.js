import 'dotenv/config';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

const PORT = parseInt(process.env.PORT, 10) || 5000;

const startServer = async () => {
  try {
    // Connect to database
    if (process.env.NODE_ENV !== 'test') {
      await connectDB();
    }

    const server = app.listen(PORT, () => {
      console.log(` CITIZENQUEUE SECURE BACKEND SERVICE IS RUNNING`);
      console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(` Port        : ${PORT}`);
      console.log(` Healthcheck : http://localhost:${PORT}/health`);
      console.log(` API Base    : http://localhost:${PORT}/api/v1`);
    });

    // Graceful Shutdown Handlers
    const handleShutdown = async (signal) => {
      console.log(`\n[SHUTDOWN] Received ${signal}. Closing HTTP server cleanly...`);
      server.close(async () => {
        console.log('[SHUTDOWN] HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });

      // Force exit after 10s if dangling connections persist
      setTimeout(() => {
        console.error('[SHUTDOWN] Forcefully terminating process after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    console.error('[FATAL_ERROR] Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
