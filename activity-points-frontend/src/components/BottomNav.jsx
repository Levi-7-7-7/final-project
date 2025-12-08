// src/components/BottomNav.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, User } from 'lucide-react';

const navItems = [
  { id: 'profile', icon: User, label: 'Profile', path: '/dashboard' },
  { id: 'upload', icon: Upload, label: 'Upload New Certificate', path: '/upload-certificate' },
  { id: 'certificates', icon: FileText, label: 'View Certificates', path: '/certificates' },
];

export default function BottomNav({ activeTab }) {
  const navigate = useNavigate();

  return (
    <div className="bottom-nav">
      {navItems.map(({ id, icon: Icon, label, path }) => (
        <button
          key={id}
          onClick={() => navigate(path)}
          className={`nav-btn ${activeTab === id ? 'active' : ''}`}
          aria-current={activeTab === id ? 'page' : undefined}
          aria-label={label}
          type="button"
        >
          <Icon size={24} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
