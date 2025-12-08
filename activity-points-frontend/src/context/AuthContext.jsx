import React, { createContext, useState, useEffect } from 'react';
import axios from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // stores student or tutor info
  const [role, setRole] = useState(null); // 'student' or 'tutor'
  const [loading, setLoading] = useState(true); // loading while checking login

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedRole = localStorage.getItem('role');
        const token = localStorage.getItem(storedRole === 'student' ? 'token' : 'tutorToken');

        if (token && storedRole) {
          setRole(storedRole);

          // fetch user info for student
          if (storedRole === 'student') {
            const res = await axios.get('/students/me', {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUser(res.data);
          }

          // fetch user info for tutor
          else if (storedRole === 'tutor') {
            const res = await axios.get('/tutors/me', {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUser(res.data);
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
        localStorage.clear(); // remove invalid tokens
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tutorToken');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('tutorName');
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, role, setRole, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
