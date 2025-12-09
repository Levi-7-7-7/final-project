import React, { useEffect, useState } from 'react';
import tutorAxios from '../api/tutorAxios';
import '../css/PendingCertificates.css'; // new CSS file

const PendingCertificates = () => {
  const [pendingCertificates, setPendingCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingCertificates();
  }, []);

  const fetchPendingCertificates = async () => {
    try {
      const res = await tutorAxios.get('/tutors/certificates/pending');
      setPendingCertificates(res.data);
    } catch (err) {
      console.error('Error fetching pending certificates:', err.response ?? err);
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateAction = async (certId, action) => {
    try {
      await tutorAxios.post(`/tutors/certificates/${certId}/${action}`);
      fetchPendingCertificates(); // refresh list
    } catch (err) {
      console.error(`Failed to ${action} certificate:`, err.response ?? err);
      alert(err.response?.data?.error || `Failed to ${action} certificate`);
    }
  };

  if (loading)
    return <p className="pending-loading">Loading pending certificates...</p>;

  if (!pendingCertificates.length)
    return <p className="pending-loading">No pending certificates</p>;

  return (
    <div className="pending-container">
      {pendingCertificates.map((cert) => (
        <div key={cert._id} className="pending-card">
          <div className="card-left">
            <h3 className="student-name">{cert.student?.name || 'N/A'}</h3>
            <p><strong>Category:</strong> {cert.category?.name || 'N/A'}</p>
            <p><strong>Subcategory:</strong> {cert.subcategory || 'N/A'}</p>
            <p><strong>Prize Level:</strong> {cert.prizeLevel || 'N/A'}</p>
            <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="view-link">
              View Certificate
            </a>
          </div>
          <div className="card-right">
            <button
              className="btn-approve"
              onClick={() => handleCertificateAction(cert._id, 'approve')}
            >
              Approve
            </button>
            <button
              className="btn-reject"
              onClick={() => handleCertificateAction(cert._id, 'reject')}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingCertificates;
