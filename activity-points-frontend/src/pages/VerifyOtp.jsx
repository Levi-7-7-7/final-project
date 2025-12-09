import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/OtpVerificationPage.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const BASE_URL =  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function OtpVerificationPage() {
  const navigate = useNavigate();
  const query = useQuery();
  const registerNumber = query.get('registerNumber') || '';

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [batchId, setBatchId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [batches, setBatches] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!registerNumber) {
      alert('No register number found. Please login again.');
      navigate('/');
      return;
    }

    async function fetchDropdownData() {
      try {
        // Assuming this route is correct in your backend
        const res = await axios.get(`${BASE_URL}/students/dropdown-data`);
        setBatches(res.data.batches);
        setBranches(res.data.branches);
      } catch {
        alert('Failed to load dropdown data');
      }
    }

    fetchDropdownData();
  }, [registerNumber, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp || !password || !batchId || !branchId) {
      alert('All fields are required');
      return;
    }

    setLoading(true);

    try {
      // FIXED endpoint here:
      const res = await axios.post(`${BASE_URL}/auth/verify-otp`, {
        registerNumber,
        otp,
        password,
        batch: batchId,
        branch: branchId,
      });

      localStorage.setItem('token', res.data.token);
      alert('Account verified successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'OTP verification failed');
    }

    setLoading(false);
  };

  return (
    <div className="otp-container">
      <h1>Verify OTP & Setup Account</h1>
      <form onSubmit={handleSubmit} className="otp-form">
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="otp-input"
        />
        <input
          type="password"
          placeholder="Set Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="otp-input"
        />
        <select
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          className="otp-select"
        >
          <option value="">Select Batch</option>
          {batches.map((batch) => (
            <option key={batch._id} value={batch._id}>
              {batch.name}
            </option>
          ))}
        </select>
        <select
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className="otp-select"
        >
          <option value="">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch._id} value={branch._id}>
              {branch.name}
            </option>
          ))}
        </select>
        <button type="submit" disabled={loading} className="otp-button">
          {loading ? 'Verifying...' : 'Verify & Complete'}
        </button>
      </form>
    </div>
  );
}
