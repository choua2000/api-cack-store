import express from 'express';
import {
  createUser,
  getAllUsers, 
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/user.controller.js';

const router = express.Router();

// Create user
router.post('/create', createUser);

// Get all users
router.get('/getall', getAllUsers);

// Get one user
router.get('/getid/:id', getUserById);

// Update user
router.put('/update/:id', updateUser);

// Delete user
router.delete('/delete/:id', deleteUser);

export default router;
