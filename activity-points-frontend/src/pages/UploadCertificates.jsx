import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';  // import common nav component
import axios from 'axios';
import {
  ArrowLeft,
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  Award,
  CheckCircle,
  User
} from 'lucide-react';

const MAX_FILE_SIZE_MB = 1;

export default function CertificateUploadScreen() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]); // array
  const [categoryId, setCategoryId] = useState(''); // selected category _id
  const [subcategories, setSubcategories] = useState([]);
  const [subcategoryName, setSubcategoryName] = useState('');
  const [prizeLevel, setPrizeLevel] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);

  const prizeLevels = ['First Place', 'Second Place', 'Third Place', 'Participation'];

  const CATEGORIES_API = `${import.meta.env.VITE_API_URL}/categories`;
  const CERTIFICATE_UPLOAD_API = `${import.meta.env.VITE_API_URL}/certificates/upload`;

  // Fetch categories on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to fetch categories');
      return;
    }

    axios.get(CATEGORIES_API, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setCategories(res.data.categories || []);
    })
    .catch(err => {
      alert('Failed to fetch categories from server.');
      console.error(err);
    });
  }, []);

  // Update subcategories when categoryId or categories change
  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      setSubcategoryName('');
      return;
    }
    const selectedCategory = categories.find(cat => cat._id === categoryId);
    if (selectedCategory) {
      setSubcategories(selectedCategory.subcategories || []);
      setSubcategoryName('');
    } else {
      setSubcategories([]);
      setSubcategoryName('');
    }
  }, [categoryId, categories]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      alert(`File size exceeds ${MAX_FILE_SIZE_MB} MB. Please select a smaller file.`);
      e.target.value = '';
      return;
    }

    setUploadedFile(file);
  };

  const removeFile = () => setUploadedFile(null);

  const canSubmit = categoryId && subcategoryName && uploadedFile && !uploading;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in!');
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('categoryId', categoryId);
      formData.append('subcategoryName', subcategoryName);
      formData.append('prizeLevel', prizeLevel);
      formData.append('file', uploadedFile);

      await axios.post(CERTIFICATE_UPLOAD_API, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setIsSubmitted(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload certificate. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #dbeafe, #d1fae5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <div style={{ maxWidth: 400, textAlign: 'center', background: 'rgba(255 255 255 / 0.8)', borderRadius: 24, padding: 32, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <div style={{ margin: '0 auto 16px', width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CheckCircle style={{ width: 32, height: 32, color: 'white' }} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#1e293b' }}>Success!</h2>
          <p style={{ color: '#475569', marginBottom: 8 }}>Your certificate has been submitted for review.</p>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>You'll receive notification once it's approved.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #dbeafe, #d1fae5)', paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', maxWidth: 720, margin: '0 auto 24px', paddingTop: 48 }}>
        <button
          onClick={() => navigate('/dashboard')}
          aria-label="Back to dashboard"
          style={{ padding: 8, borderRadius: 16, backgroundColor: 'rgba(255 255 255 / 0.8)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
        >
          <ArrowLeft style={{ width: 20, height: 20, color: '#334155' }} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#334155', marginLeft: 16 }}>Upload Certificate</h1>
      </header>

      {/* Form */}
      <main style={{ maxWidth: 720, margin: '0 auto', background: 'rgba(255 255 255 / 0.8)', borderRadius: 24, padding: 24, boxShadow: '0 10px 20px rgb(219 234 254 / 0.5)' }}>
        <section style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Award style={{ width: 24, height: 24, color: '#2563eb' }} />
          <h2 style={{ fontSize: 20, color: '#2563eb', margin: 0 }}>Activity Details</h2>
        </section>

        {/* Category */}
        <div style={{ marginBottom: 24 }}>
          <label htmlFor="category" style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#475569' }}>Category</label>
          <select
            id="category"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: 16, border: '2px solid #cbd5e1', fontSize: 16, outline: 'none' }}
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Subcategory */}
        {subcategories.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <label htmlFor="subcategory" style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#475569' }}>Subcategory</label>
            <select
              id="subcategory"
              value={subcategoryName}
              onChange={e => setSubcategoryName(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: 16, border: '2px solid #cbd5e1', fontSize: 16, outline: 'none' }}
            >
              <option value="">Select subcategory</option>
              {subcategories.map(sub => (
                <option key={sub.name} value={sub.name}>{sub.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Prize Level */}
        <div style={{ marginBottom: 24 }}>
          <label htmlFor="prizeLevel" style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#475569' }}>Prize Level (Optional)</label>
          <select
            id="prizeLevel"
            value={prizeLevel}
            onChange={e => setPrizeLevel(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: 16, border: '2px solid #cbd5e1', fontSize: 16, outline: 'none' }}
          >
            <option value="">Select prize level if applicable</option>
            {prizeLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div style={{ marginBottom: 24 }}>
          <label htmlFor="file-upload" style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#475569' }}>Certificate File</label>

          {!uploadedFile ? (
            <div
              onClick={() => document.getElementById('file-upload').click()}
              style={{ border: '2px dashed #cbd5e1', borderRadius: 16, padding: 32, textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', userSelect: 'none' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
              aria-label="Upload certificate file"
            >
              <input
                type="file"
                id="file-upload"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <div style={{ width: 48, height: 48, margin: '0 auto 12px', backgroundColor: '#bfdbfe', borderRadius: 16, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Upload style={{ width: 24, height: 24, color: '#2563eb' }} />
              </div>
              <p style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>Upload Certificate</p>
              <p style={{ fontSize: 12, color: '#64748b' }}>PNG, JPG or PDF (Max 1MB)</p>
            </div>
          ) : (
            <div style={{ border: '2px solid #bbf7d0', backgroundColor: '#dcfce7', borderRadius: 16, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, backgroundColor: '#bbf7d0', borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {uploadedFile.type.startsWith('image/') ? (
                    <ImageIcon style={{ width: 20, height: 20, color: '#22c55e' }} />
                  ) : (
                    <FileText style={{ width: 20, height: 20, color: '#22c55e' }} />
                  )}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: '#334155', margin: 0 }}>{uploadedFile.name}</p>
                  <p style={{ fontSize: 11, color: '#475569', margin: 0 }}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={removeFile} aria-label="Remove uploaded file" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            width: '100%',
            height: 48,
            background: canSubmit ? 'linear-gradient(to right, #2563eb, #1e40af)' : '#94a3b8',
            color: 'white',
            borderRadius: 16,
            fontWeight: 700,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            boxShadow: canSubmit ? '0 5px 15px rgba(37, 99, 235, 0.5)' : 'none',
            transition: 'background-color 0.25s'
          }}
        >
          {uploading ? 'Uploading...' : 'Submit Certificate'}
        </button>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 12, marginTop: 12 }}>
          Your submission will be reviewed by tutors within 24-48 hours
        </p>
      </main>

      {/* Use common BottomNav */}
      <BottomNav activeTab="upload" />
    </div>
  );
}
