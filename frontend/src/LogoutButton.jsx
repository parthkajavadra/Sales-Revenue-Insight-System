// src/components/LogoutButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className="btn btn-outline-danger">
      🚪 Logout
    </button>
  );
}

export default LogoutButton;
