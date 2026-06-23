import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import ChangePasswordModal from './components/ChangePasswordModal.jsx';
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import CreateInstitutionAdmin from './components/CreateInstitutionAdmin.jsx';
import ManageAdmins from './pages/ManageAdmins.jsx';

// Admin sub-pages
import BulkImportPage from './pages/admin/BulkImportPage.jsx';
import AnalyticsPage from './pages/admin/AnalyticsPage.jsx';
import NotificationsPage from './pages/admin/NotificationsPage.jsx';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';
import TeacherCoursePage from './pages/teacher/TeacherCoursePage.jsx';
import TeacherQuizBuilder from './pages/teacher/TeacherQuizBuilder.jsx';
import TeacherQuizResults from './pages/teacher/TeacherQuizResults.jsx';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import StudentCoursePage from './pages/student/StudentCoursePage.jsx';
import StudentQuizPage from './pages/student/StudentQuizPage.jsx';
import StudentResultsPage from './pages/student/StudentResultsPage.jsx';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
      const redirectMap = {
        superadmin: '/superadmin/dashboard',
        institution_admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        student: '/student/dashboard',
      };
      return <Navigate to={redirectMap[payload.role] || '/login'} replace />;
    }

    return children;
  } catch (error) {
    console.error('Error decoding token:', error);
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const redirectMap = {
        superadmin: '/superadmin/dashboard',
        institution_admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        student: '/student/dashboard',
      };
      if (redirectMap[payload.role]) {
        return <Navigate to={redirectMap[payload.role]} replace />;
      }
    } catch (error) {
      localStorage.removeItem('token');
    }
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* SuperAdmin Routes */}
        <Route path="/superadmin/dashboard" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute>} />
        <Route path="/superadmin/create-admin" element={<ProtectedRoute allowedRoles={['superadmin']}><CreateInstitutionAdmin /></ProtectedRoute>} />
        <Route path="/superadmin/manage-admins" element={<ProtectedRoute allowedRoles={['superadmin']}><ManageAdmins /></ProtectedRoute>} />

        {/* Institution Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['institution_admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['institution_admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['institution_admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={['institution_admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/bulk-import" element={<ProtectedRoute allowedRoles={['institution_admin']}><BulkImportPage /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['institution_admin']}><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['institution_admin']}><NotificationsPage /></ProtectedRoute>} />

        {/* Teacher Routes */}
        <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/courses" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/courses/:id" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherCoursePage /></ProtectedRoute>} />
        <Route path="/teacher/quizzes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherQuizBuilder /></ProtectedRoute>} />
        <Route path="/teacher/results" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherQuizBuilder /></ProtectedRoute>} />
        <Route path="/teacher/results/:quizId" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherQuizResults /></ProtectedRoute>} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/courses" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/courses/:id" element={<ProtectedRoute allowedRoles={['student']}><StudentCoursePage /></ProtectedRoute>} />
        <Route path="/student/quizzes" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/quizzes/:id" element={<ProtectedRoute allowedRoles={['student']}><StudentQuizPage /></ProtectedRoute>} />
        <Route path="/student/results" element={<ProtectedRoute allowedRoles={['student']}><StudentResultsPage /></ProtectedRoute>} />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;