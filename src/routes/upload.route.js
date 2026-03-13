import express from 'express';
import upload from '../middlewares/upload.js';
import { uploadFile, deleteFile } from '../controllers/upload.controller.js';

import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', upload.single('file'), uploadFile);
router.delete('/', deleteFile);

export default router;
