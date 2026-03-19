import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

/**
 * Find user by email
 * @param {string} email 
 * @returns {Promise<User|null>}
 */
export const findUserByEmail = async (email) => {
    return await User.findOne({ where: { email } });
};

/**
 * Compare plain password with hashed password
 * @param {string} password 
 * @param {string} hashedPassword 
 * @returns {Promise<boolean>}
 */
export const isPasswordValid = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

/**
 * hash password
 * @param {string} password 
 * @returns {Promise<string>}
 */
export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

/**
 * Check if user is admin
 * @param {number} userId 
 * @returns {Promise<boolean>}
 */
export const isAdmin = async (userId) => {
    const user = await User.findByPk(userId);
    return user && user.role === 'admin';
};

/**
 * Generate JWT token for user
 * @param {object} user 
 * @returns {string}
 */
export const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};

/**
 * Generate refresh token
 * @param {object} user 
 * @returns {string}
 */
export const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + '_refresh'),
        { expiresIn: '7d' }
    );
};

/**
 * Generate password reset token
 * @param {object} user 
 * @returns {string}
 */
export const generateResetToken = (user) => {
    return jwt.sign(
        { id: user.id, reset: true },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};
