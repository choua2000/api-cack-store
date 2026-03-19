import { Booking, User } from '../models/index.js';
import { authorize } from '../constants/authorize.js';
import { ROLES } from '../constants/roles.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../middlewares/error.js';

// CREATE booking
export const createBooking = catchAsync(async (req, res, next) => {
    const {
        cake_type,
        size,
        flavor,
        message,
        description,
        pickup_date,
        total_price,
    } = req.body;

    if (!cake_type || !size || !flavor || !pickup_date) {
        return next(new AppError('cake_type, size, flavor, and pickup_date are required', 400));
    }

    const booking = await Booking.create({
        user_id: req.user.id,
        cake_type,
        size,
        flavor,
        message,
        description,
        pickup_date,
        total_price,
    });

    return res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking
    });
});

// GET all bookings (Admin can see all, Users can see their own)
export const getAllBookings = catchAsync(async (req, res, next) => {
    let whereClause = {};
    if (req.user.role !== ROLES.ADMIN) {
        whereClause.user_id = req.user.id;
    }

    const bookings = await Booking.findAll({
        where: whereClause,
        include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }
        ],
        order: [['createdAt', 'DESC']]
    });

    return res.json({
        success: true,
        count: bookings.length,
        data: bookings
    });
});

// GET booking by ID
export const getBookingById = catchAsync(async (req, res, next) => {
    const booking = await Booking.findByPk(req.params.id, {
        include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }
        ]
    });

    if (!booking) {
        return next(new AppError('Booking not found', 404));
    }

    // Check permissions
    if (req.user.role !== ROLES.ADMIN && booking.user_id !== req.user.id) {
        return next(new AppError('You do not have permission to view this booking', 403));
    }

    return res.json({
        success: true,
        data: booking
    });
});

// UPDATE booking status & price (Admin Only)
export const updateBookingStatusAndPrice = catchAsync(async (req, res, next) => {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
        return next(new AppError('Booking not found', 404));
    }

    const { status, total_price, payment_status } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (total_price !== undefined) updateData.total_price = total_price;
    if (payment_status) updateData.payment_status = payment_status;

    await booking.update(updateData);

    return res.json({
        success: true,
        message: 'Booking updated successfully',
        data: booking
    });
});

// DELETE booking (Admin or Owner if pending)
export const deleteBooking = catchAsync(async (req, res, next) => {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
        return next(new AppError('Booking not found', 404));
    }

    if (req.user.role !== ROLES.ADMIN) {
        if (booking.user_id !== req.user.id) {
            return next(new AppError('You do not have permission to delete this booking', 403));
        }
        if (booking.status !== 'pending') {
            return next(new AppError('You can only delete pending bookings', 400));
        }
    }

    await booking.destroy();

    return res.json({
        success: true,
        message: 'Booking deleted successfully'
    });
});
