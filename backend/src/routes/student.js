import express from 'express';
import multer from 'multer';
import { frameHandler } from '../controllers/frame.js';

const router = express.Router();
const upload = multer();

router.post(
  '/frame',
  upload.single('frame'),
  frameHandler
);

export default router;