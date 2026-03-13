import express from 'express';
import { createPaymentIntent, handleWebhook } from '../controllers/payment.controller.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// Create PaymentIntent (Protected)
router.post('/create-payment-intent', verifyToken, createPaymentIntent);

// Stripe Webhook (Public, needs raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
