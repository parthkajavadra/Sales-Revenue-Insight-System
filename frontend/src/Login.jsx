// src/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ from context

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
        username,
        password,
      });

      const { access, refresh } = response.data;
      console.log("✅ Login successful:", response.data);

      // Save tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Set default auth header for axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      login(); // ✅ update context
      navigate('/dashboard');
    } catch (err) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      setError('❌ Invalid username or password');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <h4 className="text-center mb-3">🔐 Login to Sales Insights</h4>
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group mb-3">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-control"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group mb-4">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
