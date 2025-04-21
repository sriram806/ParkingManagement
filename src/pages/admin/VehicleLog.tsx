import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Download, 
  Filter, 
  Search, 
  CarFront, 
  Bike, 
  Truck, 
  Clock,
  CheckCircle,
  X,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import apiService from '../../services/apiService';

interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: 'twoWheeler' | 'threeWheeler' | 'fourWheeler';
  entryTime: string;
  exitTime: string | null;
  guardId: string;
  guardName: string;
  shift: 'day' | 'night';
  fees: number | null;
  status: 'active' | 'exited';
}

interface FilterOptions {
  date: string;
  guardId: string;
  shift: 'all' | 'day' | 'night';
  vehicleType: 'all' | 'twoWheeler' | 'threeWheeler' | 'fourWheeler';
  status: 'all' | 'active' | 'exited';
}

const VehicleLog: React.FC = () => {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [guards, setGuards] = useState<{id: string, name: string}[]>([]);
  
  const [filters, setFilters] = useState<FilterOptions>({
    date: '',
    guardId: '',
    shift: 'all',
    vehicleType: 'all',
    status: 'all'
  });

  useEffect(() => {
    fetchVehicles();
    fetchGuards();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vehicles, searchTerm, filters]);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getVehicles();
      setVehicles(response.data);
      setFilteredVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGuards = async () => {
    try {
      const response = await apiService.getGuards();
      setGuards(response.data.map((guard: any) => ({ id: guard.id, name: guard.name })));
    } catch (error) {
      console.error('Error fetching guards:', error);
    }
  };

  const applyFilters = () => {
    let result = [...vehicles];
    
    // Apply search term filter
    if (searchTerm) {
      result = result.filter(vehicle => 
        vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.guardName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply other filters
    if (filters.date) {
      const filterDate = new Date(filters.date).toDateString();
      result = result.filter(vehicle => {
        const entryDate = new Date(vehicle.entryTime).toDateString();
        return entryDate === filterDate;
      });
    }
    
    if (filters.guardId) {
      result = result.filter(vehicle => vehicle.guardId === filters.guardId);
    }
    
    if (filters.shift !== 'all') {
      result = result.filter(vehicle => vehicle.shift === filters.shift);
    }
    
    if (filters.vehicleType !== 'all') {
      result = result.filter(vehicle => vehicle.vehicleType === filters.vehicleType);
    }
    
    if (filters.status !== 'all') {
      result = result.filter(vehicle => vehicle.status === filters.status);
    }
    
    setFilteredVehicles(result);
  };

  const handleFilterChange = (name: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      date: '',
      guardId: '',
      shift: 'all',
      vehicleType: 'all',
      status: 'all'
    });
    setSearchTerm('');
  };

  const exportToCSV = () => {
    const headers = "ID,Vehicle Number,Vehicle Type,Entry Time,Exit Time,Duration,Fees,Guard,Shift,Status\n";
    
    const rows = filteredVehicles.map(vehicle => {
      const entryTime = new Date(vehicle.entryTime);
      const exitTime = vehicle.exitTime ? new Date(vehicle.exitTime) : null;
      const duration = exitTime 
        ? Math.ceil(((exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60 * 24))) 
        : 'N/A';
      
      return [
        vehicle.id,
        vehicle.vehicleNumber,
        vehicle.vehicleType,
        format(entryTime, 'yyyy-MM-dd HH:mm'),
        exitTime ? format(exitTime, 'yyyy-MM-dd HH:mm') : 'N/A',
        duration,
        vehicle.fees || 'N/A',
        vehicle.guardName,
        vehicle.shift,
        vehicle.status
      ].join(',');
    }).join('\n');
    
    const csvContent = `data:text/csv;charset=utf-8,${headers}${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vehicle_log_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'twoWheeler':
        return <Bike className="text-primary-600" size={20} />;
      case 'threeWheeler':
        return <Truck className="text-secondary-600" size={20} />;
      case 'fourWheeler':
      default:
        return <CarFront className="text-accent-600" size={20} />;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {t('admin.vehicleLog.title')}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter size={18} />
            {t('common.filter')}
          </button>
          <button
            onClick={exportToCSV}
            className="btn btn-primary flex items-center gap-2"
          >
            <Download size={18} />
            {t('admin.vehicleLog.export')}
          </button>
        </div>
      </div>
      
      <div className="card p-5 mb-6">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder={t('common.search')}
            className="input pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                {t('admin.vehicleLog.clearFilters')}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.vehicleLog.filterByDate')}
                </label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    className="input pl-10"
                    value={filters.date}
                    onChange={e => handleFilterChange('date', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.vehicleLog.filterByGuard')}
                </label>
                <select
                  className="select"
                  value={filters.guardId}
                  onChange={e => handleFilterChange('guardId', e.target.value)}
                >
                  <option value="">All Guards</option>
                  {guards.map(guard => (
                    <option key={guard.id} value={guard.id}>{guard.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.vehicleLog.filterByShift')}
                </label>
                <select
                  className="select"
                  value={filters.shift}
                  onChange={e => handleFilterChange('shift', e.target.value as any)}
                >
                  <option value="all">All Shifts</option>
                  <option value="day">Day Shift</option>
                  <option value="night">Night Shift</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.vehicleLog.filterByVehicleType')}
                </label>
                <select
                  className="select"
                  value={filters.vehicleType}
                  onChange={e => handleFilterChange('vehicleType', e.target.value as any)}
                >
                  <option value="all">All Types</option>
                  <option value="twoWheeler">Two Wheeler</option>
                  <option value="threeWheeler">Three Wheeler</option>
                  <option value="fourWheeler">Four Wheeler</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="select"
                  value={filters.status}
                  onChange={e => handleFilterChange('status', e.target.value as any)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="exited">Exited</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-600"></div>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('common.noResults')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.vehicleLog.vehicleNumber')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.vehicleLog.vehicleType')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.vehicleLog.entryTime')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.vehicleLog.exitTime')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.vehicleLog.duration')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.vehicleLog.fees')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.vehicleLog.guard')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.vehicleLog.status')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVehicles.map((vehicle) => {
                  const entryTime = new Date(vehicle.entryTime);
                  const exitTime = vehicle.exitTime ? new Date(vehicle.exitTime) : null;
                  const duration = exitTime 
                    ? Math.ceil(((exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60 * 24))) 
                    : '--';
                  
                  return (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{vehicle.vehicleNumber}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {getVehicleIcon(vehicle.vehicleType)}
                          <span className="ml-2">
                            {vehicle.vehicleType === 'twoWheeler' ? 'Two Wheeler' :
                             vehicle.vehicleType === 'threeWheeler' ? 'Three Wheeler' : 'Four Wheeler'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock size={14} className="mr-1" />
                          <span>{format(entryTime, 'dd MMM yyyy, h:mm a')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {exitTime ? format(exitTime, 'dd MMM yyyy, h:mm a') : '--'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {typeof duration === 'number' ? `${duration} days` : '--'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {vehicle.fees ? `₹${vehicle.fees}` : '--'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vehicle.guardName}</div>
                        <div className="text-xs text-gray-500">{vehicle.shift === 'day' ? 'Day Shift' : 'Night Shift'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {vehicle.status === 'active' ? (
                            <span className="flex items-center text-sm text-green-600">
                              <Clock size={14} className="mr-1" />
                              {t('admin.vehicleLog.active')}
                            </span>
                          ) : (
                            <span className="flex items-center text-sm text-gray-600">
                              <CheckCircle size={14} className="mr-1" />
                              {t('admin.vehicleLog.exited')}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleLog;