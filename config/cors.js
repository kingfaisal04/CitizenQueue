import cors from 'cors';

/**
 * CORS Configuration for CitizenQueue Backend
 * Strictly controls allowed origins for the Vercel frontend and local development
 */
export const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, postman, curl, server-to-server health checks)
    if (!origin) {
      return callback(null, true);
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const allowedEnv = (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    const defaultAllowed = [
      clientUrl,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://localhost:4173',
    ];

    const allAllowed = Array.from(new Set([...defaultAllowed, ...allowedEnv]));

    // Check exact match or Vercel preview deployment match
    const isAllowed =
      allAllowed.includes(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked request from unauthorized origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-School-ID',
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // Cache preflight requests for 24 hours
};

export const corsMiddleware = cors(corsOptions);
export default corsMiddleware;
