import express from 'express';
import { scoreHandler } from '../controllers/score.js';

const router = express.Router();

router.get(
  '/average-score',
  scoreHandler
);

export default router;