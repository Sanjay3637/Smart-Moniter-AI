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
  getStudentByIdentifier,
  getStudentHistory,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import { protect, teacherOnly, studentOnly } from "../middleware/authMiddleware.js";
import { saveCheatingLog } from "../controllers/cheatingLogController.js";
const userRoutes = express.Router();

// Registration routes - public for admin page
userRoutes.post("/", registerUser);
userRoutes.post("/register", registerUser);

// Auth routes (public)
userRoutes.post("/auth", authUser);
userRoutes.post("/logout", logoutUser);
userRoutes.post("/forgot-password", forgotPassword);
userRoutes.post("/reset-password", resetPassword);

// Admin routes - public for admin page
userRoutes.get('/all', getAllUsers);
userRoutes.delete('/:id', deleteUser);

// cheating logs
userRoutes.post('/cheatingLogs', protect, saveCheatingLog);

// teacher/admin unblock endpoint
userRoutes.post('/unblock', unblockUser);
// teacher-only block endpoint
userRoutes.post('/block', protect, teacherOnly, blockUser);
// teacher-only: lookup student by email/rollNumber
userRoutes.get('/student', protect, teacherOnly, getStudentByIdentifier);
// teacher/admin: student's full history
userRoutes.get('/student/history', getStudentHistory);

// protecting profile route using auth middleware protect
userRoutes
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default userRoutes;
