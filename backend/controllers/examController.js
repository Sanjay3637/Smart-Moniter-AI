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
