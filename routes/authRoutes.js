import express from 'express';
import {
  registerStudent,
  registerAdmin,
  login,
  refreshToken,
  logout,
  getMe,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import {
  studentRegisterSchema,
  adminRegisterSchema,
  loginSchema,
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', authLimiter, validate(studentRegisterSchema), registerStudent);
router.post('/register-admin', authLimiter, validate(adminRegisterSchema), registerAdmin);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
