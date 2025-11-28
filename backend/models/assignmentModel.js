import mongoose from 'mongoose';

const assignmentSchema = mongoose.Schema(
  {
    examId: {
      type: String,
      required: true,
    },
    examName: {
      type: String,
      required: true,
    },
    // store student roll number (primary lookup for students)
    studentRoll: {
      type: String,
      required: true,
    },
    // optional student email for contact (kept for backwards compatibility)
    studentEmail: {
      type: String,
      required: false,
    },
    studentName: {
      type: String,
      required: true,
    },
    assignedBy: {
      type: String,
      required: true,
    },
    assignedByEmail: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'overdue'],
      default: 'pending',
    },
    // attempt controls per student per exam
    maxAttempts: {
      type: Number,
      default: 1,
      min: 1,
    },
    attemptsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedAt: {
      type: Date,
    },
    score: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
