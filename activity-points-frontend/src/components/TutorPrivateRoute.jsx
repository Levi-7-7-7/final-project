import React from 'react';
import { Navigate } from 'react-router-dom';

export default function TutorPrivateRoute({ children }) {
  const token = localStorage.getItem('tutorToken');
  return token ? children : <Navigate to="/tutor/login" />;
}
