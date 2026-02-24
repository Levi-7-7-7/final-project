import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Award,
  Eye,
  Download,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import '../css/certificatespage.css';
import { useNavigate } from 'react-router-dom';
// import BottomNav from '../components/BottomNav';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function ViewCertificatesScreen() {
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view certificates');
          setCertificates([]);
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/certificates/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCertificates(res.data.certificates || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await axios.get(`${API_BASE_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCategories(res.data.categories || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };

    fetchCategories();
  }, []);

  // ===============================
  // HELPERS
  // ===============================
// Updated helper to handle empty category state
const getCategoryById = (id) => {
  if (!id || !categories || categories.length === 0) return null;
  const searchId = id._id ? id._id : id;
  return categories.find(c => c._id === searchId) || null;
};

const getCategoryNameById = (id) => {
  const cat = getCategoryById(id);
  return cat ? cat.name : "Loading Category..."; // Prevents crash if category not found yet
};

const getCategoryColorClassById = (id) => {
  const cat = getCategoryById(id);
  return cat ? cat.colorClass : "category-default";
};

  const getStatusColorClass = (status) => {
    if (!status) return 'status-default';
    switch (status.toLowerCase()) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return 'status-default';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return null;
    switch (status.toLowerCase()) {
      case 'approved': return <CheckCircle className="icon status-approved-icon" />;
      case 'pending': return <Clock className="icon status-pending-icon" />;
      case 'rejected': return <XCircle className="icon status-rejected-icon" />;
      default: return null;
    }
  };

  const filteredCertificates =
    activeFilter === 'all'
      ? certificates
      : certificates.filter(c => (c.status || '').toLowerCase() === activeFilter);

  // ===============================
  // POINT CALCULATION
  // ===============================
  const calculatePoints = (cert) => {
    if (!cert || !cert.category || !categories.length) return 0;

    const cat = getCategoryById(cert.category);
    if (!cat) return 0;

    const sub = cat.subcategories.find(s => s.name === cert.subcategory);
    if (!sub) return 0;

    // Fixed points
    if (sub.fixedPoints !== null && sub.fixedPoints !== undefined) return sub.fixedPoints;

    // Level + prizeType based
    if (sub.levels?.length) {
      const levelObj = sub.levels.find(l => l.name === cert.level);
      if (!levelObj) return 0;
      const prizeObj = levelObj.prizes.find(p => p.type === cert.prizeType);
      if (!prizeObj) return 0;
      return prizeObj.points;
    }

    return 0;
  };

  const displayPoints = (cert) => {
    if (!cert) return 0;
    if (cert.status?.toLowerCase() === 'approved') return cert.pointsAwarded ?? calculatePoints(cert);
    if (cert.status?.toLowerCase() === 'pending') return cert.potentialPoints ?? calculatePoints(cert);
    return 0;
  };

  /**
   * TOTAL POINTS LOGIC (Rule-based)
   * 1. Groups certificates by Category.
   * 2. For Arts/Sports, only the highest prize in a category is taken (no clubbing).
   * 3. Caps each segment at its maxPoints (default 40 per Rule 6).
   */
  const calculateTotalPoints = () => {
    const approvedCerts = certificates.filter(c => c.status?.toLowerCase() === 'approved');
    
    // Group certificates by category ID
    const grouped = approvedCerts.reduce((acc, cert) => {
      const catId = cert.category?._id || cert.category;
      if (!acc[catId]) acc[catId] = [];
      acc[catId].push(cert);
      return acc;
    }, {});

    let total = 0;

    Object.keys(grouped).forEach(catId => {
      const catData = getCategoryById(catId);
      const catName = catData?.name || '';
      const certsInCat = grouped[catId];
      
      let catSum = 0;

      // Rule: No clubbing for Arts/Sports
      if (catName.includes('Arts') || catName.includes('Sports')) {
        catSum = Math.max(...certsInCat.map(c => displayPoints(c)), 0);
      } else {
        catSum = certsInCat.reduce((sum, c) => sum + displayPoints(c), 0);
      }

      // Rule: Cap segment points (Default 40, or specific cat max like 50 for NCC)
      const cap = catData?.maxPoints || 40;
      total += Math.min(catSum, cap);
    });

    return total;
  };

  const totalPoints = calculateTotalPoints();

  const handleView = (url) => {
    if (!url) return;
    window.open(url, "_blank");
  };

  return (
    <div className="viewcertificates-container">
      {/* Header */}
      <div className="header">
        <button
          aria-label="Back to dashboard"
          onClick={() => navigate('/dashboard')}
          className="back-button"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="title">My Certificates</h1>
      </div>

      {/* Summary */}
      <div className="summary-card">
        <div className="points-summary full-width">
          <p className="points">{totalPoints}</p>
          <p>Total Points (Capped)</p>
        </div>
        <div className="certificates-count">
          <p>{certificates.length} certificates submitted</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        {['all', 'approved', 'pending', 'rejected'].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            {filter !== 'all' && (
              <span className="filter-count">
                ({certificates.filter(c => (c.status || '').toLowerCase() === filter).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading / Error */}
      {loading && <p className="loading-text">Loading certificates...</p>}
      {error && <p className="error-text">{error}</p>}

      {/* Certificate List */}
      <div className="certificates-list">
        {!loading && filteredCertificates.length === 0 && (
          <div className="no-certificates">
            <FileText size={48} className="no-cert-icon" />
            <h3>No certificates found</h3>
            <p>
              {activeFilter === 'all'
                ? "You haven't submitted any certificates yet."
                : `No ${activeFilter} certificates found.`}
            </p>
            {activeFilter === 'all' && (
              <button
                className="upload-first-btn"
                onClick={() => navigate('/upload-certificate')}
              >
                Upload Your First Certificate
              </button>
            )}
          </div>
        )}

        {!loading && filteredCertificates.map(cert => (
          <div key={cert._id} className="certificate-card">
            <div className="cert-header">
              <h3>{cert.title || "Certificate"}</h3>
              {getStatusIcon(cert.status)}
            </div>

            <div className="cert-category-subcat">
              <span className={`category-badge ${getCategoryColorClassById(cert.category)}`}>
                {getCategoryNameById(cert.category)}
              </span>
              <span className="separator">•</span>
              <span className="subcategory">{cert.subcategory || '—'}</span>
            </div>

            {(cert.level || cert.prizeType) && (
              <div className="prize-level">
                <Award size={16} className="award-icon" />
                <span>
                  {cert.level ? cert.level : ''}
                  {cert.level && cert.prizeType ? ' - ' : ''}
                  {cert.prizeType ?? ''}
                </span>
              </div>
            )}

            <span className={`status-badge ${getStatusColorClass(cert.status)}`}>
              {cert.status ?? 'Unknown'}
            </span>

            <div className="cert-footer">
              <div className="dates-points">
                <div>
                  <Calendar size={16} />
                  <span>
                    Submitted: {cert.createdAt ? new Date(cert.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>

                <div>
                  <Award size={16} className="award-green" />
                  <span className="points-text">
                    +{displayPoints(cert)} pts
                  </span>
                </div>
              </div>

              <div className="actions">
                {cert.fileUrl && (
                  <>
                    <button onClick={() => handleView(cert.fileUrl)} className="btn-view">
                      <Eye size={16} /> View
                    </button>

                    <a
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-download"
                    >
                      <Download size={16} /> Download
                    </a>
                  </>
                )}
              </div>
            </div>

            {cert.status?.toLowerCase() === "rejected" && (
              <div className="rejected-reason">
                <strong>Reason:</strong> {cert.rejectionReason || "Certificate rejected"}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* <BottomNav activeTab="certificates" /> */}
    </div>
  );
}