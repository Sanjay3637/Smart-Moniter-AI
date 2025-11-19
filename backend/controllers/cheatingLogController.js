import asyncHandler from "express-async-handler";
import mongoose from 'mongoose';
import CheatingLog from "../models/cheatingLogModel.js";
import User from "../models/userModel.js";

// @desc Save cheating log data
// @route POST /api/cheatingLogs
// @access Private
const saveCheatingLog = asyncHandler(async (req, res) => {
  const {
    noFaceCount,
    multipleFaceCount,
    cellPhoneCount,
    prohibitedObjectCount,
    examId,
    username,
    email,
  } = req.body;

  const cheatingLog = new CheatingLog({
    noFaceCount,
    multipleFaceCount,
    cellPhoneCount,
    prohibitedObjectCount,
    examId,
    username,
    email,
  });

  const savedLog = await cheatingLog.save();

  // Try to locate the student and update malpractice counters.
  // Prefer authenticated user (student) if available; else try by email.
  try {
    let targetUser = null;
    if (req.user && req.user.role === 'student') {
      targetUser = await User.findById(req.user._id);
    } else if (email) {
      targetUser = await User.findOne({ email });
    }

    if (targetUser && targetUser.role === 'student') {
      targetUser.malpracticeCount = (targetUser.malpracticeCount || 0) + 1;
      if (targetUser.malpracticeCount >= 2) {
        targetUser.isBlocked = true;
      }
      await targetUser.save();
    }
  } catch (e) {
    // do not fail the request if user update fails; log in server logs
    console.error('Failed to update malpractice counters', e);
  }

  if (savedLog) {
    res.status(201).json(savedLog);
  } else {
    res.status(400);
    throw new Error("Invalid Cheating Log Data");
  }
});

// @desc Get all cheating log data for a specific exam
// @route GET /api/cheatingLogs/:examId
// @access Private
const getCheatingLogsByExamId = asyncHandler(async (req, res) => {
  const examId = req.params.examId;
  const cheatingLogs = await CheatingLog.find({ examId });

  res.status(200).json(cheatingLogs);
});

// @desc Delete a cheating log entry by ID
// @route DELETE /api/cheatingLogs/:id
// @access Private/Teacher
const deleteCheatingLog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate id to avoid Mongoose CastError
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid cheating log id');
  }

  const deleted = await CheatingLog.findByIdAndDelete(id);

  if (!deleted) {
    res.status(404);
    throw new Error('Cheating log not found');
  }

  res.status(200).json({ message: 'Cheating log deleted', id });
});

export { saveCheatingLog, getCheatingLogsByExamId, deleteCheatingLog };
