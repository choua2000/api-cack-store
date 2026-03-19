import express from 'express';
import upload from '../middlewares/upload.js';
import { uploadFile, deleteFile } from '../controllers/upload.controller.js';

import { verifyToken } from '../middlewares/auth.js';
import { authorize } from '../constants/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorize(ROLES.ADMIN));

router.post('/', upload.single('file'), uploadFile);
router.delete('/', deleteFile);

export default router;
