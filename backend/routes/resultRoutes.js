import express from 'express';
import { protect, studentOnly } from '../middleware/authMiddleware.js';
import { saveResult, getStudentResults, getExamResult } from '../controllers/resultController.js';

const router = express.Router();

router.route('/')
  .post(protect, studentOnly, saveResult);

router.route('/student')
  .get(protect, studentOnly, getStudentResults);

router.route('/exam/:examId')
  .get(protect, getExamResult);

export default router;
