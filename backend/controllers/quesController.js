import asyncHandler from "express-async-handler";
import Question from "../models/quesModel.js";
import Exam from "../models/examModel.js"; // assuming Exam model is in examModel.js

const getQuestionsByExamId = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  if (!examId) {
    return res.status(400).json({ error: 'examId is missing or invalid' });
  }

  const exam = await Exam.findById(examId);
  if (!exam) {
    return res.status(404).json({ error: 'Exam not found' });
  }
  // Note: We intentionally allow fetching questions regardless of time window or access code
  // so the UI can render consistently. Enforcement happens when starting/submitting the exam.

  // 5) find questions by exam _id
  const questions = await Question.find({ examId });

  res.status(200).json(questions);
});

const createQuestion = asyncHandler(async (req, res) => {
  const { question, options, examId } = req.body;

  if (!examId) {
    return res.status(400).json({ error: 'examId is missing or invalid' });
  }

  // examId expected to be a Mongo ObjectId referring to Exam._id
  const newQuestion = new Question({
    question,
    options,
    examId,
  });

  const createdQuestion = await newQuestion.save();

  if (createdQuestion) {
    res.status(201).json(createdQuestion);
  } else {
    res.status(400);
    throw new Error('Invalid Question Data');
  }
});

export { getQuestionsByExamId, createQuestion };
