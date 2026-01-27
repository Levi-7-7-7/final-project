import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tutorAxios from '../api/tutorAxios';
import { Loader2, Award, Info, ArrowLeft, ExternalLink } from 'lucide-react';
import '../css/StudentDetails.css';

const StudentDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [certRes, catRes] = await Promise.all([
          tutorAxios.get('/tutors/certificates'),
          tutorAxios.get('/categories')
        ]);

        const allCerts = certRes.data.certificates || [];
        const studentCerts = allCerts.filter(
          cert => (cert.student?._id || cert.student) === studentId
        );
        
        setCertificates(studentCerts);
        setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error('Error fetching student details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const pointsSummary = useMemo(() => {
    const approvedCerts = certificates.filter(c => c.status?.toLowerCase() === 'approved');
    const rawTotal = approvedCerts.reduce((sum, c) => sum + (c.pointsAwarded || 0), 0);

    const grouped = approvedCerts.reduce((acc, cert) => {
      const catId = cert.category?._id || cert.category;
      if (!acc[catId]) acc[catId] = [];
      acc[catId].push(cert);
      return acc;
    }, {});

    let cappedTotal = 0;
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

      const cap = catData.maxPoints || 40;
      cappedTotal += Math.min(catSum, cap);
    });

    return { rawTotal, cappedTotal };
  }, [certificates, categories]);

  const filteredCerts = filter === 'all' 
    ? certificates 
    : certificates.filter(c => c.status?.toLowerCase() === filter);

  const student = certificates[0]?.student;

  const displayPoints = (cert) => {
    if (!cert) return 0;
    if (cert.status?.toLowerCase() === 'approved') return cert.pointsAwarded ?? 0;
    
    const cat = cert.category;
    const sub = cat?.subcategories?.find(
      s => s.name.toLowerCase() === cert.subcategory?.toLowerCase()
    );
    if (!sub) return 0;
    if (sub.fixedPoints != null) return sub.fixedPoints;
    if (sub.levels && cert.level && cert.prizeType) {
      const lvl = sub.levels.find(l => l.name === cert.level);
      const prize = lvl?.prizes.find(p => p.type === cert.prizeType);
      return prize?.points ?? 0;
    }
    return 0;
  };

  return (
    <div className="student-details-container">
      <button className="back-btn" onClick={() => navigate('/tutor/dashboard/students')}>
        <ArrowLeft size={18} /> Back to Students
      </button>

      {loading ? (
        <div className="loading-state">
          <Loader2 className="spinner" />
          <p>Analyzing student records...</p>
        </div>
      ) : (
        <>
          {student && (
            <header className="student-profile-card">
              <div className="profile-main">
                <div className="avatar-circle">
                  {student.name?.charAt(0)}
                </div>
                <div className="profile-info">
                  <h2>{student.name}</h2>
                  <p className="reg-no">{student.registerNumber}</p>
                  <p className="email-text">{student.email}</p>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-box raw">
                  <span className="stat-label">Raw Total</span>
                  <span className="stat-value">{pointsSummary.rawTotal}</span>
                </div>
                <div className="stat-box capped">
                  <span className="stat-label">
                    Capped Total <Info size={14} className="info-icon" />
                  </span>
                  <span className="stat-value">{pointsSummary.cappedTotal}</span>
                </div>
              </div>
            </header>
          )}

          <section className="certificates-section">
            <div className="section-header">
              <h3>Certificates</h3>
              <div className="filter-pills">
                {['all', 'pending', 'approved', 'rejected'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`pill ${filter === s ? 'active' : ''}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {!filteredCerts.length ? (
              <div className="empty-placeholder">
                <Award size={48} />
                <p>No {filter !== 'all' ? filter : ''} certificates found.</p>
              </div>
            ) : (
              <div className="cert-grid">
                {filteredCerts.map(cert => (
                  <div key={cert._id} className={`cert-card border-${cert.status}`}>
                    <div className="cert-top">
                      <span className={`status-indicator ${cert.status}`}>
                        {cert.status}
                      </span>
                      <h4 className="truncate">{cert.category?.name}</h4>
                    </div>
                    
                    <div className="cert-body">
                      <p className="subcat"><strong>Subcategory:</strong> {cert.subcategory}</p>
                      <div className="points-badge">
                        {displayPoints(cert)} pts
                      </div>
                    </div>

                    <div className="cert-footer">
                      <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="view-doc">
                        View Document <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default StudentDetails;