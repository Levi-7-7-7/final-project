// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { Eye, EyeOff, GraduationCap, User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance'; // axios instance with baseURL
import '../css/Login.css';
import { AuthContext } from '../context/AuthContext.jsx'; // ✅ added

export default function Login() {
  const [role, setRole] = useState('student'); // student or tutor
  const [identifier, setIdentifier] = useState(''); // registerNumber for student, email for tutor
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false); // only for students
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const { setUser, setRole: setAuthRole } = useContext(AuthContext); // ✅ added

  // Request OTP for first-time students
  const handleRequestOTP = async () => {
    setError('');
    setSuccess('');
    if (!identifier.trim()) {
      setError('Register number is required');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/auth/start-login', { registerNumber: identifier });
      setSuccess(res.data.message || 'OTP sent');
      setTimeout(() => {
        navigate(`/verify-otp?registerNumber=${encodeURIComponent(identifier)}`);
      }, 1000);
    } catch (err) {
      console.error('OTP request error:', err.response ?? err);
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Login for both students and tutors
  const handleLogin = async () => {
    setError('');
    setSuccess('');
    if (!identifier.trim() || !password) {
      setError(
        role === 'student'
          ? 'Both register number and password are required'
          : 'Both email and password are required'
      );
      return;
    }
    setLoading(true);

    try {
      let res;
      if (role === 'student') {
        // Student login
        res = await axios.post('/auth/login', { registerNumber: identifier, password });
        if (!res?.data?.token) throw new Error('No token returned from student login');

        // ✅ Store student info for persistent login
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', 'student'); // important for PrivateRoute
        localStorage.setItem('userName', res.data.student?.name || 'Student');

        // ✅ update AuthContext
        setUser(res.data.student);
        setAuthRole('student');

        setSuccess(res.data.message || 'Student login successful');
        navigate('/dashboard');
      } else {
        // Tutor login
        res = await axios.post('/tutors/login', { email: identifier, password });
        if (!res?.data?.token) throw new Error('No token returned from tutor login');

        // ✅ Store tutor info for persistent login
        localStorage.setItem('tutorToken', res.data.token);
        localStorage.setItem('role', 'tutor'); // important for TutorPrivateRoute
        localStorage.setItem('tutorName', res.data.tutor?.name || 'Tutor');

        // ✅ update AuthContext
        setUser(res.data.tutor);
        setAuthRole('tutor');

        setSuccess(res.data.message || 'Tutor login successful');
        navigate('/tutor/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err.response ?? err);
      setError(err.response?.data?.error || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <GraduationCap size={48} color="#1e3a8a" />
          <h1>Activity Points</h1>
          <p>Management System</p>
        </div>

        {/* Role selector */}
        <div className="role-selector" style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
          <label style={{ cursor: 'pointer' }}>
            <input
              type="radio"
              name="role"
              value="student"
              checked={role === 'student'}
              onChange={() => setRole('student')}
            />
            <span style={{ marginLeft: 6 }}>Student</span>
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input
              type="radio"
              name="role"
              value="tutor"
              checked={role === 'tutor'}
              onChange={() => setRole('tutor')}
            />
            <span style={{ marginLeft: 6 }}>Tutor</span>
          </label>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="form-group">
          <label className="form-label" htmlFor="identifier">
            <User size={16} /> {role === 'student' ? 'Register Number' : 'Email'}
          </label>
          <input
            id="identifier"
            type="text"
            placeholder={role === 'student' ? 'Enter your register number' : 'Enter your email'}
            className="form-input"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={loading}
          />
        </div>

        {!isFirstTimeUser && (
          <div className="form-group password-wrapper">
            <label className="form-label" htmlFor="password">
              <Lock size={16} /> Password
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || (role === 'student' && isFirstTimeUser)}
            />
            <button
              type="button"
              className="show-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        )}

        <div className="form-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {role === 'student' && (
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isFirstTimeUser}
                onChange={(e) => setIsFirstTimeUser(e.target.checked)}
                disabled={loading}
              />
              <span style={{ marginLeft: 6 }}>First-time user</span>
            </label>
          )}

          <button
            type="button"
            className="forgot-password"
            onClick={() => navigate('/forgot-password')}
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>

        {!isFirstTimeUser || role === 'tutor' ? (
          <button
            className="btn-primary"
            onClick={handleLogin}
            disabled={!identifier || !password || loading}
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        ) : (
          <button
            className="btn-outline"
            onClick={handleRequestOTP}
            disabled={!identifier || loading}
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Sending OTP...' : 'Request OTP'}
          </button>
        )}
      </div>

      <div className="footer-text">
        Need help? Contact your institution's IT support
      </div>
    </div>
  );
}
