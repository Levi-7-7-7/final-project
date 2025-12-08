import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Award,
  Eye,
  Download,
  User,
  Upload,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import '../css/certificatespage.css';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

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

  // Helpers
  const getCategoryNameById = (id) => {
    const cat = categories.find(c => c._id === id);
    return cat ? cat.name : 'Unknown';
  };

  const getCategoryColorClassById = (id) => {
    const cat = categories.find(c => c._id === id);
    return cat?.colorClass || 'category-default';
  };

  const getStatusColorClass = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return 'status-default';
    }
  };

  const getStatusIcon = (status) => {
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
      : certificates.filter(c => c.status.toLowerCase() === activeFilter);

  const totalPoints = certificates
    .filter(c => c.status.toLowerCase() === 'approved')
    .reduce((sum, c) => sum + (c.pointsAwarded || c.points || 0), 0);

  const handleView = (url) => window.open(url, "_blank");

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
          <p>Total Points</p>
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
                ({certificates.filter(c => c.status.toLowerCase() === filter).length})
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
              <span className="subcategory">{cert.subcategory}</span>
            </div>

            {cert.prizeLevel && (
              <div className="prize-level">
                <Award size={16} className="award-icon" />
                <span>{cert.prizeLevel}</span>
              </div>
            )}

            <span className={`status-badge ${getStatusColorClass(cert.status)}`}>
              {cert.status}
            </span>

            <div className="cert-footer">
              <div className="dates-points">
                <div>
                  <Calendar size={16} />
                  <span>Submitted: {new Date(cert.createdAt).toLocaleDateString()}</span>
                </div>

                {/* DYNAMIC POINTS DISPLAY */}
                <div>
                  <Award size={16} className="award-green" />

                  <span className="points-text">
                    +{
                      cert.status.toLowerCase() === "approved"
                        ? (cert.pointsAwarded ?? 0)
                        : cert.status.toLowerCase() === "pending"
                        ? (cert.potentialPoints ?? 0)
                        : 0
                    } pts
                  </span>

                </div>
              </div>

              <div className="actions">
                <button onClick={() => handleView(cert.fileUrl)} className="btn-view">
                  <Eye size={16} /> View
                </button>

                <a
                  href={cert.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="btn-download"
                >
                  <Download size={16} /> Download
                </a>
              </div>
            </div>

            {cert.status.toLowerCase() === "rejected" && (
              <div className="rejected-reason">
                <strong>Reason:</strong> {cert.rejectionReason || "Certificate rejected"}
              </div>
            )}
          </div>
        ))}
      </div>

      <BottomNav activeTab="certificates" />
    </div>
  );
}
