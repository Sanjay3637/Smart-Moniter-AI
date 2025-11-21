# Smart-Moniter

ProctoAI-MERN is an Automated Exam Proctoring System (AEPS) developed with cutting-edge AI-based algorithms for online exams. This comprehensive system is designed to ensure the integrity and security of online examinations. The project leverages technologies such as React.js, Redux, Node.js, and TensorFlow.js to offer a feature-rich exam proctoring solution.


## Table of Contents

- [Tech Stack](#tech-stack)

  - [Backend](#backend)
  - [Frontend](#frontend)

- [Current Functionality](#current-functionality)
  - [User Authentication and Role Management](#user-authentication-and-role-management)
  - [Teacher Capabilities](#teacher-capabilities)
  - [Student Functionality](#student-functionality)
  - [AI Exam Proctoring](#ai-exam-proctoring)
- [Future Scope](#future-scope)
  - [Candidate Verification](#candidate-verification)
  - [Voice Recognition](#voice-recognition)
  - [Secure Exam Environment](#secure-exam-environment)
  - [Unified Portal](#unified-portal)
- [Project Screenshots](#project-screenshots)
  - [Login Page](#login-page)
  # ProctoAI-MERN (Automated Exam Proctoring)

  An online exam proctoring system implemented with the MERN stack and client-side AI (TensorFlow.js). This README reflects the current codebase layout and how to run and extend it.

  ## Repository layout

  - `backend/` — Express server, routes, controllers, models, and utils.
  - `frontend/` — React application (Material-UI, Redux Toolkit) including proctoring UI and TensorFlow.js integrations.

  ## Quick summary of how the app works

  - Backend runs on Express and connects to MongoDB (`backend/config/db.js`).
  - JWT tokens are issued on login and stored in an httpOnly cookie (see `backend/controllers/userController.js` and `backend/utils/generateToken.js`).
  - Frontend uses React, Redux Toolkit, and TensorFlow.js models for client-side proctoring (object/face detection). Detected cheating events are sent to the backend to be logged.

  ## Important code-based facts (extracted from the current code)

  - Root `package.json` scripts:
    - `server`: starts backend via `nodemon backend/server.js`.
    - `client`: starts frontend with `npm start --prefix frontend`.
    - `dev`: runs server and client concurrently.
  - In `backend/server.js` the app mounts routes:
    - `app.use('/api/users', userRoutes)`
    - `app.use('/api/users', examRoutes)` (note: some exam routes are mounted under `/api/users` in this code)
    - `app.use('/api/results', resultRoutes)`
    - `app.use('/api/exams', submitExamRoutes)`
  - Key user endpoints (implemented in `backend/controllers/userController.js`): register, login/auth, logout, get profile, update profile. Login issues a cookie named `jwt`.
  - Key exam endpoints (examples in `backend/controllers/examController.js`): `GET /api/exams`, `POST /api/exams`, `DELETE /api/exams/:id`.
  - `Exam` model fields: `examName`, `totalQuestions`, `duration`, `liveDate`, `deadDate`, and `examId` (UUID).
  - Frontend `package.json` includes TensorFlow-related dependencies: `@tensorflow-models/coco-ssd`, `@tensorflow-models/face-detection`, `@tensorflow/tfjs`.

  ## Environment variables

  Create a `.env` for the backend with at least the following variables:

  ```env
  MONGO_URI=your_mongo_connection_string
  JWT_SECRET=your_jwt_secret
  PORT=5000
  FRONTEND_URL=http://localhost:3000
  NODE_ENV=development
  ```

  ## Run locally (development)

  1) Install dependencies

  ```powershell
  # from repo root
  npm install
  cd frontend
  npm install
  cd ../backend
  npm install
  ```

  2) Start backend and frontend (either separately or with root `dev`):

  ```powershell
  # from backend
  npm run server

  # from frontend
  npm start

  # or from repo root (runs both concurrently)
  npm run dev
  ```

  The frontend proxy (development) points to `http://localhost:5000/` so API calls are proxied to the Express server.

  ## Build for production

  1. Build the frontend:

  ```powershell
  cd frontend
  npm run build
  ```

  2. Ensure the build output (`frontend/dist` or `frontend/build` depending on your build setup) is available to the backend. The server tries to serve static files when `NODE_ENV === 'production'`.

  3. Start the backend in production mode (with `NODE_ENV=production`) and it will serve the frontend static files.

  ## API snapshot

  - Authentication and user management (`backend/controllers/userController.js`):
    - `POST /api/users` — register
    - `POST /api/users/auth` — login (sets JWT cookie)
    - `POST /api/users/logout` — logout (clears cookie)
    - `GET /api/users/profile` — protected
    - `PUT /api/users/profile` — protected

  - Exams (`backend/controllers/examController.js`):
    - `GET /api/exams` — public list
    - `POST /api/exams` — create (teacher role expected)
    - `DELETE /api/exams/:id` — delete (teacher role expected)

  For full details, inspect `backend/routes` and `backend/controllers`.

  ## Notes & gotchas observed in code

  - Some exam-related routes are mounted under `/api/users` in `server.js` — double-check route prefixes if you expect them under `/api/exams`.
  - CORS is configured with `origin: process.env.FRONTEND_URL` and `credentials: true` — ensure the frontend sends requests with credentials included when required.

  ## Recommendations / next tasks

  - Add `.env.example` to the repo to document required environment variables.
  - Add a short Dockerfile and `docker-compose.yml` to make local development reproducible.
  - Add minimal API tests (e.g., using Jest + Supertest) for auth and exam CRUD.

  ---

  # Detailed Project Overview

  ## What this project does

  ProctoAI-MERN is an online examination platform with built-in client-side AI proctoring. It enables teachers to create and assign exams and students to take them within configured live windows while the app detects and logs potential cheating behaviors (face out-of-frame, multiple faces, device usage cues via vision models, etc.).

  ## Core features

  - **Authentication & Roles**
    - Secure login with JWT httpOnly cookies.
    - Two roles: `student`, `teacher`.

  - **Teacher capabilities**
    - Create exams with name, duration, total questions, live/dead dates, and optional category.
    - Add questions to exams with answer options and correct answer marking.
    - Assign exams to students; manage assignments and due dates.
    - View cheating logs by exam to review flagged events.
    - Manage categories for organizing exams.

  - **Student experience**

    - Dashboard listing available exams and categories.
    - “My Tasks” view that fetches teacher assignments and lets students start an assigned exam.
    - Exam taking UI with timer; on submit, answers are graded and results stored.
    - “My Results” view to review past attempts and outcomes.

  - **AI Proctoring (client-side)**
    - Uses TensorFlow.js models (face/object) to detect suspicious behaviors.
    - Events are POSTed to the backend and stored as cheating logs by exam.

  ## Architecture at a glance

  - **Frontend**: React + Redux Toolkit + MUI. TensorFlow.js in the browser for proctoring.
  - **Backend**: Node.js + Express + MongoDB (Mongoose models).
  - **Auth**: JWTs issued on login; stored in httpOnly cookies; protected routes via middleware.
  - **CORS**: Controlled via `FRONTEND_URL`; credentials enabled.

  ## Data models (key fields)

  - **User**: role, name, email, password hash, status flags.
  - **Exam**: `examName`, `totalQuestions`, `duration`, `liveDate`, `deadDate`, `examId` (UUID), `category`.
  - **Question**: text, options[{ text, isCorrect }], `examId` link to exam.
  - **Assignment**: maps exams to students with due dates and status.
  - **Result**: one per student+exam; stores per-question answers, score, percentage, status, timeTaken.
  - **CheatingLog**: records timestamped proctoring events per exam/user.

  ## Important backend endpoints (snapshot)

  - Auth: `POST /api/users`, `POST /api/users/auth`, `POST /api/users/logout`, `GET/PUT /api/users/profile`.
  - Exams: mounted under `/api/users` in this codebase; controller exposes `GET /api/exams`, `POST /api/exams`, `DELETE /api/exams/:id`.
  - Questions: `POST /api/users/exam/questions`, `GET /api/users/exam/questions/:examId`.
  - Categories: `GET/POST /api/users/categories`, `DELETE /api/users/categories/:id`.
  - Assignments: `GET/POST /api/users/assignments` (teacher), `GET /api/users/assignments/my-tasks` (student), `PUT/DELETE /api/users/assignments/:id`.
  - Results: `GET /api/results/...` (see route file for details).
  - Exam submission: `POST /api/exams/submit`.

  See `backend/routes` and `backend/controllers` for full details.

  ## Frontend routes (selected)

  - Student: `/dashboard`, `/exam`, `/exam/category/:categoryId`, `/exam/:examId`, `/exam/:examId/:testId`, `/my-tasks`, `/my-results`, `/profile`.
  - Teacher: `/create-exam`, `/add-questions`, `/manage-exams`, `/assign-exam`, `/exam-log`, `/teacher-profile`, `/block-student`, `/unblock-student`.
  - Auth: `/auth/login`, `/auth/register`, `/auth/login-student`, `/auth/login-teacher`.

  Note: From the profile avatar menu, “My Tasks” links to `/my-tasks`.

  ## Key user flows

  - **Teacher creates exam** → adds questions → assigns to students → monitors cheating logs.
  - **Student checks My Tasks** → starts assigned exam within live window → client-side proctoring runs → submits → result is computed and stored.

  ## Security & constraints

  - Protected routes enforced by `protect`, `teacherOnly`, `studentOnly` middleware.
  - CORS with credentials; frontend must send cookies when calling protected APIs.
  - Compound index on Result ensures one result per student+exam.

  ## Development tips

  - Verify route prefixes: some exam routes are mounted under `/api/users` (by design in this repo).
  - Keep `FRONTEND_URL` in `.env` consistent with the actual frontend origin during development.
  - For TensorFlow.js models, ensure the browser has sufficient permissions (camera) and performance.

  ## Roadmap ideas

  - Add richer proctoring signals and thresholds.
  - Add exportable reports for results and proctoring logs.
  - Add e2e tests (Cypress/Playwright) and API tests (Jest + Supertest).
  - Containerize with Docker and provide `docker-compose.yml` for easy local setup.
