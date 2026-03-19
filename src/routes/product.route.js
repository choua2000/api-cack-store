import express from 'express';
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProductsByName
} from '../controllers/product.controller.js';
import upload from '../middlewares/upload.js';
import { verifyToken } from '../middlewares/auth.js';
import { authorize } from '../constants/authorize.js';
import { ROLES } from '../constants/roles.js';
const router = express.Router();

router.get('/search', searchProductsByName);
router.post('/', verifyToken, authorize(ROLES.ADMIN), upload.single('image'), createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id', verifyToken, authorize(ROLES.ADMIN), upload.single('image'), updateProduct);
router.delete('/:id', verifyToken, authorize(ROLES.ADMIN), deleteProduct);

export default router;
