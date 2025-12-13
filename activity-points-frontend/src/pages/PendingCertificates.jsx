import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react'; // Import the spinner icon
import tutorAxios from '../api/tutorAxios';
import '../css/PendingCertificates.css'; 

const PendingCertificates = () => {
  // State to hold the list of certificates
  const [pendingCertificates, setPendingCertificates] = useState([]);
  // State for initial data fetching status
  const [loading, setLoading] = useState(true);
  // NEW STATE: Tracks the ID of the certificate currently being approved or rejected
  const [processingCertId, setProcessingCertId] = useState(null); 

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
    // 1. Set the processing ID immediately to disable the buttons
    setProcessingCertId(certId);
    
    try {
      // Send the action request
      await tutorAxios.post(`/tutors/certificates/${certId}/${action}`);
      
      // On success, refresh the list (which will remove the item)
      await fetchPendingCertificates(); 

    } catch (err) {
      console.error(`Failed to ${action} certificate:`, err.response ?? err);
      alert(err.response?.data?.error || `Failed to ${action} certificate`);
    } finally {
      // 2. Clear the processing ID state in case of failure or after refresh is complete
      setProcessingCertId(null); 
    }
  };

  // Initial loading screen
  if (loading)
    return <p className="pending-loading">Loading pending certificates...</p>;

  // No certificates screen
  if (!pendingCertificates.length)
    return <p className="pending-loading">No pending certificates</p>;

  return (
    <div className="pending-container">
      {pendingCertificates.map((cert) => {
        // Check if this specific certificate is currently being processed
        const isProcessing = processingCertId === cert._id;
        const currentAction = cert._id === processingCertId ? 'Processing...' : 'Approve';
        
        return (
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
            
            {/* --- APPROVE BUTTON --- */}
            <button
              className="btn-approve"
              onClick={() => handleCertificateAction(cert._id, 'approve')}
              // Disabled if any certificate is currently being processed
              disabled={isProcessing} 
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="spinner" /> 
                  Processing...
                </>
              ) : (
                'Approve'
              )}
            </button>
            
            {/* --- REJECT BUTTON --- */}
            <button
              className="btn-reject"
              onClick={() => handleCertificateAction(cert._id, 'reject')}
              // Disabled if any certificate is currently being processed
              disabled={isProcessing} 
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="spinner" /> 
                  Processing...
                </>
              ) : (
                'Reject'
              )}
            </button>
          </div>
        </div>
      );})}
    </div>
  );
};

export default PendingCertificates;