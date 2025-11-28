import asyncHandler from 'express-async-handler';
import Exam from '../models/examModel.js';
import Result from '../models/resultModel.js';
import Question from '../models/quesModel.js';
import Assignment from '../models/assignmentModel.js';

// @desc    Submit exam answers
// @route   POST /api/exams/submit
// @access  Private/Student
export const submitExam = asyncHandler(async (req, res) => {
  const { examId, answers, timeTaken } = req.body;
  const studentId = req.user._id;

  // Get the exam
  const exam = await Exam.findById(examId);

  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  // Ensure assignment exists and attempts remain (support various examId formats)
  const assign = await Assignment.findOne({
    studentRoll: req.user.rollNumber,
    $or: [
      { examId: examId },
      { examId: String(exam._id) },
      { examId: exam.examId },
    ],
  });
  if (!assign) {
    res.status(403);
    throw new Error('This exam is not assigned to you');
  }
  if (assign.attemptsUsed >= assign.maxAttempts) {
    res.status(403);
    throw new Error('Attempt limit reached');
  }

  // Fetch questions that belong to this exam. Questions store examId as a string.
  const examQuestions = await Question.find({ examId: examId });
  
  if (!examQuestions || examQuestions.length === 0) {
    res.status(404);
    throw new Error('No questions found for this exam');
  }

  // Calculate score and prepare result
  let correctAnswers = 0;
  const resultDetails = [];

  for (const question of examQuestions) {
    const studentAnswer = answers.find(a => a.questionId === question._id.toString());
    // Determine the correct option's _id (options are subdocuments with isCorrect boolean)
    const correctOption = question.options.find((opt) => opt.isCorrect);
    const correctOptionId = correctOption ? correctOption._id.toString() : null;

    // Normalize incoming student answer values to expected types
    const selectedOption = studentAnswer && studentAnswer.selectedOption ? String(studentAnswer.selectedOption) : '';
    const isCorrect = Boolean(selectedOption && correctOptionId && selectedOption === correctOptionId);

    if (isCorrect) correctAnswers++;

    resultDetails.push({
      questionId: question._id,
      selectedOption,
      isCorrect
    });
  }

  const percentage = (correctAnswers / examQuestions.length) * 100;
  const status = percentage >= 60 ? 'Passed' : 'Failed';

  // Create or update the result
  // Use the exam document's ObjectId when saving the result to match the Result schema
  const result = await Result.findOneAndUpdate(
    { student: studentId, exam: exam._id },
    {
      student: studentId,
      exam: exam._id,
      answers: resultDetails,
      score: correctAnswers,
      totalQuestions: examQuestions.length,
      percentage,
      timeTaken,
      status,
      submittedAt: new Date()
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // After saving result, increment attemptsUsed (capped at max)
  try {
    assign.attemptsUsed = Math.min(assign.attemptsUsed + 1, assign.maxAttempts);
    if (assign.attemptsUsed >= assign.maxAttempts) {
      assign.completedAt = assign.completedAt || new Date();
      assign.status = 'completed';
    }
    await assign.save();
  } catch (e) {
    // do not block result response on assignment save error
  }

  // Populate exam details in the response
  const populatedResult = await Result.findById(result._id)
    .populate('exam', 'examName duration')
    .populate('answers.questionId', 'question options');

  res.status(201).json({
    success: true,
    result: {
      ...populatedResult.toObject(),
      correctAnswers,
  wrongAnswers: examQuestions.length - correctAnswers,
      percentage: parseFloat(percentage.toFixed(2)),
      status
    }
  });
});
