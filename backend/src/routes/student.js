import express from 'express';
import { frameHandler } from '../controllers/frame.js';

const router = express.Router();

router.post(
    '/frame',
    express.raw({type:'image/*', limit:'5mb'}),
    frameHandler
);

export default router;