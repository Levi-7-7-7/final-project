import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ---------------------- Student Pages ----------------------
import Login from './pages/Login';
import VerifyOtp from './pages/VerifyOtp';
import Dashboard from './pages/Dashboard';
import UploadCertificates from './pages/UploadCertificates';
import CertificatesPage from './pages/CertificatesPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PrivateRoute from './components/PrivateRoute';

// ---------------------- Tutor Pages ----------------------
//import TutorLogin from './pages/TutorLogin';
import TutorDashboard from './pages/TutorDashboard';
import TutorPrivateRoute from './components/TutorPrivateRoute';

// ---------------------- Tutor Dashboard Nested Pages ----------------------
import StudentList from './pages/StudentList';
import UploadCSV from './pages/UploadCSV';
// Placeholder pages (create later)
import PendingCertificates from './pages/PendingCertificates';
import ApprovedCertificates from './pages/ApprovedCertificates';

import StudentDetails from './pages/StudentDetails'; // ✅ ADDED


//import AdminPanel from './pages/AdminPanel';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= STUDENT ROUTES ================= */}
        <Route path="/" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/certificates" element={<CertificatesPage />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/upload-certificate"
          element={
            <PrivateRoute>
              <UploadCertificates />
            </PrivateRoute>
          }
        />


{/*<Route path="/admin" element={<AdminPanel />} />*/}

        
        {/* ================= TUTOR ROUTES ================= */}
        <Route path="/tutor/login" element={<Login />} />

        {/* Tutor Dashboard (parent) */}
        <Route
          path="/tutor/dashboard"
          element={
            <TutorPrivateRoute>
              <TutorDashboard />
            </TutorPrivateRoute>
          }
        >
          {/* Nested pages rendered inside <Outlet /> in TutorDashboard */}
          <Route index element={<h2>Welcome, Tutor!</h2>} />
          <Route path="students" element={<StudentList />} />
          <Route path="upload" element={<UploadCSV />} />
          <Route path="pending" element={<PendingCertificates />} />
          <Route path="approved" element={<ApprovedCertificates />} />
         
         
          <Route path="students/:studentId" element={<StudentDetails />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );


  
}

export default App;