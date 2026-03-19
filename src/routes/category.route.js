import express from 'express';
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/category.controller.js';

import { verifyToken } from '../middlewares/auth.js';
import { authorize } from '../constants/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

router.post('/', verifyToken, authorize(ROLES.ADMIN), createCategory);
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.put('/:id', verifyToken, authorize(ROLES.ADMIN), updateCategory);
router.delete('/:id', verifyToken, authorize(ROLES.ADMIN), deleteCategory);

export default router;
