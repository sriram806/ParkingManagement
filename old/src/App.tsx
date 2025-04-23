import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AuthProvider from './contexts/AuthContext';
import SocketProvider from './contexts/SocketContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import GuardDashboard from './pages/guard/GuardDashboard';
import VehicleEntry from './pages/guard/VehicleEntry';
import VehicleExit from './pages/guard/VehicleExit';
import AdminDashboard from './pages/admin/AdminDashboard';
import GuardManagement from './pages/admin/GuardManagement';
import PricingSettings from './pages/admin/PricingSettings';
import VehicleLog from './pages/admin/VehicleLog';
import LanguageProvider from './contexts/LanguageContext';
import NotFound from './pages/NotFound';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Guard Routes */}
              <Route path="/guard" element={<ProtectedRoute role="guard" />}>
                <Route index element={<GuardDashboard />} />
                <Route path="entry" element={<VehicleEntry />} />
                <Route path="exit" element={<VehicleExit />} />
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute role="admin" />}>
                <Route index element={<AdminDashboard />} />
                <Route path="guards" element={<GuardManagement />} />
                <Route path="pricing" element={<PricingSettings />} />
                <Route path="logs" element={<VehicleLog />} />
              </Route>
              
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </SocketProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;