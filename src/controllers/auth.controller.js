import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { registerCustomerSchema, loginCustomerSchema, registerAdminSchema, loginAdminSchema, forgotPasswordSchema, resetPasswordSchema, refreshTokenSchema } from '../validators/auth.validator.js';
import { findUserByEmail, isPasswordValid, generateToken, generateRefreshToken, generateResetToken, hashPassword } from '../utils/auth.util.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../middlewares/error.js';
import { ROLES } from '../constants/roles.js';
import { sendResetPasswordEmail } from '../utils/mailer.util.js';

// register 
export const register = catchAsync(async (req, res, next) => {
    const validation = registerCustomerSchema.safeParse(req.body);
    if (!validation.success) {
        return next(new AppError('Validation failed', 400));
    }

    const { name, email, password, phone, address } = validation.data;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        return next(new AppError('User already exists', 400));
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: 'customer'
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    return res.status(201).json({ success: true, message: 'User created', user: userResponse });
});

//login
export const login = catchAsync(async (req, res, next) => {
    const validation = loginCustomerSchema.safeParse(req.body);
    if (!validation.success) {
        return next(new AppError('Validation failed', 400));
    }

    const { email, password } = validation.data;

    const user = await findUserByEmail(email);
    if (!user) {
        return next(new AppError('Invalid credentials Email', 401));
    }

    if (user.role !== ROLES.CUSTOMER) {
        return next(new AppError('Access denied. Customer privileges required.', 403));
    }

    if (!user.isActive) {
        return next(new AppError('Your account is inactive. Please contact support.', 403));
    }

    const isValid = await isPasswordValid(password, user.password);
    if (!isValid) {
        return next(new AppError('Invalid credentials Password', 401));
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.status(200).json({ success: true, message: 'Login successful', token: { accessToken: token, refreshToken: refreshToken } });
});

// MEAN : register admin
export const registerAdmin = catchAsync(async (req, res, next) => {
    const validation = registerAdminSchema.safeParse(req.body);
    if (!validation.success) {
        return next(new AppError('Validation failed', 400));
    }

    const { name, email, password, phone, address } = validation.data;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        return next(new AppError('User already exists', 400));
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: 'admin'
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    return res.status(201).json({ success: true, message: 'User created', user: userResponse });
});

// MEAN : login admin
export const loginAdmin = catchAsync(async (req, res, next) => {
    const validation = loginAdminSchema.safeParse(req.body);
    if (!validation.success) {
        return next(new AppError('Validation failed', 400));
    }

    const { email, password } = validation.data;

    const user = await findUserByEmail(email);
    if (!user) {
        return next(new AppError('Invalid credentials', 401));
    }

    if (user.role !== ROLES.ADMIN) {
        return next(new AppError('Access denied. Administrator privileges required.', 403));
    }

    if (!user.isActive) {
        return next(new AppError('Your account is inactive. Please contact support.', 403));
    }

    const isValid = await isPasswordValid(password, user.password);
    if (!isValid) {
        return next(new AppError('Invalid credentials', 401));
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.status(200).json({ success: true, message: 'Login successful', token: { accessToken: token, refreshToken: refreshToken } });
});

// forgot password
export const forgotPassword = catchAsync(async (req, res, next) => {
    const validation = forgotPasswordSchema.safeParse(req.body);
    if (!validation.success) {
        return next(new AppError('Validation failed', 400));
    }
    const { email } = validation.data;
    const user = await findUserByEmail(email);
    if (!user) {
        return next(new AppError('User not found', 404));
    }
    const resetToken = generateResetToken(user);

    // Send the token via email
    const emailSent = await sendResetPasswordEmail(user.email, resetToken);
    if (!emailSent) {
        return next(new AppError('There was an error sending the reset email. Please try again later.', 500));
    }

    return res.status(200).json({
        success: true,
        message: 'Password reset email sent. Please check your inbox.',
        // For local testing convenience before adding real emails, you might temporarily keep this visible, 
        // but for safety, the next line is usually removed.
        // resetToken 
    });
});

// reset password
export const resetPassword = catchAsync(async (req, res, next) => {
    const validation = resetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
        return next(new AppError('Validation failed', 400));
    }
    const { token, newPassword } = validation.data;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.reset) {
            return next(new AppError('Invalid token type', 400));
        }
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }
        user.password = await hashPassword(newPassword);
        await user.save();
        return res.status(200).json({ success: true, message: 'Password has been reset successfully' });
    } catch (err) {
        return next(new AppError('Invalid or expired reset token', 400));
    }
});

// refresh token
export const refreshToken = catchAsync(async (req, res, next) => {
    const validation = refreshTokenSchema.safeParse(req.body);
    if (!validation.success) {
        return next(new AppError('Validation failed', 400));
    }
    const { refreshToken: token } = validation.data;
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + '_refresh'));
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }
        const newAccessToken = generateToken(user);
        const newRefreshToken = generateRefreshToken(user);
        return res.status(200).json({
            success: true,
            token: { accessToken: newAccessToken, refreshToken: newRefreshToken }
        });
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
});