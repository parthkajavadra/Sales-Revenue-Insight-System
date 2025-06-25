// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import UploadPage from './UploadPage';
import Dashboard from './Dashboard';
import LoginPage from './Login';
import RegisterPage from './Register';
import UploadHistoryPage from './UploadHistoryPage';
import AdminDashboard from './AdminDashboard';
import AdminUploadHistory from './AdminUploadHistory';
import { AuthProvider, useAuth } from './AuthContext';

// 🔒 Require user to be authenticated
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" replace />;
};

// 🔐 Require user to be admin (is_staff)
const RequireAdmin = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-5">⏳ Checking admin access...</div>;
  return user?.is_staff ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="container mt-4 mb-5 flex-grow-1">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<RequireAuth><UploadPage /></RequireAuth>} />
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/upload-history" element={<RequireAuth><UploadHistoryPage /></RequireAuth>} />
              <Route path="/admin-dashboard" element={<RequireAuth><RequireAdmin><AdminDashboard /></RequireAdmin></RequireAuth>} />
              <Route path="/admin-upload-history" element={<RequireAuth><RequireAdmin><AdminUploadHistory /></RequireAdmin></RequireAuth>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
