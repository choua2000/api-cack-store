import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// All cart routes require authentication
router.use(verifyToken);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update/:itemId', cartController.updateCartItem);
router.delete('/remove/:itemId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

export default router;
