import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../utils/ApiResponse.js';

const isTest = process.env.NODE_ENV === 'test';

/**
 * Standard rate limiter for general API routes
 */
export const generalLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 mins
      max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        return ApiResponse.error(res, 'Too many requests from this IP, please try again later.', 429);
      },
    });

/**
 * Strict rate limiter for sensitive authentication & authorization endpoints
 */
export const authLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 mins
      max: 15, // Max 15 attempts
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        return ApiResponse.error(res, 'Too many authentication attempts, please try again in 15 minutes.', 429);
      },
    });

/**
 * Upload limiter for presigned URL generation and file submission
 */
export const uploadLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 40,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        return ApiResponse.error(res, 'Too many upload attempts, please try again shortly.', 429);
      },
    });
