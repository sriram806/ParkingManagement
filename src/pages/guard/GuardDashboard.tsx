import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CarFront, 
  Clock, 
  ArrowRight, 
  CarTaxiFront, 
  Bike, 
  Truck 
} from 'lucide-react';
import { format } from 'date-fns';
import apiService from '../../services/apiService';

interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: 'twoWheeler' | 'threeWheeler' | 'fourWheeler';
  entryTime: string;
  guardName: string;
  shift: 'day' | 'night';
}

const GuardDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeVehicles, setActiveVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveVehicles = async () => {
      try {
        const response = await apiService.getActiveVehicles();
        setActiveVehicles(response.data);
      } catch (error) {
        console.error('Error fetching active vehicles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveVehicles();
  }, []);

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'twoWheeler':
        return <Bike className="text-primary-600" size={24} />;
      case 'threeWheeler':
        return <Truck className="text-secondary-600" size={24} />;
      case 'fourWheeler':
      default:
        return <CarFront className="text-accent-600" size={24} />;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t('guard.dashboard.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('guard.dashboard.welcome', { name: user?.name })}
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link to="/guard/entry" className="btn btn-primary flex items-center gap-2">
            <CarFront size={18} />
            {t('guard.dashboard.entryButton')}
          </Link>
          <Link to="/guard/exit" className="btn btn-secondary flex items-center gap-2">
            <CarTaxiFront size={18} />
            {t('guard.dashboard.exitButton')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {t('guard.dashboard.activeVehicles')}
            </h2>
            <span className="text-2xl font-bold text-primary-600">
              {activeVehicles.length}
            </span>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-600"></div>
            </div>
          ) : activeVehicles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active vehicles
            </div>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {activeVehicles.map((vehicle) => (
                <div 
                  key={vehicle.id}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {getVehicleIcon(vehicle.vehicleType)}
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-gray-800">
                      {vehicle.vehicleNumber}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock size={12} className="mr-1" />
                      <span>
                        {format(new Date(vehicle.entryTime), 'dd MMM yyyy, h:mm a')}
                      </span>
                    </div>
                  </div>
                  <Link 
                    to={`/guard/exit?vehicleNumber=${vehicle.vehicleNumber}`}
                    className="p-1.5 rounded-full hover:bg-gray-200"
                  >
                    <ArrowRight size={16} className="text-gray-500" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {t('guard.dashboard.recentActivity')}
          </h2>
          
          <div className="border-l-2 border-gray-200 pl-4 space-y-6 max-h-[300px] overflow-y-auto pr-1">
            <div className="relative">
              <div className="absolute -left-6 top-0 w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">Vehicle KA01AB1234 entered</p>
                <p className="text-xs text-gray-500 mt-1">20 minutes ago</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -left-6 top-0 w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">Vehicle KA02CD5678 exited</p>
                <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -left-6 top-0 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">Shift started</p>
                <p className="text-xs text-gray-500 mt-1">6 hours ago</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -left-6 top-0 w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">Vehicle MH05XY9876 entered</p>
                <p className="text-xs text-gray-500 mt-1">Yesterday, 5:30 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardDashboard;