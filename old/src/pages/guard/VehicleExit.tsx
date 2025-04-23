import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { CarTaxiFront, ArrowLeft, Search, Clock, Calendar, IndianRupee, QrCode as Qr, Check } from 'lucide-react';
import apiService from '../../services/apiService';
import { differenceInHours, format } from 'date-fns';

interface VehicleExitFormInput {
  vehicleNumber: string;
}

interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: 'twoWheeler' | 'threeWheeler' | 'fourWheeler';
  entryTime: string;
  guardName: string;
}

const VehicleExit: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vehicleNumberParam = queryParams.get('vehicleNumber');
  
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [exitProcessed, setExitProcessed] = useState(false);
  const [exitData, setExitData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<VehicleExitFormInput>({
    defaultValues: {
      vehicleNumber: vehicleNumberParam || ''
    }
  });

  // If vehicle number is provided in URL, search for it
  useEffect(() => {
    if (vehicleNumberParam) {
      searchVehicle(vehicleNumberParam);
    }
  }, [vehicleNumberParam]);

  const searchVehicle = async (vehicleNumber: string) => {
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await apiService.getVehicleByNumber(vehicleNumber);
      setVehicle(response.data);
    } catch (error: any) {
      console.error('Error searching for vehicle:', error);
      setVehicle(null);
      
      // Provide more specific error message based on the status code
      if (error?.response?.status === 400 && error?.response?.data?.message === 'Vehicle has already exited') {
        setError(t('guard.vehicleExit.vehicleAlreadyExited'));
      } else {
        setError(error?.response?.data?.message || t('guard.vehicleExit.vehicleNotFound'));
      }
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (data: VehicleExitFormInput) => {
    await searchVehicle(data.vehicleNumber);
  };

  const handleProcessExit = async () => {
    if (!vehicle) return;
    
    setIsProcessing(true);
    
    try {
      const response = await apiService.processVehicleExit(vehicle.id);
      setExitData(response.data);
      setExitProcessed(true);
    } catch (error) {
      console.error('Error processing vehicle exit:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateDuration = (entryTime: string) => {
    const entryDate = new Date(entryTime);
    const now = new Date();
    const hours = differenceInHours(now, entryDate);
    
    if (hours < 24) {
      return `${hours} hours`;
    } else {
      const days = Math.ceil(hours / 24);
      return `${days} days`;
    }
  };

  const handleScanQR = () => {
    // This would integrate with a QR scanner in a real implementation
    alert('QR scanning would be integrated here in a production app.');
  };

  if (exitProcessed && exitData) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/guard')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>{t('common.back')}</span>
          </button>
        </div>
        
        <div className="card p-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <Check size={36} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-2">
              {t('guard.vehicleExit.exitSuccess')}
            </h1>
            <p className="text-gray-600 mb-6">
              The vehicle has been successfully processed for exit.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Vehicle Number</p>
                <p className="font-medium">{exitData.vehicleNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vehicle Type</p>
                <p className="font-medium">
                  {exitData.vehicleType === 'twoWheeler' ? 'Two Wheeler' :
                   exitData.vehicleType === 'threeWheeler' ? 'Three Wheeler' : 'Four Wheeler'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Entry Time</p>
                <p className="font-medium">
                  {format(new Date(exitData.entryTime), 'dd MMM yyyy, h:mm a')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Exit Time</p>
                <p className="font-medium">
                  {format(new Date(exitData.exitTime), 'dd MMM yyyy, h:mm a')}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">
                  {calculateDuration(exitData.entryTime)}
                </p>
              </div>
              <div className="col-span-2 border-t pt-3 mt-2">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold">Total Fees</p>
                  <p className="text-xl font-bold text-primary-700">₹{exitData.fees}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => {
                setExitProcessed(false);
                setVehicle(null);
                setExitData(null);
                setValue('vehicleNumber', '');
              }}
              className="btn btn-primary flex-1"
            >
              Process Another Exit
            </button>
            <button
              onClick={() => navigate('/guard')}
              className="btn border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 flex-1"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/guard')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} className="mr-1" />
          <span>{t('common.back')}</span>
        </button>
      </div>
      
      <div className="card p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-6">
          {t('guard.vehicleExit.title')}
        </h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="vehicleNumber" className="sr-only">
                {t('guard.vehicleExit.vehicleNumber')}
              </label>
              <input
                type="text"
                id="vehicleNumber"
                className={`input ${errors.vehicleNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder={t('guard.vehicleExit.enterVehicleNumber')}
                {...register('vehicleNumber', { 
                  required: t('validation.required')
                })}
              />
              {errors.vehicleNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.vehicleNumber.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isSearching}
              className="btn btn-primary w-auto px-4"
            >
              {isSearching ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Search size={20} />
              )}
            </button>

            <button
              type="button"
              onClick={handleScanQR}
              className="btn border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 w-auto px-4"
            >
              <Qr size={20} />
            </button>
          </div>
        </form>
        
        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {vehicle && (
          <div className="animate-slide-up">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {t('guard.vehicleExit.vehicleDetails')}
            </h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Vehicle Number</p>
                  <p className="font-medium">{vehicle.vehicleNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vehicle Type</p>
                  <p className="font-medium">
                    {vehicle.vehicleType === 'twoWheeler' ? 'Two Wheeler' :
                     vehicle.vehicleType === 'threeWheeler' ? 'Three Wheeler' : 'Four Wheeler'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Guard</p>
                  <p className="font-medium">{vehicle.guardName}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock size={20} className="text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">{t('guard.vehicleExit.entryTime')}</p>
                  <p className="font-medium">
                    {format(new Date(vehicle.entryTime), 'dd MMM yyyy, h:mm a')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Calendar size={20} className="text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">{t('guard.vehicleExit.duration')}</p>
                  <p className="font-medium">
                    {calculateDuration(vehicle.entryTime)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <IndianRupee size={20} className="text-amber-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">{t('guard.vehicleExit.fees')}</p>
                  <p className="font-medium">
                    Calculated on exit: 
                    {vehicle.vehicleType === 'twoWheeler' ? ' ₹50/day' :
                     vehicle.vehicleType === 'threeWheeler' ? ' ₹100/day' : ' ₹200/day'}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleProcessExit}
              disabled={isProcessing}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                <>
                  <CarTaxiFront size={18} />
                  <span>{t('guard.vehicleExit.processExit')}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleExit;