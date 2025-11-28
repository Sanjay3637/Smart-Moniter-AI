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
  const now = new Date();
  if (now < new Date(exam.liveDate)) {
    return res.status(403).json({ error: 'Exam has not started yet' });
  }
  if (now > new Date(exam.deadDate)) {
    return res.status(403).json({ error: 'Exam window has ended' });
  }

  // 4) If exam requires an access code, ensure session indicates it was validated
  if (exam.accessCode) {
    const access = req.session && req.session.examAccess && req.session.examAccess[examId];
    if (!access) {
      return res.status(403).json({ error: 'Access code required' });
    }
  }

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
