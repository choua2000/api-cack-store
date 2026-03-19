import express from 'express';
import { createPaymentIntent, handleWebhook } from '../controllers/payment.controller.js';
import { verifyToken } from '../middlewares/auth.js';
import { authorize } from '../constants/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// Create PaymentIntent (Protected)
router.post('/create-payment-intent', verifyToken, authorize(ROLES.ADMIN, ROLES.CUSTOMER), createPaymentIntent);

// Stripe Webhook (Public, needs raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
