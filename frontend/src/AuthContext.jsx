import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Add loading

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.get('http://127.0.0.1:8000/api/auth/me/', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          setUser(res.data);
          setLoading(false); // ✅ Done loading
        })
        .catch(() => {
          setUser(null);
          setLoading(false); // ✅ Done loading even on error
        });
    } else {
      setUser(null);
      setLoading(false); // ✅ No token = done loading
    }
  }, [isAuthenticated]);

  const login = () => setIsAuthenticated(true);
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
