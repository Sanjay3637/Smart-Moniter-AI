import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
          required: true
        },
        selectedOption: {
          type: String,
          required: true
        },
        isCorrect: {
          type: Boolean,
          required: true
        }
      }
    ],
    score: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    timeTaken: {
      type: Number, // in seconds
      required: true
    },
    status: {
      type: String,
      enum: ['Passed', 'Failed'],
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Create a compound index to ensure one result per student per exam
resultSchema.index({ student: 1, exam: 1 }, { unique: true });

const Result = mongoose.model('Result', resultSchema);

export default Result;
