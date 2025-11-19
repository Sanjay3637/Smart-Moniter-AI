import Result from '../models/resultModel.js';
import Exam from '../models/examModel.js';
import asyncHandler from 'express-async-handler';

// @desc    Save exam result
// @route   POST /api/results
// @access  Private/Student
export const saveResult = asyncHandler(async (req, res) => {
  const { examId, answers, timeTaken } = req.body;
  const studentId = req.user._id;

  // Get the exam with questions
  const exam = await Exam.findById(examId).populate('questions');
  
  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  // Calculate score and prepare result
  let correctAnswers = 0;
  const resultDetails = [];

  exam.questions.forEach(question => {
    const studentAnswer = answers.find(a => a.questionId === question._id.toString());
    const isCorrect = studentAnswer && studentAnswer.selectedOption === question.correctOption;
    
    if (isCorrect) correctAnswers++;
    
    resultDetails.push({
      questionId: question._id,
      selectedOption: studentAnswer ? studentAnswer.selectedOption : 'Not answered',
      isCorrect
    });
  });

  const percentage = (correctAnswers / exam.questions.length) * 100;
  const status = percentage >= 60 ? 'Passed' : 'Failed';

  // Create or update the result
  const result = await Result.findOneAndUpdate(
    { student: studentId, exam: examId },
    {
      student: studentId,
      exam: examId,
      answers: resultDetails,
      score: correctAnswers,
      totalQuestions: exam.questions.length,
      percentage,
      timeTaken,
      status
    },
    { new: true, upsert: true }
  );

  res.status(201).json(result);
});

// @desc    Get student's results
// @route   GET /api/results/student
// @access  Private/Student
export const getStudentResults = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  
  const results = await Result.find({ student: studentId })
    // populate exam and its category name so frontend can display category
    .populate({
      path: 'exam',
      select: 'examName totalQuestions duration category',
      populate: { path: 'category', select: 'name' },
    })
    .sort({ submittedAt: -1 });

  // Transform results to include flat exam fields for easier frontend access
  const transformedResults = results.map(result => {
    const resultObj = result.toObject();
    return {
      ...resultObj,
      examId: resultObj.exam?._id || resultObj.exam,
      examName: resultObj.exam?.examName || 'Unnamed Exam',
      examDuration: resultObj.exam?.duration,
      examTotalQuestions: resultObj.exam?.totalQuestions,
      examCategoryName: resultObj.exam?.category?.name || 'Uncategorized',
    };
  });

  res.json(transformedResults);
});

// @desc    Get result for a specific exam
// @route   GET /api/results/exam/:examId
// @access  Private
export const getExamResult = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const studentId = req.user._id;
  
  const result = await Result.findOne({ 
    student: studentId, 
    exam: examId 
  })
  .populate({
    path: 'exam',
    select: 'examName totalQuestions duration category',
    populate: { path: 'category', select: 'name' },
  })
  .populate('answers.questionId', 'questionText options correctOption');

  if (!result) {
    res.status(404);
    throw new Error('Result not found');
  }

  res.json(result);
});
