import express from 'express';
import { SessionController } from '../controllers/session.js';

const router = express.Router();
const sessionController = new SessionController();

router.post('/start', (req, res) => {
  const ctrl = new SessionController(req.app.locals.uow);
  return ctrl.startSession(req, res);
});

router.post('/end', (req, res) => {
  const ctrl = new SessionController(req.app.locals.uow);
  return ctrl.endSession(req, res);
});

export default router;