import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const examSchema = mongoose.Schema(
  {
    examName: {
      type: String,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    liveDate: {
      type: Date,
      required: true,
    },
    deadDate: {
      type: Date,
      required: true,
    },
    // Optional access code set by teacher to gate exam start
    accessCode: {
      type: String,
    },
    // Define examId field with UUID generation
    examId: {
      type: String,
      default: uuidv4, // Generate a new UUID for each document
      unique: true, // Ensure uniqueness of UUIDs
    },

    // Optional reference to a category (created by teacher)
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
  },
  {
    timestamps: true,
  }
);

const Exam = mongoose.model("Exam", examSchema);

export default Exam;
