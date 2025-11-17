import React, { lazy } from 'react';
import { Navigate, Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import { useSelector } from 'react-redux';

/* ***Layouts**** */
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const ExamLayout = Loadable(lazy(() => import('../layouts/full/ExamLayout')));

/* ****Pages***** */
// const Dashboard = Loadable(lazy(() => import('../views/dashboard/Dashboard')));
const SamplePage = Loadable(lazy(() => import('../views/sample-page/SamplePage')));
const Success = Loadable(lazy(() => import('../views/Success')));
// const Icons = Loadable(lazy(() => import('../views/icons/Icons')));
// const TypographyPage = Loadable(lazy(() => import('../views/utilities/TypographyPage')));
// const Shadow = Loadable(lazy(() => import('../views/utilities/Shadow')));
//Student Routes

const TestPage = Loadable(lazy(() => import('./../views/student/TestPage')));
const ExamPage = Loadable(lazy(() => import('./../views/student/ExamPage')));
const ExamDetails = Loadable(lazy(() => import('./../views/student/ExamDetails')));
const MyTasksPage = Loadable(lazy(() => import('./../views/student/MyTasksPage')));
const StudentProfile = Loadable(lazy(() => import('./../views/student/ProfilePage')));
const MyResultsPage = Loadable(lazy(() => import('./../views/student/MyResultsPage')));
const ProfilePage = Loadable(lazy(() => import('./../views/ProfilePage')));
//Auth Routes
const Error = Loadable(lazy(() => import('../views/authentication/Error')));
const Register = Loadable(lazy(() => import('../views/authentication/Register')));
const Login = Loadable(lazy(() => import('../views/authentication/Login')));
const UserAccount = Loadable(lazy(() => import('../views/authentication/UserAccount')));

// Teacher Routes
const CreateExamPage = Loadable(lazy(() => import('./../views/teacher/CreateExamPage')));
const ExamLogPage = Loadable(lazy(() => import('./../views/teacher/ExamLogPage')));
const AddQuestions = Loadable(lazy(() => import('./../views/teacher/AddQuestions')));
const ManageExamsPage = Loadable(lazy(() => import('./../views/teacher/ManageExamsPage')));
const AssignExamPage = Loadable(lazy(() => import('./../views/teacher/AssignExamPage')));
const TeacherProfile = Loadable(lazy(() => import('./../views/teacher/ProfilePage')));
const PrivateRoute = Loadable(lazy(() => import('src/views/authentication/PrivateRoute')));
const TeacherRoute = Loadable(lazy(() => import('src/views/authentication/TeacherRoute')));

const Router = createBrowserRouter(
  createRoutesFromElements(
    // Every router we create will now go in here as
    // they going to be child of our main App component
    <>
      {/* // Private Routes */}
      <Route path="" element={<PrivateRoute />}>
        {/* // Main layout */}
        <Route path="/" element={<FullLayout />}>
          <Route index={true} path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" exact={true} element={<ExamPage />} />
          <Route path="/sample-page" exact={true} element={<SamplePage />} />
          <Route path="/Success" exact={true} element={<Success />} />
          <Route path="/exam" exact={true} element={<ExamPage />} />
          <Route path="/my-tasks" exact={true} element={<MyTasksPage />} />
          <Route path="/my-results" exact={true} element={<MyResultsPage />} />
          <Route path="/profile" exact={true} element={<StudentProfile />} />
          <Route path="" element={<TeacherRoute />}>
            <Route path="/create-exam" exact={true} element={<CreateExamPage />} />
            <Route path="/add-questions" exact={true} element={<AddQuestions />} />
            <Route path="/manage-exams" exact={true} element={<ManageExamsPage />} />
            <Route path="/assign-exam" exact={true} element={<AssignExamPage />} />
            <Route path="/exam-log" exact={true} element={<ExamLogPage />} />
            <Route path="/teacher-profile" exact={true} element={<TeacherProfile />} />
          </Route>
        </Route>
        <Route path="/" element={<ExamLayout />}>
          <Route path="exam/:examId" exact={true} element={<ExamDetails />} />
          <Route path="exam/:examId/:testId" exact={true} element={<TestPage />} />
        </Route>
        {/* User layout */}
        <Route path="/user" element={<FullLayout />}>
          <Route path="account" exact={true} element={<UserAccount />} />
          <Route path="profile" exact={true} element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Authentication layout */}
      <Route path="/auth" element={<BlankLayout />}>
        <Route path="404" element={<Error />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/login" element={<Login />} />
        {/* <Route path="*" element={<Navigate to="/auth/404" />} /> */}
      </Route>
    </>,
  ),
);

export default Router;
