import asyncHandler from "express-async-handler";
import Question from "../models/quesModel.js";
import Exam from "../models/examModel.js"; // assuming Exam model is in examModel.js
import Assignment from "../models/assignmentModel.js";

const getQuestionsByExamId = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  if (!examId) {
    return res.status(400).json({ error: 'examId is missing or invalid' });
  }

  const exam = await Exam.findById(examId);
  if (!exam) {
    return res.status(404).json({ error: 'Exam not found' });
  }

  // If the requester is a teacher, allow fetching questions for authoring/review
  if (req.user && req.user.role === 'teacher') {
    const questionsForTeacher = await Question.find({
      $or: [
        { examId: examId },
        { examId: exam._id },
        { examId: String(exam._id) },
      ],
    });
    return res.status(200).json(questionsForTeacher);
  }
  const now = new Date();
  if (now < new Date(exam.liveDate)) {
    return res.status(403).json({ error: 'Exam has not started yet' });
  }
  if (now > new Date(exam.deadDate)) {
    return res.status(403).json({ error: 'Exam window has ended' });
  }

  // 4) If exam requires an access code, ensure cookie/session indicates it was validated
  if (exam.accessCode) {
    const cookieKey = `examAccess_${examId}`;
    let hasCookie = req.cookies && (req.cookies[cookieKey] === '1');
    if (!hasCookie && req.headers && req.headers.cookie) {
      // Fallback manual parse if cookie-parser is not in use
      const raw = '; ' + req.headers.cookie;
      const parts = raw.split('; ' + cookieKey + '=');
      if (parts.length === 2) {
        hasCookie = parts.pop().split(';').shift() === '1';
      }
    }
    const sessionOk = req.session && req.session.examAccess && req.session.examAccess[examId];
    if (!hasCookie && !sessionOk) {
      return res.status(403).json({ error: 'Access code required' });
    }
  }

  // 5) Ensure the requester is a student with an assignment and attempts left
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can access questions' });
  }
  const assign = await Assignment.findOne({
    studentRoll: req.user.rollNumber,
    $or: [
      { examId: examId },
      { examId: String(exam._id) },
      { examId: exam.examId }, // legacy UUID field on Exam
    ],
  });
  if (!assign) {
    return res.status(403).json({ error: 'This exam is not assigned to you' });
  }
  if (assign.attemptsUsed >= assign.maxAttempts) {
    return res.status(403).json({ error: 'Attempt limit reached' });
  }

  // 6) find questions by exam _id (support legacy string/ObjectId storage)
  const questions = await Question.find({
    $or: [
      { examId: examId },
      { examId: exam._id },
      { examId: String(exam._id) },
    ],
  });

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
