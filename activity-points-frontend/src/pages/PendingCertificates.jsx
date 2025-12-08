import React, { useEffect, useState } from 'react';
import tutorAxios from '../api/tutorAxios';
import '../css/TutorDashboard.css';

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
    return <p className="p-4 text-center">Loading pending certificates...</p>;

  if (!pendingCertificates.length)
    return <p className="p-4 text-center">No pending certificates</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Pending Certificates</h2>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Student</th>
            <th className="p-2">Category</th>
            <th className="p-2">Subcategory</th>
            <th className="p-2">Prize Level</th>
            <th className="p-2">File</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingCertificates.map((cert) => (
            <tr key={cert._id} className="border">
              <td className="p-2">{cert.student?.name || 'N/A'}</td>
              <td className="p-2">{cert.category?.name || 'N/A'}</td>
              <td className="p-2">{cert.subcategory || 'N/A'}</td>
              <td className="p-2">{cert.prizeLevel || 'N/A'}</td>
              <td className="p-2">
                <a href={cert.fileUrl} target="_blank" rel="noreferrer">
                  View
                </a>
              </td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => handleCertificateAction(cert._id, 'approve')}
                  className="btn-approve"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleCertificateAction(cert._id, 'reject')}
                  className="btn-reject"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PendingCertificates;
