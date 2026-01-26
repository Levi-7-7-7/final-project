import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import axios from 'axios';
import { ArrowLeft, Award, CheckCircle, Paperclip } from 'lucide-react';
import '../css/upload.css';

const MAX_FILE_SIZE_MB = 1;

export default function CertificateUploadScreen() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [subcategoryName, setSubcategoryName] = useState('');
  const [levelSelected, setLevelSelected] = useState('');
  const [prizeType, setPrizeType] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [eligiblePoints, setEligiblePoints] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const prizeLevels = ['Participation', 'First', 'Second', 'Third'];
  const API_BASE = import.meta.env.VITE_API_URL;
  const CATEGORIES_API = `${API_BASE}/categories`;
  const CERT_UPLOAD_API = `${API_BASE}/certificates/upload`;

  // Fetch categories
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios
      .get(CATEGORIES_API, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCategories(res.data.categories || []))
      .catch(() => alert('Failed to fetch categories'));
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      setSubcategoryName('');
      setLevelSelected('');
      setPrizeType('');
      setEligiblePoints(null);
      return;
    }

    const category = categories.find(c => c._id === categoryId);
    setSubcategories(category?.subcategories || []);
    setSubcategoryName('');
    setLevelSelected('');
    setPrizeType('');
    setEligiblePoints(null);
  }, [categoryId, categories]);

  // Calculate eligible points
  useEffect(() => {
    if (!categoryId || !subcategoryName) {
      setEligiblePoints(null);
      return;
    }

    const category = categories.find(c => c._id === categoryId);
    const sub = category?.subcategories?.find(s => s.name === subcategoryName);
    if (!sub) return setEligiblePoints(null);

    if (sub.fixedPoints != null) {
      setEligiblePoints(sub.fixedPoints);
    } else if (sub.levels?.length) {
      if (!levelSelected || !prizeType) return setEligiblePoints(null);
      const levelObj = sub.levels.find(l => l.name === levelSelected);
      const prizeObj = levelObj?.prizes.find(p => p.type === prizeType);
      setEligiblePoints(prizeObj?.points ?? null);
    } else {
      setEligiblePoints(null);
    }
  }, [categoryId, subcategoryName, levelSelected, prizeType, categories]);

  const handleFileUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > MAX_FILE_SIZE_MB) {
      alert(`File must be under ${MAX_FILE_SIZE_MB} MB`);
      e.target.value = '';
      setUploadedFile(null);
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
      const formData = new FormData();
      formData.append('categoryId', categoryId);
      formData.append('subcategoryName', subcategoryName);
      formData.append('level', levelSelected || '');
      formData.append('prizeType', prizeType || '');
      formData.append('file', uploadedFile);

      await axios.post(CERT_UPLOAD_API, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmitted(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      alert('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // SUCCESS SCREEN
  if (submitted) {
    return (
      <div className="certificate-upload-container success-screen">
        <CheckCircle size={64} color="#22c55e" />
      </div>
    );
  }

  return (
    <div className="certificate-upload-container">
      <header>
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          <ArrowLeft />
        </button>
        <h2 className="title">Upload Certificate</h2>
      </header>

      <main>
        {/* Category */}
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className="upload-select"
        >
          <option value="">Select category</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Subcategory */}
        {subcategories.length > 0 && (
          <select
            value={subcategoryName}
            onChange={e => setSubcategoryName(e.target.value)}
            className="upload-select"
          >
            <option value="">Select subcategory</option>
            {subcategories.map(s => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        )}

        {/* Level */}
        {subcategoryName &&
          subcategories.find(s => s.name === subcategoryName)?.levels?.length > 0 && (
            <select
              value={levelSelected}
              onChange={e => setLevelSelected(e.target.value)}
              className="upload-select"
            >
              <option value="">Select Level</option>
              {subcategories
                .find(s => s.name === subcategoryName)
                .levels.map(l => (
                  <option key={l.name} value={l.name}>
                    {l.name}
                  </option>
                ))}
            </select>
          )}

        {/* Prize Type */}
        {subcategoryName &&
          subcategories.find(s => s.name === subcategoryName)?.levels?.length > 0 && (
            <select
              value={prizeType}
              onChange={e => setPrizeType(e.target.value)}
              className="upload-select"
            >
              <option value="">Select Prize Type</option>
              {prizeLevels.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}

        {/* Eligible Points */}
        {eligiblePoints !== null && (
          <div className="eligible-points">
            <strong>
              <Award /> Eligible Points: {eligiblePoints}
            </strong>
            <p>*Final points will be approved by tutor</p>
          </div>
        )}

        {/* File Upload */}
        <div className="upload-input-wrapper">
          <label htmlFor="file-upload" className="upload-input-btn">
            <Paperclip size={16} style={{ marginRight: 8 }} />
            {uploadedFile
              ? `${uploadedFile.name} (${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)`
              : `Choose File (Max ${MAX_FILE_SIZE_MB} MB)`}
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="upload-input"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="upload-btn"
        >
          {uploading ? 'Uploading...' : 'Submit Certificate'}
        </button>
      </main>

      <BottomNav activeTab="upload" />
    </div>
  );
}
