import React, { useEffect, useState } from 'react';
import { Loader2, Award } from 'lucide-react';
import tutorAxios from '../api/tutorAxios';
import '../css/PendingCertificates.css';

const PendingCertificates = () => {
  const [pendingCertificates, setPendingCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingCertId, setProcessingCertId] = useState(null);

  // Fetch pending certificates
  const fetchPendingCertificates = async () => {
    try {
      setLoading(true);
      const res = await tutorAxios.get('/tutors/certificates/pending');
      setPendingCertificates(res.data || []);
    } catch (err) {
      console.error('Error fetching pending certificates:', err.response ?? err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCertificates();
  }, []);

  // Function to calculate potential points
  const getPotentialPoints = (cert) => {
    if (!cert || !cert.category) return 0;

    const cat = cert.category;
    const sub = cat.subcategories?.find(
      s => s.name.toLowerCase() === cert.subcategory?.toLowerCase()
    );
    if (!sub) return 0;

    // Simple fixed points
    if (sub.fixedPoints != null) return sub.fixedPoints;

    // Levels + prize
    if (sub.levels && cert.level && cert.prizeType) {
      const lvl = sub.levels.find(l => l.name === cert.level);
      if (!lvl) return 0;
      const prize = lvl.prizes.find(p => p.type === cert.prizeType);
      return prize?.points ?? 0;
    }

    return 0;
  };

  // Approve / Reject handler
  const handleCertificateAction = async (certId, action) => {
    setProcessingCertId(certId);
    try {
      await tutorAxios.post(`/tutors/certificates/${certId}/${action}`);
      // Refresh list
      await fetchPendingCertificates();
    } catch (err) {
      console.error(`Failed to ${action} certificate:`, err.response ?? err);
      alert(err.response?.data?.error || `Failed to ${action} certificate`);
    } finally {
      setProcessingCertId(null);
    }
  };

  if (loading)
    return (
      <p className="pending-loading">
        <Loader2 className="spinner" /> Loading pending certificates...
      </p>
    );

  if (!pendingCertificates.length)
    return <p className="pending-loading">No pending certificates</p>;

  return (
    <div className="pending-container">
      {pendingCertificates.map(cert => {
        const isProcessing = processingCertId === cert._id;
        const points = getPotentialPoints(cert);

        return (
          <div key={cert._id} className="pending-card">
            <div className="card-left">
              <h3 className="student-name">{cert.student?.name || 'N/A'}</h3>
              <p><strong>Category:</strong> {cert.category?.name || 'N/A'}</p>
              <p><strong>Subcategory:</strong> {cert.subcategory || 'N/A'}</p>
              {(cert.level || cert.prizeType) && (
                <p>
                  <Award size={14} />{' '}
                  {cert.level ? cert.level : ''}
                  {cert.level && cert.prizeType ? ' - ' : ''}
                  {cert.prizeType ?? ''}
                </p>
              )}
              <p><strong>Points:</strong> {points} pts</p>
              <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="view-link">
                View Certificate
              </a>
            </div>

            <div className="card-right">
              <button
                className="btn-approve"
                onClick={() => handleCertificateAction(cert._id, 'approve')}
                disabled={isProcessing}
              >
                {isProcessing ? <><Loader2 size={16} className="spinner" /> Processing...</> : 'Approve'}
              </button>

              <button
                className="btn-reject"
                onClick={() => handleCertificateAction(cert._id, 'reject')}
                disabled={isProcessing}
              >
                {isProcessing ? <><Loader2 size={16} className="spinner" /> Processing...</> : 'Reject'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PendingCertificates;