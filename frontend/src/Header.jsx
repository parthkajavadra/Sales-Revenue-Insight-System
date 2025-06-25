import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-light border-bottom shadow-sm sticky-top">
      <div className="container d-flex justify-content-between align-items-center py-3">
        <h5 className="text-primary fw-bold mb-0">📈 Sales Insight</h5>

        <nav className="d-flex gap-3 align-items-center">
          {isAuthenticated ? (
            <>
              <Link to="/" className={`nav-link ${isActive('/') ? 'text-primary fw-semibold' : 'text-dark'}`}>Upload</Link>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'text-primary fw-semibold' : 'text-dark'}`}>Dashboard</Link>
              <Link to="/upload-history" className={`nav-link ${isActive('/upload-history') ? 'text-primary fw-semibold' : 'text-dark'}`}>History</Link>
              
              {user?.is_staff && (
                <>
                  <Link to="/admin-dashboard" className={`nav-link ${isActive('/admin-dashboard') ? 'text-primary fw-semibold' : 'text-dark'}`}>Admin</Link>
                  <Link to="/admin-upload-history" className={`nav-link ${isActive('/admin-upload-history') ? 'text-primary fw-semibold' : 'text-dark'}`}>Upload Logs</Link>
                </>
              )}

              <button onClick={handleLogout} className="btn btn-outline-primary btn-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login') ? 'text-primary fw-semibold' : 'text-dark'}`}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
