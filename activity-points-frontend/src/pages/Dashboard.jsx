// src/pages/Dashboard.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosInstance'; // axios instance with baseURL and headers
import { useNavigate } from 'react-router-dom';
import { Award, Star, Bell } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import '../css/StudentDashboard.css';
import { AuthContext } from '../context/AuthContext.jsx'; // ✅ added

export default function Dashboard() {
  const { user, role, setUser, setRole: setAuthRole } = useContext(AuthContext); // ✅ use context
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    setUser(null); // ✅ clear context
    setAuthRole(null); // ✅ clear context
    navigate('/');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedRole = localStorage.getItem('role');

        if (!token || savedRole !== 'student') {
          navigate('/'); // redirect if no token or wrong role
          return;
        }

        // If we already have user in context, no need to fetch
        if (user) {
          setLoading(false);
          return;
        }

        const res = await axios.get('/students/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data); // ✅ update context
        localStorage.setItem('userName', res.data.name);
      } catch (error) {
        console.error('Error fetching student profile:', error);
        navigate('/'); // redirect to login on error
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, user, setUser]);

  if (loading)
    return (
      <div className="student-dashboard p-4 text-center">
        Loading...
      </div>
    );

  if (!user)
    return (
      <div className="student-dashboard p-4 text-center">
        No student data found.
      </div>
    );

  return (
    <div className="student-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-top">
          <div className="avatar-group">
            <div className="avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={`${user.name} avatar`} />
              ) : (
                <span className="avatar-fallback">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </span>
              )}
            </div>
            <div className="greeting">
              <h1>Hello, {user.name}</h1>
              <p>Welcome back!</p>
            </div>
          </div>

          <div className="header-actions">
            <button
              className="notification-btn"
              title="Notifications"
              onClick={() => alert('No notifications yet')}
            >
              <Bell size={20} color="#64748b" />
            </button>
            <button
              onClick={handleLogout}
              className="logout-btn-header"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="points-card">
          <div className="points-info">
            <p>Total Activity Points</p>
            <h2>{user.totalPoints?.toLocaleString() || 0}</h2>          
          </div>
          <div className="award-icon">
            <Award size={32} color="#ca8a04" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <section>
          <div className="recent-activities-header">
            <h3>Recent Activities</h3>
            <button onClick={() => navigate('/activities')}>
              View All
            </button>
          </div>

          <div className="activities-card">
            {(user.recentActivities || []).length === 0 && (
              <p className="no-activities">No recent activities</p>
            )}

            {(user.recentActivities || []).map((activity, i) => (
              <div
                key={i}
                className="activity-row"
                style={{
                  borderBottom:
                    i < user.recentActivities.length - 1
                      ? '1px solid #e2e8f0'
                      : 'none',
                }}
              >
                <div className="activity-left">
                  <div className="activity-icon-wrapper star-icon">
                    <Star size={20} color="#2563eb" />
                  </div>
                  <div className="activity-details">
                    <h4>{activity.title}</h4>
                    <p>{activity.date}</p>
                  </div>
                </div>
                <div className="activity-right">
                  <p className="activity-points">+{activity.points} pts</p>
                  <span
                    className={`status-badge ${
                      activity.status === 'Approved'
                        ? 'status-approved'
                        : 'status-pending'
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab="profile" />
    </div>
  );
}
