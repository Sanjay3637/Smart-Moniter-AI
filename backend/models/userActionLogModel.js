import mongoose from "mongoose";

const userActionLogSchema = new mongoose.Schema(
  {
    rollNumber: { type: String, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, enum: ['BLOCK', 'UNBLOCK'], required: true },
    metadata: { type: Object },
  },
  { timestamps: true }
);

const UserActionLog = mongoose.model('UserActionLog', userActionLogSchema);
export default UserActionLog;
