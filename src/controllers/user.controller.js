import { User } from '../models/index.js';
import bcrypt from 'bcrypt';

// CREATE new user
export const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, address, role } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await User.create({
      name, email, phone,
      password: hashedPassword,
      address, role: role || 'customer'
    });
    res.status(201).json({ message: 'User created', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all users
export const getAllUsers = async (_req, res) => {
  try {
    const users = await User.findAll();
    res.json({ message: 'All users', users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE user
export const updateUser = async (req, res) => {
  try {
    const { name, email, phone, password, address, role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updateData = { name, email, phone, address, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    await user.update(updateData);
    res.json({ message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE user
export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
