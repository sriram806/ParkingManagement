import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  CarFront,
  CarTaxiFront,
  Users,
  Receipt,
  Database,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) => {
    return `flex items-center gap-3 px-4 py-3 rounded-md transition-all ${
      isActive
        ? 'bg-primary-100 text-primary-800 font-medium'
        : 'text-gray-600 hover:bg-gray-100'
    }`;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md md:hidden"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar - desktop and mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-6 border-b">
            <h1 className="text-xl font-bold text-primary-800">
              {t('common.appName')}
            </h1>
          </div>

          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            {user?.role === 'guard' ? (
              <ul className="space-y-1">
                <li>
                  <NavLink
                    to="/guard"
                    className={navLinkClasses}
                    onClick={closeMobileMenu}
                    end
                  >
                    <LayoutDashboard size={20} />
                    <span>{t('navigation.dashboard')}</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/guard/entry"
                    className={navLinkClasses}
                    onClick={closeMobileMenu}
                  >
                    <CarFront size={20} />
                    <span>{t('navigation.vehicleEntry')}</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/guard/exit"
                    className={navLinkClasses}
                    onClick={closeMobileMenu}
                  >
                    <CarTaxiFront size={20} />
                    <span>{t('navigation.vehicleExit')}</span>
                  </NavLink>
                </li>
              </ul>
            ) : (
              <ul className="space-y-1">
                <li>
                  <NavLink
                    to="/admin"
                    className={navLinkClasses}
                    onClick={closeMobileMenu}
                    end
                  >
                    <LayoutDashboard size={20} />
                    <span>{t('navigation.dashboard')}</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/guards"
                    className={navLinkClasses}
                    onClick={closeMobileMenu}
                  >
                    <Users size={20} />
                    <span>{t('navigation.guardManagement')}</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/pricing"
                    className={navLinkClasses}
                    onClick={closeMobileMenu}
                  >
                    <Receipt size={20} />
                    <span>{t('navigation.pricingSettings')}</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/logs"
                    className={navLinkClasses}
                    onClick={closeMobileMenu}
                  >
                    <Database size={20} />
                    <span>{t('navigation.vehicleLog')}</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={() => {
                logout();
                closeMobileMenu();
              }}
              className="flex items-center w-full gap-3 px-4 py-2 text-gray-600 transition-colors rounded-md hover:bg-gray-100"
            >
              <LogOut size={20} />
              <span>{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}
    </>
  );
};

export default Sidebar;