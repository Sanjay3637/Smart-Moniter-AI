import mongoose from 'mongoose';

const questionSchema = mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      required: true,
      enum: ['MCQ', 'CODE'],
      default: 'MCQ',
    },
    marks: {
      type: Number,
      required: true,
      default: 1,
    },
    options: [
      {
        optionText: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],
    // For CODE questions
    codeQuestion: {
      inputFormat: { type: String },
      outputFormat: { type: String },
      constraints: { type: String },
      allowedLanguages: [{ type: String }], // e.g. ['java', 'python', 'javascript']
      testCases: [
        {
          input: { type: String, required: true },
          output: { type: String, required: true },
          isHidden: { type: Boolean, default: false },
        },
      ],
    },
    // reference the Exam _id for consistency with Result model
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model('Question', questionSchema);

export default Question;
