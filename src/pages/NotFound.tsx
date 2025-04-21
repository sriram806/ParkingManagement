import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ParkingCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const getHomeLink = () => {
    if (!user) return '/login';
    return user.role === 'admin' ? '/admin' : '/guard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center">
          <ParkingCircle size={64} className="text-primary-600" />
        </div>
        
        <h1 className="mt-6 text-3xl font-bold text-gray-900">404</h1>
        <h2 className="mt-1 text-xl font-semibold text-gray-800">Page Not Found</h2>
        
        <p className="mt-3 text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link
          to={getHomeLink()}
          className="mt-8 inline-flex items-center btn btn-primary"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to {user?.role === 'admin' ? 'Admin Dashboard' : 'Guard Dashboard'}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;