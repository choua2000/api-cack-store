import express from 'express';
import { register, login, registerAdmin, loginAdmin, forgotPassword, resetPassword, refreshToken } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup-customer', register);
router.post('/login-customer', login);
router.post('/signup-admin', registerAdmin);
router.post('/login-admin', loginAdmin);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);

export default router;