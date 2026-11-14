import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { changePasswordSchema } from '../validators/authValidators.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', validate(changePasswordSchema), changePassword);

export default router;
