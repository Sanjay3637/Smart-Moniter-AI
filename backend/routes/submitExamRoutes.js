import express from 'express';
import { protect, studentOnly } from '../middleware/authMiddleware.js';
import { submitExam } from '../controllers/submitExamController.js';

const router = express.Router();

// Submit exam answers
// keep root POST for compatibility
router.route('/').post(protect, studentOnly, submitExam);

// Also accept POST /submit to match frontend direct fetch calls
router.route('/submit').post(protect, studentOnly, submitExam);

export default router;
