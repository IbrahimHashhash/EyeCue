import express from 'express';
import { SessionController } from '../controllers/session.js';

const router = express.Router();
const sessionController = new SessionController();

router.post('/start', (req, res) => sessionController.startSession(req, res));
router.post('/end', (req, res) => sessionController.endSession(req, res));

export default router;