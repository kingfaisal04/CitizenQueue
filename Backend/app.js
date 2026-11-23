import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { corsMiddleware } from './config/cors.js';
import { generalLimiter } from './middleware/rateLimitMiddleware.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';
import apiRoutes from './routes/index.js';

const app = express();

// Trust first reverse proxy hop (required on Render / Vercel / load balancers for rate limiting & secure cookies)
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet());

// CORS Configuration
app.use(corsMiddleware);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie Parser
app.use(cookieParser());

// Request logging (suppressed in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// General API rate limiting
app.use('/api', generalLimiter);

// Liveness & Readiness Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'citizenqueue-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount modular API v1 routes
app.use('/api/v1', apiRoutes);

// 404 Route Not Found Handler
app.use(notFoundHandler);

// Global Centralized Error Handler
app.use(errorHandler);

export default app;
