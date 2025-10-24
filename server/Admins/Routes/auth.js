import express from 'express';
import { signup, login } from '../controller/authController.js';
import { verifyToken } from '../../middleware/auth.js';

const router = express.Router();

// Optional verifyToken: if Authorization header present it will populate req.user
router.post('/signup', verifyToken, signup);
router.post('/login', login);

export default router;
