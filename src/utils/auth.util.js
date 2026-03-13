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
 * Generate JWT token for user
 * @param {object} user 
 * @returns {string}
 */
export const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};
