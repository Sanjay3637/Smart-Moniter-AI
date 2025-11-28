import asyncHandler from "express-async-handler";
import Assignment from "../models/assignmentModel.js";
import User from "../models/userModel.js";

// @desc Create a new assignment
// @route POST /api/users/assignments
// @access Private (teacher only)
const createAssignment = asyncHandler(async (req, res) => {
  const { examId, examName, studentRoll, dueDate, maxAttempts } = req.body;

  // Find student by roll number
  const student = await User.findOne({ rollNumber: studentRoll });

  if (!student) {
    res.status(404);
    throw new Error('Student not found with this roll number');
  }

  if (student.role !== 'student') {
    res.status(400);
    throw new Error('The provided roll number does not belong to a student account');
  }

  // Check if assignment already exists for this student roll
  const existingAssignment = await Assignment.findOne({
    examId,
    studentRoll,
  });

  if (existingAssignment) {
    res.status(400);
    throw new Error('This exam is already assigned to this student');
  }

  const assignment = new Assignment({
    examId,
    examName,
    studentRoll,
    // keep studentEmail in assignment for contact if user has one
    studentEmail: student.email || undefined,
    studentName: student.name,
    assignedBy: req.user.name,
    assignedByEmail: req.user.email,
    dueDate,
    status: 'pending',
    maxAttempts: Number(maxAttempts) > 0 ? Number(maxAttempts) : 1,
  });

  const createdAssignment = await assignment.save();

  if (createdAssignment) {
    res.status(201).json(createdAssignment);
  } else {
    res.status(400);
    throw new Error("Invalid assignment data");
  }
});

// @desc Get all assignments (for teachers - all assignments they created)
// @route GET /api/users/assignments
// @access Private (teacher only)
const getTeacherAssignments = asyncHandler(async (req, res) => {
  const assignments = await Assignment.find({
    assignedByEmail: req.user.email,
  }).sort({ createdAt: -1 });
  res.status(200).json(assignments);
});

// @desc Get student's assigned exams
// @route GET /api/users/assignments/my-tasks
// @access Private (student only)
const getStudentAssignments = asyncHandler(async (req, res) => {
  // students are identified by roll number
  const assignments = await Assignment.find({
    studentRoll: req.user.rollNumber,
  }).sort({ dueDate: 1 });
  res.status(200).json(assignments);
});

// @desc Update assignment status
// @route PUT /api/users/assignments/:id
// @access Private
const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    res.status(404);
    throw new Error("Assignment not found");
  }

  const { status, score, completedAt, maxAttempts, attemptsUsed } = req.body;

  if (status) assignment.status = status;
  if (score !== undefined) assignment.score = score;
  if (completedAt) assignment.completedAt = completedAt;
  if (maxAttempts !== undefined) {
    const m = Number(maxAttempts);
    if (!Number.isNaN(m) && m >= 1) {
      assignment.maxAttempts = m;
      // keep attemptsUsed within new cap
      if (assignment.attemptsUsed > m) assignment.attemptsUsed = m;
    }
  }
  if (attemptsUsed !== undefined) {
    const a = Number(attemptsUsed);
    if (!Number.isNaN(a) && a >= 0) {
      assignment.attemptsUsed = Math.min(a, assignment.maxAttempts || 1);
    }
  }

  const updatedAssignment = await assignment.save();
  res.status(200).json(updatedAssignment);
});

// @desc Delete an assignment
// @route DELETE /api/users/assignments/:id
// @access Private (teacher only)
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    res.status(404);
    throw new Error("Assignment not found");
  }

  // Check if the teacher who created it is deleting it
  if (assignment.assignedByEmail !== req.user.email) {
    res.status(403);
    throw new Error("Not authorized to delete this assignment");
  }

  await Assignment.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: "Assignment deleted successfully" });
});

export {
  createAssignment,
  getTeacherAssignments,
  getStudentAssignments,
  updateAssignment,
  deleteAssignment,
};
