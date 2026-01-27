import React, { useEffect, useState, useMemo } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { Award, Star, Bell, Loader2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import '../css/StudentDashboard.css';

export default function Dashboard() {
  // Initialize user from localStorage for instant name display
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('userData');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [certificates, setCertificates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/');

      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch everything in parallel
        const [userRes, certRes, catRes] = await Promise.all([
          axios.get('/students/me', { headers }),
          axios.get('/certificates/my', { headers }), // Consider adding ?limit=5 here
          axios.get('/categories', { headers })
        ]);

        setUser(userRes.data);
        setCertificates(certRes.data.certificates || []);
        setCategories(catRes.data.categories || []);
        
        // Cache user data for next time
        localStorage.setItem('userData', JSON.stringify(userRes.data));
        localStorage.setItem('userName', userRes.data.name);
      } catch (err) {
        console.error('Fetch error:', err);
        if (err.response?.status === 401) navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const cappedTotal = useMemo(() => {
    if (!certificates.length || !categories.length) return 0;
    const approvedCerts = certificates.filter(c => c.status?.toLowerCase() === 'approved');
    const grouped = approvedCerts.reduce((acc, cert) => {
      const catId = cert.category?._id || cert.category;
      if (!acc[catId]) acc[catId] = [];
      acc[catId].push(cert);
      return acc;
    }, {});

    let grandTotal = 0;
    Object.keys(grouped).forEach(catId => {
      const catData = categories.find(c => c._id === catId);
      if (!catData) return;
      const certsInCat = grouped[catId];
      let catSum = 0;
      const catName = catData.name.toLowerCase();
      if (catName.includes('arts') || catName.includes('sports')) {
        catSum = Math.max(...certsInCat.map(c => c.pointsAwarded || 0), 0);
      } else {
        catSum = certsInCat.reduce((sum, c) => sum + (c.pointsAwarded || 0), 0);
      }
      grandTotal += Math.min(catSum, catData.maxPoints || 40);
    });
    return grandTotal;
  }, [certificates, categories]);

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <div className="header-top">
          <div className="avatar-group">
            <div className="avatar">
              <span className="avatar-fallback">{user?.name?.charAt(0) || '?'}</span>
            </div>
            <div className="greeting">
              <h1>Hello, {user?.name || 'Student'}</h1>
              <p>Welcome back!</p>
            </div>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} className="logout-btn-header">Logout</button>
        </div>

        <div className="points-card">
          <div className="points-info">
            <p>Capped Activity Points</p>
            {loading ? <div className="skeleton skeleton-text" /> : <h2>{cappedTotal}</h2>}
          </div>
          <div className="award-icon">
            <Award size={32} color="#ca8a04" />
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <section>
          <h3>Recent Activities</h3>
          <div className="activities-card">
            {loading ? (
              // Display 3 skeleton rows while loading
              [1, 2, 3].map(n => (
                <div key={n} className="activity-row skeleton-row">
                  <div className="skeleton skeleton-circle" />
                  <div className="skeleton skeleton-line" />
                </div>
              ))
            ) : certificates.length === 0 ? (
              <p className="no-data">No activities found.</p>
            ) : (
              certificates.slice(0, 5).map((cert) => (
                <div key={cert._id} className="activity-row">
                  <div className="activity-left">
                    <Star size={20} color="#2563eb" />
                    <div className="activity-details">
                      <h4>{cert.title || cert.subcategory}</h4>
                      <p>{new Date(cert.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="activity-right">
                    <p className="activity-points">+{cert.pointsAwarded || 0} pts</p>
                    <span className={`status-badge status-${cert.status?.toLowerCase()}`}>{cert.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
      <BottomNav activeTab="profile" />
    </div>
  );
}