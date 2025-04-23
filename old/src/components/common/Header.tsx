import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, BellRing } from 'lucide-react';
import { format } from 'date-fns';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [hasNotifications, setHasNotifications] = React.useState(true);
  const [showNotifications, setShowNotifications] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (hasNotifications) setHasNotifications(false);
  };

  const getShiftLabel = (shift: string | undefined) => {
    if (!shift) return '';
    return t(`guard.dashboard.currentShift`, { shift: t(`admin.guardManagement.${shift}`) });
  };

  return (
    <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-gray-800 hidden md:block">
          {user?.role === 'admin' ? 'Admin' : 'Guard'} Panel
        </h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-1 text-gray-600">
          <Clock size={18} />
          <span className="text-sm font-medium">
            {format(currentTime, 'h:mm a')}
          </span>
        </div>
        
        {user?.role === 'guard' && (
          <div className="hidden md:block text-sm font-medium px-3 py-1 bg-primary-50 text-primary-800 rounded-full">
            {getShiftLabel(user.shift)}
          </div>
        )}
        
        <div className="relative">
          <button 
            onClick={toggleNotifications}
            className="p-1.5 rounded-full hover:bg-gray-100 relative"
          >
            <BellRing size={20} className="text-gray-600" />
            {hasNotifications && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg overflow-hidden z-10 animate-fade-in">
              <div className="p-3 border-b">
                <h3 className="text-sm font-semibold">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="p-3 border-b hover:bg-gray-50">
                  <p className="text-sm text-gray-800">New vehicle entry registered</p>
                  <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
                </div>
                <div className="p-3 border-b hover:bg-gray-50">
                  <p className="text-sm text-gray-800">Vehicle KA01AB1234 has been parked for 7 days</p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="p-2 text-center border-t">
                <button className="text-xs text-primary-600 hover:text-primary-800">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        <button 
          onClick={toggleLanguage}
          className="px-2 py-1 text-sm font-medium rounded hover:bg-gray-100"
        >
          {language === 'en' ? 'हिन्दी' : 'English'}
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium hidden md:block">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;