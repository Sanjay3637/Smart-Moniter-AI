import express from "express";
import {
  authUser,
  getUserProfile,
  logoutUser,
  registerUser,
  updateUserProfile,
  unblockUser,
  blockUser,
  getAllUsers,
  deleteUser,
} from "../controllers/userController.js";
import { protect, teacherOnly, studentOnly } from "../middleware/authMiddleware.js";
import { saveCheatingLog, getCheatingLogsByExamId, deleteCheatingLog } from "../controllers/cheatingLogController.js";
import { createExam, getExams } from "../controllers/examController.js";
const userRoutes = express.Router();

// Registration routes - public for admin page
userRoutes.post("/", registerUser);
userRoutes.post("/register", registerUser);

// Auth routes (public)
userRoutes.post("/auth", authUser);
userRoutes.post("/logout", logoutUser);

// Admin routes - public for admin page
userRoutes.get('/all', getAllUsers);
userRoutes.delete('/:id', deleteUser);

// cheating logs (mounted under /api/users to match existing frontend slice)
userRoutes.post('/cheatingLogs', protect, saveCheatingLog);
userRoutes.get('/cheatingLogs/:examId', protect, teacherOnly, getCheatingLogsByExamId);
userRoutes.delete('/cheatingLogs/:id', protect, teacherOnly, deleteCheatingLog);

// teacher-only unblock endpoint
userRoutes.post('/unblock', protect, teacherOnly, unblockUser);
// teacher-only block endpoint
userRoutes.post('/block', protect, teacherOnly, blockUser);

// protecting profile route using auth middleware protect
userRoutes
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default userRoutes;
