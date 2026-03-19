import express from 'express';
import {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingStatusAndPrice,
    deleteBooking
} from '../controllers/booking.controller.js';
import { verifyToken } from '../middlewares/auth.js';
import { authorize } from '../constants/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

router.use(verifyToken);

// Authenticated routes
router.post('/', authorize(ROLES.ADMIN, ROLES.CUSTOMER), createBooking);
router.get('/', authorize(ROLES.ADMIN, ROLES.CUSTOMER), getAllBookings);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.CUSTOMER), getBookingById);
router.delete('/:id', authorize(ROLES.ADMIN), deleteBooking);

// Admin only routes
router.patch('/:id', authorize(ROLES.ADMIN), updateBookingStatusAndPrice);

export default router;
