import asyncHandler from 'express-async-handler';
import Exam from '../models/examModel.js';
import Result from '../models/resultModel.js';
import Question from '../models/quesModel.js';

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

  // Fetch questions that belong to this exam. Questions store examId as a string.
  const examQuestions = await Question.find({ examId: examId });

  if (!examQuestions || examQuestions.length === 0) {
    res.status(404);
    throw new Error('No questions found for this exam');
  }

  // Calculate score and prepare result
  let totalScore = 0;
  let maxPossibleScore = 0;
  const resultDetails = [];

  for (const question of examQuestions) {
    // Add to max possible score
    const qMarks = question.marks || 1;
    maxPossibleScore += qMarks;

    const studentAnswer = answers.find(a => a.questionId === question._id.toString());
    // Determine the correct option's _id (options are subdocuments with isCorrect boolean)
    const correctOption = question.options.find((opt) => opt.isCorrect);
    const correctOptionId = correctOption ? correctOption._id.toString() : null;

    // Normalize incoming student answer values to expected types
    const selectedOption = studentAnswer && studentAnswer.selectedOption ? String(studentAnswer.selectedOption) : '';
    // For CODE questions, relies on client-side 'isCorrect' flag if present, else default to false for now
    let isCorrect = false;

    if (question.questionType === 'MCQ') {
      isCorrect = Boolean(selectedOption && correctOptionId && selectedOption === correctOptionId);
    } else if (question.questionType === 'CODE') {
      if (studentAnswer && studentAnswer.isCorrect) isCorrect = true;
    }

    if (isCorrect) totalScore += qMarks;

    resultDetails.push({
      questionId: question._id,
      selectedOption,
      isCorrect
    });
  }

  const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
  const status = percentage >= 50 ? 'Passed' : 'Failed';

  // Create or update the result
  // Use the exam document's ObjectId when saving the result to match the Result schema
  const result = await Result.findOneAndUpdate(
    { student: studentId, exam: exam._id },
    {
      student: studentId,
      exam: exam._id,
      answers: resultDetails,
      score: totalScore,
      maxScore: maxPossibleScore,
      totalQuestions: examQuestions.length,
      percentage: parseFloat(percentage.toFixed(2)),
      timeTaken,
      status,
      submittedAt: new Date()
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // Populate exam details in the response
  const populatedResult = await Result.findById(result._id)
    .populate('exam', 'examName duration')
    .populate('answers.questionId', 'question options');

  res.status(201).json({
    success: true,
    result: {
      ...populatedResult.toObject(),
      correctAnswers: resultDetails.filter(a => a.isCorrect).length,
      wrongAnswers: examQuestions.length - resultDetails.filter(a => a.isCorrect).length,
      percentage: parseFloat(percentage.toFixed(2)),
      score: totalScore,
      maxScore: maxPossibleScore,
      status
    }
  });
});
