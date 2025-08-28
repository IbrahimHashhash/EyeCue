import express from 'express';
import { frameHandler } from '../controllers/frame.js';

const router = express.Router();

router.post(
  '/frame',
  express.raw({ type: '*/*', limit: '5mb' }),
  frameHandler
);


export default router;