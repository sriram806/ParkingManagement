import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { 
  Save, 
  Bike, 
  Truck, 
  CarFront, 
  IndianRupee 
} from 'lucide-react';
import apiService from '../../services/apiService';

interface PricingFormInput {
  twoWheeler: number;
  threeWheeler: number;
  fourWheeler: number;
}

const PricingSettings: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PricingFormInput>();

  useEffect(() => {
    fetchPricingSettings();
  }, []);

  const fetchPricingSettings = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getPricingSettings();
      setValue('twoWheeler', response.data.twoWheeler);
      setValue('threeWheeler', response.data.threeWheeler);
      setValue('fourWheeler', response.data.fourWheeler);
    } catch (error) {
      console.error('Error fetching pricing settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: PricingFormInput) => {
    setIsSubmitting(true);
    setUpdateSuccess(false);
    
    try {
      await apiService.updatePricingSettings(data);
      setUpdateSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating pricing settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {t('admin.pricingSettings.title')}
      </h1>
      
      <div className="card p-6 max-w-2xl">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {updateSuccess && (
              <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md animate-fade-in">
                {t('admin.pricingSettings.updateSuccess')}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-5 bg-gray-50 border border-gray-200">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                    <Bike size={28} className="text-primary-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-center mb-4">
                  {t('admin.pricingSettings.twoWheelerRate')}
                </h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="number"
                    id="twoWheeler"
                    className={`input pl-9 ${errors.twoWheeler ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    min="1"
                    step="1"
                    {...register('twoWheeler', { 
                      required: t('validation.required'),
                      min: { value: 1, message: 'Price must be at least 1' },
                      valueAsNumber: true
                    })}
                  />
                </div>
                {errors.twoWheeler && (
                  <p className="mt-1 text-sm text-red-600">{errors.twoWheeler.message}</p>
                )}
              </div>
              
              <div className="card p-5 bg-gray-50 border border-gray-200">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-secondary-100 rounded-full flex items-center justify-center">
                    <Truck size={28} className="text-secondary-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-center mb-4">
                  {t('admin.pricingSettings.threeWheelerRate')}
                </h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="number"
                    id="threeWheeler"
                    className={`input pl-9 ${errors.threeWheeler ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    min="1"
                    step="1"
                    {...register('threeWheeler', { 
                      required: t('validation.required'),
                      min: { value: 1, message: 'Price must be at least 1' },
                      valueAsNumber: true
                    })}
                  />
                </div>
                {errors.threeWheeler && (
                  <p className="mt-1 text-sm text-red-600">{errors.threeWheeler.message}</p>
                )}
              </div>
              
              <div className="card p-5 bg-gray-50 border border-gray-200">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-accent-100 rounded-full flex items-center justify-center">
                    <CarFront size={28} className="text-accent-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-center mb-4">
                  {t('admin.pricingSettings.fourWheelerRate')}
                </h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="number"
                    id="fourWheeler"
                    className={`input pl-9 ${errors.fourWheeler ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    min="1"
                    step="1"
                    {...register('fourWheeler', { 
                      required: t('validation.required'),
                      min: { value: 1, message: 'Price must be at least 1' },
                      valueAsNumber: true
                    })}
                  />
                </div>
                {errors.fourWheeler && (
                  <p className="mt-1 text-sm text-red-600">{errors.fourWheeler.message}</p>
                )}
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>{t('common.save')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PricingSettings;