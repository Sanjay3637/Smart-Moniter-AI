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
    studentEmail: {
      type: String,
      required: true,
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
