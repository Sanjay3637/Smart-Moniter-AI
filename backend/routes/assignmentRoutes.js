import express from "express";
import { protect, teacherOnly, studentOnly } from "../middleware/authMiddleware.js";
import {
  createAssignment,
  getTeacherAssignments,
  getStudentAssignments,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignmentController.js";

const assignmentRoutes = express.Router();

// Student route (must be before :id route)
assignmentRoutes
  .route("/my-tasks")
  .get(protect, studentOnly, getStudentAssignments);

// Teacher routes
assignmentRoutes
  .route("/")
  .get(protect, teacherOnly, getTeacherAssignments)
  .post(protect, teacherOnly, createAssignment);

assignmentRoutes
  .route("/:id")
  .put(protect, updateAssignment)
  .delete(protect, teacherOnly, deleteAssignment);

export default assignmentRoutes;
