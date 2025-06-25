// src/RegisterPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('http://127.0.0.1:8000/api/auth/register/', formData);
      setSuccess('✅ Account created successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const firstError =
          Object.values(err.response.data)[0]?.[0] || 'Registration failed.';
        setError(`❌ ${firstError}`);
      } else {
        setError('❌ Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '450px' }}>
        <h4 className="text-center mb-3">📝 Register New Account</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group mb-3">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              className="form-control"
              required
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-control"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group mb-4">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-control"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-success w-100">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
