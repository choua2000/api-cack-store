import express from 'express';
import {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus
} from '../controllers/order.controller.js';

import { verifyToken } from '../middlewares/auth.js';
import { authorize } from '../constants/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', authorize(ROLES.ADMIN, ROLES.CUSTOMER), createOrder);
router.get('/', authorize(ROLES.ADMIN, ROLES.CUSTOMER), getAllOrders);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.CUSTOMER), getOrderById);
router.put('/:id/status', authorize(ROLES.ADMIN), updateOrderStatus);

export default router;
