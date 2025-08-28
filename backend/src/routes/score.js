import express from 'express';
import { students } from '../mocks/students.js';
const router = express.Router();
router.get('/average-score', (req, res) => {
  try {
    const response = students.map(student => ({
      studentId: student.id,
      studentName: student.name,
      score: 0
    }));

    res.json({ students: response, avgScore: 0 });
  } catch (error) {
    console.error("Error fetching average score:", error);
    res.status(500).json({ error: "Failed to fetch average score" });
  }
});


export default router;
