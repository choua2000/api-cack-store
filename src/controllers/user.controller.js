import { User, Order } from '../models/index.js';
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
  res.json({ success: true, message: 'All users', data: users });
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
  const { name, email, phone, password, address } = req.body;
  const user = await User.findByPk(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  const updateData = { name, email, phone, address };
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


// GET user profile
export const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
    include: [
      { model: Order, as: 'orders', attributes: ['id', 'total_amount', 'status', 'createdAt'] }
    ]
  });
  if (!user) return next(new AppError('User not found', 404));
  res.json({ success: true, data: user });
});

//MEAN: UPDATE STATUS USER
export const updateStatus = catchAsync(async (req, res, next) => {
  const { isActive } = req.body;
  const user = await User.findByPk(req.params.id);
  if (!user) return next(new AppError('User not found', 404));
  user.isActive = isActive;
  await user.save();
  res.json({ success: true, message: 'User status updated', user });
});
