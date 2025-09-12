import express from 'express';
import multer from 'multer';
import { FrameController } from '../controllers/frame.js';

const router = express.Router();
const upload = multer();

router.post(
  '/frame',
  upload.single('frame'),
  async (req, res, next) => {
    try {
      const uow = req.app.locals.uow;            
      const ctrl = new FrameController(uow);     
      await ctrl.frameHandler(req, res);         
    } catch (err) {
      next(err);
    }
  }
);

export default router;
