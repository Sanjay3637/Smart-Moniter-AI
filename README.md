# ProctoAI-MERN

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

  If you want, I can also:

  - add a `.env.example` file,
  - create a small `docs/API.md` listing all endpoints and request/response examples,
  - or open a PR with these README changes committed (already applied).

