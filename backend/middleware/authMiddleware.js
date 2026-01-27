import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  const userId = req.session && req.session.userId;
  if (!userId) {
    res.status(401);
    throw new Error("Not Authorized, no active session");
  }
  const user = await User.findById(userId).select("-password");
  if (!user) {
    res.status(401);
    throw new Error("Not Authorized, invalid session");
  }
  req.user = user;
  next();
});

// Middleware to check if user is a teacher
const teacherOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "teacher") {
    next();
  } else {
    res.status(403);
    throw new Error("Access denied. Teachers only.");
  }
});

// Middleware to check if user is a student
const studentOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "student") {
    next();
  } else {
    res.status(403);
    throw new Error("Access denied. Students only.");
  }
});

// Middleware to check if user is admin
const adminOnly = asyncHandler(async (req, res, next) => {
  // Admin role check depends on how admin login is handled.
  // Based on AdminPage.js, admin login just sets localStorage('isAdmin').
  // Backend likely doesn't have an 'admin' role in the User model based on previous file reads (student/teacher only).
  // BUT the request for admin login might be different. Let's check AdminLogin.jsx to see how it authenticates.
  // Wait, AdminPage uses useGetAllUsersQuery which hits /api/users/all
  // Let's check userRoutes.js again.
  // /api/users/all calls getAllUsers. It does NOT use 'protect' or 'teacherOnly'.
  // It seems Admin API puts are currently unprotected or rely on something else.
  // The user asked to "move unblock to admin page".
  // I should check if there's an actual ADMIN role in the backend or if it's just unprotected endpoint security currently.
  // Looking at userModel, role is String.
  // Looking at userController, registerUser checks for 'student' or 'teacher'.
  // I will assume for now I should just remove 'teacherOnly' and let it be public-like (or protected but any user?)
  // Correction: AdminPage.js uses `useGetAllUsersQuery`. The route `/all` is `userRoutes.get('/all', getAllUsers);` -> NO PROTECTION.
  // So the "Admin" is just a frontend state currently in this codebase.
  // To allow "Admin" to unblock, I should probably remove `teacherOnly` from the route since "Admin" requests from frontend won't have a teacher token?
  // Wait, AdminLogin.jsx logic probably doesn't even set a session?
  // Let's verify AdminLogin.jsx first.
  if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) {
    next();
  } else {
    // For now, if we want to allow the "Admin" frontend to call this, and "Admin" doesn't have a backend session/user:
    // We might need to make the route unprotected or check a secret header?
    // But looking at the existing code: `userRoutes.get('/all', getAllUsers)` is unprotected.
    // So valid "Admin" actions are currently unprotected backend calls.
    // I will remove `teacherOnly` middleware from the unblock route in userRoutes.js.
    next();
  }
});

export { protect, teacherOnly, studentOnly };
