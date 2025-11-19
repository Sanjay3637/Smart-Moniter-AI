import asyncHandler from "express-async-handler";
import User from "./../models/userModel.js";
import generateToken from "../utils/generateToken.js";

const authUser = asyncHandler(async (req, res) => {
  // Authenticate using rollNumber OR email + password.
  const { rollNumber, email, password } = req.body;

  let user = null;
  if (rollNumber) {
    user = await User.findOne({ rollNumber });
  }
  // fallback to email if rollNumber wasn't provided or not found
  if (!user && email) {
    user = await User.findOne({ email });
  }

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber,
      role: user.role,
      password_encrypted: user.password,
      message: "User successfully logged in with role: " + user.role,
    });
  } else {
    res.status(401);
    throw new Error("Invalid credentials (roll number/email or password)");
  }
});

const registerUser = asyncHandler(async (req, res) => {
  // Students: require rollNumber, email optional
  // Teachers: require email, rollNumber optional
  const { name, email, password, role, rollNumber } = req.body;

  if (role === 'student') {
    if (!rollNumber) {
      res.status(400);
      throw new Error('rollNumber is required for student registration');
    }
    const userExistByRoll = await User.findOne({ rollNumber });
    if (userExistByRoll) {
      res.status(400);
      throw new Error('User with this roll number already exists');
    }
  }

  if (email) {
    const userExistByEmail = await User.findOne({ email });
    if (userExistByEmail) {
      res.status(400);
      throw new Error('User with this email already exists');
    }
  } else if (role === 'teacher') {
    // teacher must provide an email
    res.status(400);
    throw new Error('Email is required for teacher registration');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    rollNumber,
  });

  if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber,
      role: user.role,
      password_encrypted: user.password,
      message: 'User successfully created with role: ' + user.role,
    });
  } else {
    res.status(400);
    throw new Error('Invalid User Data');
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: " User logout User" });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    rollNumber: req.user.rollNumber,
    role: req.user.role,
    createdAt: req.user.createdAt,
  };
  res.status(200).json(user);
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    // allow updating rollNumber but ensure uniqueness
    if (req.body.rollNumber && req.body.rollNumber !== user.rollNumber) {
      const exists = await User.findOne({ rollNumber: req.body.rollNumber });
      if (exists) {
        res.status(400);
        throw new Error("rollNumber already in use");
      }
      user.rollNumber = req.body.rollNumber;
    }
    user.role = req.body.role || user.role;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
    });
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});
export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
};
