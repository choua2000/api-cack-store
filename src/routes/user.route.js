import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  updateStatus
} from '../controllers/user.controller.js';

import { verifyToken } from '../middlewares/auth.js';
import { authorize } from '../constants/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

router.use(verifyToken);

// Create user
router.post('/create', authorize(ROLES.ADMIN), createUser);

// Get all users
router.get('/getall', authorize(ROLES.ADMIN), getAllUsers);

// Get one user
router.get('/getid/:id', authorize(ROLES.ADMIN), getUserById);

// Update user
router.put('/update/:id', authorize(ROLES.ADMIN, ROLES.CUSTOMER), updateUser);

// Delete user
router.delete('/delete/:id', authorize(ROLES.ADMIN), deleteUser);

// Get user profile
router.get('/profile', authorize(ROLES.ADMIN, ROLES.CUSTOMER), getProfile);

// Update user status
router.put('/update-status/:id', authorize(ROLES.ADMIN), updateStatus);

export default router;
