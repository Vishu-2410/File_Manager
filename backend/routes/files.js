import express from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/auth.js';
import { listFiles, uploadFile, downloadFile, shareFile, deleteFile } from '../controllers/fileController.js';

const router = express.Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

import fs from 'fs';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const maxSize = (Number(process.env.MAX_FILE_SIZE_MB) || 20) * 1024 * 1024;
const upload = multer({ storage, limits: { fileSize: maxSize } });

router.get('/', authMiddleware, listFiles);
router.post('/upload', authMiddleware, upload.single('file'), uploadFile);
router.get('/download/:id', authMiddleware, downloadFile);
router.post('/share/:id', authMiddleware, shareFile);
router.delete('/:id', authMiddleware, deleteFile);

export default router;
