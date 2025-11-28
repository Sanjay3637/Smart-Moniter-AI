import asyncHandler from "express-async-handler";
import Exam from "./../models/examModel.js";

// @desc Get all exams
// @route GET /api/exams
// @access Public
const getExams = asyncHandler(async (req, res) => {
  // populate category name if exists
  const exams = await Exam.find().populate('category', 'name');
  res.status(200).json(exams);
});

// @desc Set or update an exam's access code (password)
// @route PUT /api/users/exam/:id/access-code
// @access Private (teacher)
export const updateExamAccessCode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { accessCode } = req.body || {};

  const exam = await Exam.findById(id);
  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  exam.accessCode = accessCode || undefined; // allow clearing if empty
  const saved = await exam.save();
  res.status(200).json({ _id: saved._id, accessCode: Boolean(saved.accessCode) });
});

// @desc Create a new exam
// @route POST /api/exams
// @access Private (teacher)
const createExam = asyncHandler(async (req, res) => {
  const { examName, totalQuestions, duration, liveDate, deadDate, category } = req.body;

  const exam = new Exam({
    examName,
    totalQuestions,
    duration,
    liveDate,
    deadDate,
    category: category || undefined,
  });

  const createdExam = await exam.save();

  if (createdExam) {
    res.status(201).json(createdExam);
  } else {
    res.status(400);
    throw new Error("Invalid Exam Data");
  }
});

// @desc Delete an exam
// @route DELETE /api/exams/:id
// @access Private (teacher only)
const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (exam) {
    await Exam.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Exam deleted successfully" });
  } else {
    res.status(404);
    throw new Error("Exam not found");
  }
});

export { getExams, createExam, deleteExam };

// @desc Validate exam access code and grant session access
// @route POST /api/users/exam/:examId/validate-access
// @access Private (student)
export const validateExamAccess = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { code } = req.body || {};

  const exam = await Exam.findById(examId);
  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  // If no accessCode set for exam, allow implicitly
  if (!exam.accessCode) {
    req.session.examAccess = { ...(req.session.examAccess || {}), [examId]: true };
    return res.status(200).json({ ok: true, message: 'Access granted (no code required)' });
  }

  if (!code || code !== exam.accessCode) {
    res.status(403);
    throw new Error('Invalid access code');
  }

  req.session.examAccess = { ...(req.session.examAccess || {}), [examId]: true };
  res.status(200).json({ ok: true });
});
