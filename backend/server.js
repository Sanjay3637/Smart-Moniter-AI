import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import examRoutes from "./routes/examRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import submitExamRoutes from "./routes/submitExamRoutes.js";

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration (replaces JWT cookie auth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/users", examRoutes);
app.use("/api/users", assignmentRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/exams", submitExamRoutes);

// we we are deploying this in production
// make frontend build then
if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  // we making front build folder static to serve from this app
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  // if we get an routes that are not define by us we show then index html file
  // every enpoint that is not api/users go to this index file
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("<h1>server is running </h1>");
  });
}

// Custom Middlewares
app.use(notFound);
app.use(errorHandler);

// Server
app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});

// Todos:
// -**POST /api/users**- Register a users
// -**POST /api/users/auth**- Authenticate a user and get token
// -**POST /api/users/logout**- logou user and clear cookie
// -**GET /api/users/profile**- Get user Profile
// -**PUT /api/users/profile**- Update user Profile
