import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },

    // optional email (kept for contact) - rollNumber is primary credential for students
    email: {
      type: String,
      require: false,
      unique: true,
      sparse: true,
    },

    // rollNumber will be used for student login (unique per student)
    // Not required for teachers; make sparse so documents without rollNumber are allowed
    rollNumber: {
      type: String,
      require: false,
      unique: true,
      sparse: true,
    },

    password: {
      type: String,
      require: true,
    },
    role: {
      type: String,
      require: true,
    },
    // number of recorded malpractice incidents
    malpracticeCount: {
      type: Number,
      default: 0,
    },
    // if true, student cannot log in and must be unblocked by a teacher
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  // this contain User Oject
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  // if this user obj is not modified mode next
  // else if user obj is create or modified like during update then hash password
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
