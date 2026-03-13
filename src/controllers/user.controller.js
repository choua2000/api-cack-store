import { User } from '../models/index.js';
import bcrypt from 'bcrypt';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../middlewares/error.js';

// CREATE new user
export const createUser = catchAsync(async (req, res, next) => {
  const { name, email, phone, password, address, role } = req.body;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const user = await User.create({
    name, email, phone,
    password: hashedPassword,
    address, role: role || 'customer'
  });
  const userResponse = user.toJSON();
  delete userResponse.password;
  res.status(201).json({ success: true, message: 'User created', user: userResponse });
});

// GET all users
export const getAllUsers = catchAsync(async (_req, res, next) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] }
  });
  res.json({ success: true, message: 'All users', users });
});

// GET user by ID
export const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] }
  });
  if (!user) return next(new AppError('User not found', 404));
  res.json({ success: true, data: user });
});

// UPDATE user
export const updateUser = catchAsync(async (req, res, next) => {
  const { name, email, phone, password, address, role } = req.body;
  const user = await User.findByPk(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  const updateData = { name, email, phone, address, role };
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }
  await user.update(updateData);
  const userResponse = user.toJSON();
  delete userResponse.password;
  res.json({ success: true, message: 'User updated', user: userResponse });
});

// DELETE user
export const deleteUser = catchAsync(async (req, res, next) => {
  const deleted = await User.destroy({ where: { id: req.params.id } });
  if (!deleted) return next(new AppError('User not found', 404));
  res.json({ success: true, message: 'User deleted' });
});
