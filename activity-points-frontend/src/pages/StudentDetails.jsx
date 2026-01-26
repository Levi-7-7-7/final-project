import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tutorAxios from '../api/tutorAxios';
import { Loader2, Award } from 'lucide-react';
import '../css/StudentDetails.css';

const StudentDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Fetch certificates for the student
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const res = await tutorAxios.get('/tutors/certificates');
        const allCerts = res.data.certificates || [];
        const studentCerts = allCerts.filter(
          cert => cert.student?._id === studentId
        );
        setCertificates(studentCerts);
      } catch (err) {
        console.error('Error fetching student certificates:', err);
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [studentId]);

  const filteredCerts =
    filter === 'all'
      ? certificates
      : certificates.filter(c => c.status?.toLowerCase() === filter);

  const student = certificates[0]?.student;

  // Function to calculate points to display
  const displayPoints = (cert) => {
    if (!cert || !cert.category) return 0;

    // If approved, use awarded points
    if (cert.status?.toLowerCase() === 'approved') {
      return cert.pointsAwarded ?? 0;
    }

    // If pending, calculate potential points
    const cat = cert.category; // populated
    const sub = cat.subcategories?.find(
      s => s.name.toLowerCase() === cert.subcategory?.toLowerCase()
    );
    if (!sub) return 0;

    // Fixed points for simple activities
    if (sub.fixedPoints != null) return sub.fixedPoints;

    // For levels + prizeType
    if (sub.levels && cert.level && cert.prizeType) {
      const lvl = sub.levels.find(l => l.name === cert.level);
      if (!lvl) return 0;
      const prize = lvl.prizes.find(p => p.type === cert.prizeType);
      return prize?.points ?? 0;
    }

    return 0;
  };

  return (
    <div className="student-details">
      {/* 🔙 Back Button */}
      <button
        className="back-btn"
        onClick={() => navigate('/tutor/dashboard/students')}
      >
        ← Back to Students
      </button>

      {/* Loading */}
      {loading && (
        <div className="loading-container">
          <Loader2 className="spinner" />
          Loading student data...
        </div>
      )}

      {/* Student Info */}
      {student && (
        <div className="student-card">
          <h2>{student.name}</h2>
          <p>Register No: {student.registerNumber}</p>
          <p>Email: {student.email}</p>
          <p>Total Points: {student.totalPoints ?? 0}</p>
        </div>
      )}

      {/* No certificates message */}
      {!loading && !certificates.length && (
        <p className="empty-text">
          No certificates found for this student
        </p>
      )}

      {/* Filters + Certificates */}
      {!loading && certificates.length > 0 && (
        <>
          <div className="filters">
            {['all', 'pending', 'approved', 'rejected'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`filter-btn ${filter === s ? 'active' : ''}`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="cert-grid">
            {filteredCerts.map(cert => (
              <div key={cert._id} className="cert-card">
                <div className="cert-header">
                  <h4>{cert.category?.name || 'N/A'}</h4>
                  <span className={`cert-status ${cert.status}`}>
                    {cert.status?.toUpperCase() || 'N/A'}
                  </span>
                </div>

                <p>Subcategory: {cert.subcategory || 'N/A'}</p>

                {(cert.level || cert.prizeType) && (
                  <p>
                    <Award size={14} />{' '}
                    {cert.level ? cert.level : ''}
                    {cert.level && cert.prizeType ? ' - ' : ''}
                    {cert.prizeType ?? ''}
                  </p>
                )}

                <p>Points: {displayPoints(cert)} pts</p>

                {cert.status?.toLowerCase() === 'rejected' && (
                  <p className="rejection-reason">
                    Reason: {cert.rejectionReason || 'Certificate rejected'}
                  </p>
                )}

                <a
                  href={cert.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="view-link"
                >
                  View Certificate
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDetails;
