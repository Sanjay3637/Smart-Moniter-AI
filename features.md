# Smart-Moniter-AI: Project Features

Smart-Moniter-AI is a comprehensive Automated Exam Proctoring System (AEPS) designed to ensure the integrity of online examinations using advanced client-side AI.

## 🚀 Core Functionality

### 🔐 Authentication & Security
- **Secure Login System**: Role-based authentication (Student/Teacher) protected by JWT (JSON Web Tokens).
- **HttpOnly Cookies**: Secure storage of auth tokens to prevent XSS attacks.
- **Route Protection**: Middleware ensures only authorized roles access specific pages (e.g., Teachers cannot take exams, Students cannot create them).

### 👥 User Roles
1.  **Teacher**: Administrator of exams, students, and results.
2.  **Student**: The examinee who takes tests and views performance.

---

## 👨‍🏫 Teacher Features

### 1. Exam Management
- **Create Exams**: Comprehensive exam setup including:
    - **Exam Name & Category**: Organize exams by subject or topic.
    - **Scheduling**: Set "Live Date" (Start) and "Dead Date" (End) for exam availability.
    - **Duration**: Flexible time limits for exams.
    - **Total Questions**: Define the scope of the test.
- **Question Bank**:
    - Add questions one-by-one.
    - Support for multiple-choice questions (MCQs) with correct answer tagging.
- **Manage Exams**: Dashboard to list, edit, or delete existing exams.

### 2. Student Administration
- **Assign Exams**: Directly assign specific exams to students or groups.
- **Block/Unblock Users**: Control access for specific students (e.g., for disciplinary reasons).

### 3. Monitoring & Results
- **Proctoring Logs**: View detailed cheating logs for each student per exam attempt.
    - See counts of specific incidents (e.g., "5 times No Face Detected").
- **Exam Logs**: Track who took the exam and their status.

---

## 👨‍🎓 Student Features

### 1. Dashboard
- **Exam Listing**: View available exams categorized by subject.
- **My Tasks**: Dedicated section for exams specifically assigned by teachers.
- **Upcoming Exams**: Clear visibility on exam schedules.

### 2. Exam Interface (The Core Experience)
- **Fullscreen Mode**: Enforced fullscreen to minimize distractions.
- **Live Timer**: Countdown timer synchronized with exam duration.
- **Question Navigation**: Easy switching between questions.
- **Real-time Alerts**: Immediate feedback/warnings if malpractice is detected.

### 3. Integrated Code Editor (IDE)
For programming questions, the platform features a professional-grade embedded IDE:
- **Powered by Monaco Editor**: The same editor engine used in VS Code.
- **Multi-Language Support**:
    - 🐍 **Python** (`def solution(): ...`)
    - ⚡ **JavaScript** (`function solution() { ... }`)
    - ☕ **Java** (`public class Solution { ... }`)
- **Smart Features**:
    - **Syntax Highlighting**: Industry-standard coloring.
    - **Auto-Completion & IntelliSense**: Code suggestions as you type.
    - **Auto-Closing**: Brackets and quotes close automatically.
    - **Theme Support**: Switch between **Dark**, **Light**, and **High Contrast** modes.
- **Test Case Execution**:
    - **Run Code**: Execute solution against pre-defined test cases.
    - **Feedback**: Immediate pass/fail status for each test case.
    - **Hidden Test Cases**: Support for hidden tests to ensure robust solutions.

### 4. Results & Analysis
- **My Results**: Detailed history of past exams.
- **Performance breakdown**: Score, percentage, and pass/fail status.
- **Review Answers**: See correct vs. incorrect answers (if enabled).

---

## 👁️ AI Proctoring System

The project utilizes **TensorFlow.js** running entirely on the client side for privacy-preserving, real-time monitoring.

### Detection Capabilities
1.  **🚫 No Face Detected**: Alerts if the student leaves the camera frame or obscures their face.
2.  **👥 Multiple Faces**: Detects if more than one person is visible in the frame (impersonation/collusion).
3.  **📱 Mobile Phone Detection**: Identifies mobile phones in the frame to prevent unauthorized resource usage.
4.  **📕 Prohibited Objects**: Detects books or other unauthorized materials.
5.  **⚠️ Suspicious Posture (Leaning)**: Analyzes person size/position changes to detect leaning back or moving away from the screen.

### Incident Logging
- **Real-time Tracking**: Incidents are counted in real-time.
- **Session Reports**: Aggregate counts of each cheat type are sent to the backend upon exam submission.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Redux Toolkit, Material-UI (MUI), Monaco Editor.
- **AI/ML**: TensorFlow.js, COCO-SSD (Object Detection), MediaPipe (Face Detection).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Tools**: Recharts/ApexCharts (Analytics), JSPDF (Report Generation).
