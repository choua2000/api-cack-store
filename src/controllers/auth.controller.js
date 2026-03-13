import { User } from '../models/index.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { findUserByEmail, isPasswordValid, generateToken } from '../utils/auth.util.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../middlewares/error.js';

// register 
export const register = catchAsync(async (req, res, next) => {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
        return next(new AppError('Validation failed', 400));
    }

    const { name, email, password, phone, address, role } = validation.data;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        return next(new AppError('User already exists', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: role || 'customer'
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    return res.status(201).json({ success: true, message: 'User created', user: userResponse });
});

//login
export const login = catchAsync(async (req, res, next) => {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
        return next(new AppError('Validation failed', 400));
    }

    const { email, password } = validation.data;

    const user = await findUserByEmail(email);
    if (!user) {
        return next(new AppError('Invalid credentials', 401));
    }

    const isValid = await isPasswordValid(password, user.password);
    if (!isValid) {
        return next(new AppError('Invalid credentials', 401));
    }

    const token = generateToken(user);

    return res.status(200).json({ success: true, message: 'Login successful', token });
});
