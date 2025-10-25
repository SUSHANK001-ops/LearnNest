import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import CreateInstitutionAdmin from './components/CreateInstitutionAdmin.jsx';
import ManageAdmins from './pages/ManageAdmins.jsx';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Decode token to check role (simple JWT decode, not validated here)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
      // Redirect to appropriate dashboard based on role
      if (payload.role === 'superadmin') {
        return <Navigate to="/superadmin/dashboard" replace />;
      } else if (payload.role === 'institution_admin') {
        return <Navigate to="/admin/dashboard" replace />;
      }
      return <Navigate to="/login" replace />;
    }
    
    return children;
  } catch (error) {
    console.error('Error decoding token:', error);
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      if (payload.role === 'superadmin') {
        return <Navigate to="/superadmin/dashboard" replace />;
      } else if (payload.role === 'institution_admin') {
        return <Navigate to="/admin/dashboard" replace />;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
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
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* SuperAdmin Routes */}
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/create-admin"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <CreateInstitutionAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/manage-admins"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <ManageAdmins />
            </ProtectedRoute>
          }
        />

        {/* Institution Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['institution_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;