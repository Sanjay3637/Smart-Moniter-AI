import express from "express";

import { protect, teacherOnly, studentOnly } from "../middleware/authMiddleware.js";
import { createExam, getExams, deleteExam } from "../controllers/examController.js";
import {
  createQuestion,
  getQuestionsByExamId,
} from "../controllers/quesController.js";
import {
  getCheatingLogsByExamId,
  saveCheatingLog,
  deleteCheatingLog,
} from "../controllers/cheatingLogController.js";
import { createCategory, getCategories, deleteCategory } from "../controllers/categoryController.js";
const examRoutes = express.Router();

// protecting Exam route using auth middleware protect /api/users/
examRoutes.route("/exam").get(protect, getExams).post(protect, teacherOnly, createExam);
examRoutes.route("/exam/:id").delete(protect, teacherOnly, deleteExam);
examRoutes.route("/exam/questions").post(protect, teacherOnly, createQuestion);
examRoutes.route("/exam/questions/:examId").get(protect, getQuestionsByExamId);
// Categories
examRoutes.route('/categories').get(protect, getCategories).post(protect, teacherOnly, createCategory);
examRoutes.route('/categories/:id').delete(protect, teacherOnly, deleteCategory);
examRoutes.route("/cheatingLogs/:examId").get(protect, teacherOnly, getCheatingLogsByExamId);
examRoutes.route("/cheatingLogs/").post(protect, studentOnly, saveCheatingLog);
// Allow teacher to delete a cheating log entry by id
examRoutes.route("/cheatingLogs/:id").delete(protect, teacherOnly, deleteCheatingLog);

export default examRoutes;
