import express from 'express';
import {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus
} from '../controllers/order.controller.js';

import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);

export default router;
